# TRACK3-02: 機票資料取得服務 (AFS) 搜尋調度器、供應商 Adapters 與評分演算法

* **工單編號**：TRACK3-02
* **所屬軌道**：Track 3 - LINE Bot & 數據 API/機票組
* **建議負責人**：1 人 (數據 API 工程師)
* **優先級**：Highest (P0)
* **前置依賴 (Dependencies)**：`TRACK0-000`
* **狀態**：ready-for-agent

---

## 0. 開工前確認檢查清單 (Pre-Execution Sign-off / 執行者自檢)
> ⚠️ **執行者開工前必讀・問詢門檻**：動工前請確認以下項目皆已就緒並手動勾選，未確認前置產出前切勿盲目施工：
- [ ] **硬性前置實體產出確認**：mock_itinerary.json 的 flight_data 結構、Amadeus / Skyscanner 授權 API Keys。
- [ ] **規範與契約理解確認**：清楚 IATA 機場解析、4.5 秒超時預算、去重演算法與加權評分公式。
- [ ] **紅線與禁止事項確認**：嚴禁對消費者網站發起任何 DOM 爬蟲，超時必須優雅降級不阻塞主行程。
- [ ] **執行者開工簽核**：我已完全理解本任務之驗收標準與前置交付物，確認無缺漏並正式開工。

---

## 1. 任務說明 (What to Build)
實作獨立的「機票資料取得服務 (Flight Data Acquisition Service - AFS)」。徹底落實 Lucas 技術提案，絕不爬取消費者網站。建立 IATA 機場代碼解析器、Search Orchestrator 搜尋調度器、供應商 Adapter（對接 Amadeus / Skyscanner 合法授權 API）、航班資料正規化與去重機制，以及包含價格、時間、轉機次數、行李額度的加權評分演算法。

---

## 2. 輸入與輸出資料規格 (Data Specification)

### 2.1 輸入規格
* 搜尋請求參數：`origin` (如 TPE/TSA), `destination` (如 HND/NRT), `departure_date`, `return_date`, `adults`, `cabin`。

### 2.2 輸出規格
* 符合 [Final SPEC/03-行程與偏好-JSON-Schema規格書.md](../Final%20SPEC/03-行程與偏好-JSON-Schema規格書.md) 定義之 `FlightOfferItem[]` 正規化陣列（保留綜合評分最高的前 3~5 組推薦航班）。

---

## 3. 詳細執行步驟 (Step-by-Step Checklist)
- [ ] 撰寫 IATA 機場代碼對照庫（支援城市名稱至機場三字碼之雙向轉換）。
- [ ] 實作抽象 `FlightProviderAdapter` 介面：
  - 實作 `AmadeusAdapter`：呼叫 Amadeus Flight Offers Search API。
  - 實作 `SkyscannerAdapter`：呼叫 Skyscanner Live Pricing API。
- [ ] 撰寫 `SearchOrchestrator`：
  - 設定超時閥值為 4.5 秒。
  - 平行呼叫 Adapters，聚合各來源資料。
- [ ] 實作資料正規化與去重演算法：以 `MD5(airline + flight_no + departure_time)` 為鍵進行去重，優先保留含免費托運行李且價低者。
- [ ] 實作加權評分公式：
  $$Score = 100 - (PriceNorm \times 40) - (DurationNorm \times 35) - (Stops \times 15) + (BaggageBonus \times 10)$$
- [ ] 提供標準 REST 搜尋端點：`GET /api/v1/flights/search`。

---

## 4. 驗收條件 (Acceptance Criteria)
- [ ] 輸入「台北」到「東京」，系統能正確轉換為 TPE/TSA 至 NRT/HND 並發送合法 API 請求。
- [ ] 產出的資料結構 100% 吻合 `FlightOfferItem`，包含航空公司代碼、航班編號、起降時間與行李額度。
- [ ] 航班評分演算法能正確將直飛、含行李且價格合理的航班排於首位。
- [ ] 任何第三方連線若超過 4.5 秒，調度器能強制截斷並回傳已取得之資料，絕不拖垮主行程。
