# 04 機票資料取得服務規格書 (Flight Data Acquisition Service Specification)

* **專案代號**：Project Atrip
* **模組代號**：Atrip Flight Service (AFS)
* **架構基準**：整合 Lucas 技術提案、業界 GDS/OTA 實務與系統可靠性架構
* **版本**：v2.0.0

---

## 1. 模組定位與邊界宣告 (Architecture Positioning)

### 1.1 核心定調：拒絕非授權網站爬蟲
* **技術風險與合規挑戰**：
  * **動態渲染與反爬封鎖**：消費者機票網站（如 Google Flights、OTA、航空公司官網）具備高強度機器人偵測（Akamai / Cloudflare / CAPTCHA）、頻繁的 DOM 改版與 IP 封鎖機制。
  * **法務條款風險 (TOS Violation)**：商業未經授權爬取機票價格常引發法律糾紛與服務中斷。
* **正式定調**：
  本專案正式將機票模組命名為**「機票資料取得服務 (Flight Data Acquisition Service)」**。
  全面採用**合法授權 Flight Shopping API**（如 Amadeus Self-Service / Skyscanner Partner API）與**聯盟 Deep Link 轉址 API**，以供應商中立的 **Adapter 架構** 徹底隔絕單一供應商鎖定。

### 1.2 MVP 範圍界定
* **MVP 納入範圍**：
  1. 航線與日期搜尋（支援單程 / 來回、出發地與目的地城市/機場代碼轉換）。
  2. 航班組合去重與多維度評分（依總價、航程耗時、轉機次數、行李額度綜合評分）。
  3. 短期報價快取（TTL: 15 ~ 30 分鐘）。
  4. 授權跳轉導流（透過 Affiliate Deep Link 引導用戶至航空公司或 OTA 官方頁面結帳）。
  5. 驗價與即時可用性檢查（Price Refresh & Availability Check）。
* **MVP 明確排除 (Out of Scope)**：
  * ❌ 站內收取信用卡金流。
  * ❌ 建立 PNR (Passenger Name Record) 與旅客護照資料蒐集。
  * ❌ 站內劃位、出票 (Ticketing) 與退改簽售後客服責任。

---

## 2. 系統架構與資料流拓撲 (Data Flow Topology)

```mermaid
flowchart TD
    User([使用者 / Atrip 行程規劃器]) -->|起訖、日期、人數、艙等| API[Flight Search API]
    API --> InputValidate[輸入驗證與 IATA 機場代碼轉換]
    InputValidate --> Orchestrator[Search Orchestrator 搜尋調度器]

    subgraph Provider_Adapters["供應商連接層 (Provider Adapter Layer)"]
        Orchestrator -->|主要 API 查詢| AdapterA[Provider Adapter A: Amadeus API]
        Orchestrator -->|備份 / 聯盟查詢| AdapterB[Provider Adapter B: Skyscanner API]
        Orchestrator -.->|未來 Phase 2| AdapterC[GDS / NDC Adapter 訂位出票]
    end

    AdapterA --> Normalize[資料正規化與去重 Normalization & Dedup]
    AdapterB --> Normalize

    Normalize --> Scoring[排序與行程評分 (總價 / 耗時 / 轉機 / 行李)]
    Scoring --> Cache[(短期快取 Redis / DB<br>含來源與 expires_at)]
    Cache --> Results[前端機票推薦與結果卡片]

    Results -->|使用者點擊選定航班| RefreshCheck{Price Refresh / 驗價檢查}
    RefreshCheck -- 變價或售罄 --> Requery[提示價格異動，刷新結果頁]
    Requery --> Results
    RefreshCheck -- 價格有效 --> DeepLinkResolver[授權 Deep Link Resolver]
    DeepLinkResolver --> MerchantCheckout[導向航空公司 / OTA 官方結帳頁]

    subgraph Governance["可靠性與治理 (Reliability & Governance)"]
        Orchestrator -.-> Monitor[延遲、429 限流、錯誤率、價差監控稽核]
        Orchestrator -.-> CircuitBreaker[Circuit Breaker 熔斷器 / Provider Fallback]
    end
```

