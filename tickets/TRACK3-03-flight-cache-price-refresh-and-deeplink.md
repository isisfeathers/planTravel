# TRACK3-03: 機票短期快取 (20分)、驗價可用性檢查與授權 Deep Link 轉址解析器

* **工單編號**：TRACK3-03
* **所屬軌道**：Track 3 - LINE Bot & 數據 API/機票組
* **建議負責人**：1 人 (數據 API 工程師)
* **優先級**：High (P1)
* **前置依賴 (Dependencies)**：`TRACK3-02`
* **狀態**：ready-for-agent

---

## 0. 開工前確認檢查清單 (Pre-Execution Sign-off / 執行者自檢)
> ⚠️ **執行者開工前必讀・問詢門檻**：動工前請確認以下項目皆已就緒並手動勾選，未確認前置產出前切勿盲目施工：
- [ ] **硬性前置實體產出確認**：TRACK3-02 機票搜尋端點正常運作、Redis / 快取連線設定。
- [ ] **規範與契約理解確認**：清楚 20 分鐘快取 Key 命名、驗價可用性檢查 (Price Refresh) 與聯盟 Deep Link 轉址解析。
- [ ] **紅線與禁止事項確認**：若遇到連續 5 次 429 或 5xx 錯誤，Circuit Breaker 必須啟動熔斷 60 秒。
- [ ] **執行者開工簽核**：我已完全理解本任務之驗收標準與前置交付物，確認無缺漏並正式開工。

---

## 1. 任務說明 (What to Build)
為機票資料取得服務實作 20 分鐘短期快取機制（Redis 或記憶體快取），減少頻繁重複查詢以節省 API 額度。實作二次驗價檢查端點（`POST /api/v1/flights/refresh`），確認票價是否變動或售罄；並實作授權聯盟 Deep Link Resolver，將選定機票安全轉址至航空公司或 OTA 官方結帳頁。此外，整合 Circuit Breaker 熔斷器防止供應商 429 限流。

---

## 2. 輸入與輸出資料規格 (Data Specification)

### 2.1 輸入規格
* 驗價請求：`{ offer_id: string }`。
* 轉址請求：`offer_id`。

### 2.2 輸出規格
* **快取 Key 格式**：`flight:cache:{origin}:{destination}:{date}:{passengers}:{cabin}`，TTL: 1200 秒 (20 分鐘)。
* **驗價回應**：
  * 有效：`{ valid: true, current_price: 14250, deep_link: "https://..." }`。
  * 變價/售罄：`{ valid: false, reason: "PRICE_CHANGED", new_price: 15800 }`。
* **轉址 URL**：附加官方聯盟合作 Tracking ID 之有效深層連結。

---

## 3. 詳細執行步驟 (Step-by-Step Checklist)
- [ ] 整合 Redis 或本地 Cache 模組，實作快取存取層：包含 `source` 標記、`checked_at` 與 `expires_at`。
- [ ] 撰寫 Circuit Breaker 模組：
  - 記錄近 1 分鐘內 429 或 5xx 錯誤計數。
  - 連續 5 次失敗則啟動熔斷 60 秒，自動降級回傳歷史快取。
- [ ] 實作驗價邏輯（Price Refresh）：向供應商發起即時價格核對。
- [ ] 實作 Deep Link Resolver：產生並解析帶有佣金分潤參數之跳轉連結。

---

## 4. 驗收條件 (Acceptance Criteria)
- [ ] 20 分鐘內完全相同條件的機票搜尋，100% 由快取命中回傳（命中時間 $\le 50ms$），不發起外部 API 呼叫。
- [ ] 當遇到第三方供應商 429 限流時，熔斷器能正確生效並切換為降級備援模式。
- [ ] 點選 Deep Link 能精準轉跳至該航班於航司或 OTA 官方之訂位結帳頁面。