---

## 3. 核心處理節點技術規格 (Component Specifications)

### 3.1 IATA 機場代碼解析器 (Airport Code Resolver)
* **輸入**：使用者選擇之城市名稱（例如：`東京`、`大阪`、`台北`）。
* **邏輯**：
  * 內建高頻城市代碼字典（例如：台北 $\rightarrow$ `TPE / TSA`；東京 $\rightarrow$ `HND / NRT`；大阪 $\rightarrow$ `KIX / ITM`）。
  * 若為多機場城市（如東京），支援大都會代碼（All Airports Code: `TYO`）或同時平行查詢 `NRT` 與 `HND`。

### 3.2 搜尋調度器 (Search Orchestrator) 與 熔斷器 (Circuit Breaker)
* **並發與超時控制**：
  * 呼叫供應商 API 之超時閥值設為 **4.5 秒**。
  * 實作狀態機熔斷機制（Circuit Breaker）：
    * 若某供應商在 1 分鐘內出現連續 5 次錯誤（5xx 或 429 Too Many Requests），將該 Adapter 標記為 `OPEN` 狀態 60 秒，自動切換至備用 Adapter 或回傳精準快取降級資料。

### 3.3 資料正規化與去重 (Normalization & Deduplication)
* 不論底層來自 Amadeus 或 Skyscanner，所有航班輸出強制轉換為標準 `FlightOfferItem` 模型。
* **去重主鍵 (Dedup Key)**：
  `MD5(outbound_airline_code + outbound_flight_no + departure_time + arrival_time)`。
  若多家供應商回傳同一航班，保留報價最低且包含免費托運行李者。

### 3.4 航班評分演算法 (Flight Scoring Algorithm)
系統採用加權評分公式，綜合考量價格、耗時與轉機懲罰：

$$Score = 100 - \left( \frac{Price - Price_{min}}{Price_{max} - Price_{min}} \times 40 \right) - \left( \frac{Duration - Duration_{min}}{Duration_{max} - Duration_{min}} \times 35 \right) - (Stops \times 15) + (BaggageBonus \times 10)$$

* 系統依 $Score$ 由高至低排序，向使用者推薦前 3 組「最推薦」、「最低價」、「直飛最快」之航班組合。

### 3.5 短期快取策略 (Short-term Caching)
* **Key 命名規格**：`flight:cache:{origin}:{destination}:{date}:{passengers}:{cabin}`
* **快取時效 (TTL)**：**20 分鐘**。
* **快取資料結構**：包含資料來源標籤 (`source`)、查詢時間戳 (`checked_at`) 與失效時間 (`expires_at`)。

### 3.6 驗價與授權 Deep Link 轉址 (Price Refresh & Deep Link Resolver)
* 當用戶在行程中決定選擇特定機票組合時，系統發動二次驗價（Flight Offers Price API）：
  * **價格浮動 $\le 5\%$**：允許通過並跳出微幅變價提示。
  * **機位售罄 (Sold Out) 或 價差 $> 5\%$**：提示用戶機票已售罄，並觸發重新搜尋。
  * **價格確認**：透過 Deep Link Resolver 注入官方 Affiliate Partner Tracking ID，安全轉址至航司或 OTA 完成外部開票。

---

## 4. 異常處理與降級方案 (Fallback & Resilience)

| 異常情境 | 系統偵測指標 | 自動應對策略 |
| :--- | :--- | :--- |
| **供應商 API 配額超限 (429 Rate Limit)** | HTTP Status 429 | 1. 觸發 Circuit Breaker 暫停該來源。<br>2. 啟動 Provider Fallback 切換次要來源。<br>3. 若無可用來源，回傳歷史快取價格並標註「參考報價」。 |
| **第三方搜尋超時 (> 4.5s)** | Request Timeout | 中斷連線，不阻塞 AI 行程生成；行程畫布先行渲染，機票卡片以 Skeleton 繼續於背景補查。 |
| **無直飛或航線查無結果** | Empty Result Array | 自動放寬條件查詢鄰近機場（例如：查無松山-羽田則自動補查桃園-成田）。 |
