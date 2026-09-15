# TRACK2-06: n8n 資料清洗、ID 注入、原子性寫入與異常重試機制

* **工單編號**：TRACK2-06
* **所屬軌道**：Track 2 - 後端與 AI 邏輯組 (n8n & Supabase)
* **建議負責人**：1 人 (後端工程師 B)
* **優先級**：Highest (P0)
* **前置依賴 (Dependencies)**：`TRACK2-05`、`TRACK3-02`
* **狀態**：ready-for-agent

---

## 0. 開工前確認檢查清單 (Pre-Execution Sign-off / 執行者自檢)
> ⚠️ **執行者開工前必讀・問詢門檻**：動工前請確認以下項目皆已就緒並手動勾選，未確認前置產出前切勿盲目施工：
- [ ] **硬性前置實體產出確認**：TRACK2-05 LLM 輸出、TRACK3-02 機票資料、Supabase 寫入金鑰。
- [ ] **規範與契約理解確認**：清楚合併兩者資料、為每個 activity 注入唯一 id、同步原子性更新 itineraries 與 itinerary_jobs。
- [ ] **紅線與禁止事項確認**：嚴禁遺漏全域 Error Catch 節點，任何錯誤必須更新 Job 為 failed，絕不讓任務卡在佇列。
- [ ] **執行者開工簽核**：我已完全理解本任務之驗收標準與前置交付物，確認無缺漏並正式開工。

---

## 1. 任務說明 (What to Build)
在 n8n 中將 LLM 產出之行程資料與機票取得服務 (AFS) 傳回之航班陣列進行合併。為每個活動項目注入全行程唯一的 `id`（確保前端拖曳重排相容性），隨後以原子性操作將資料寫入 Supabase `itineraries`（更新 `status = 'completed'`）與 `itinerary_jobs`（更新 `status = 'completed'`），並建立異常 Catch 容錯與重試節點。

---

## 2. 輸入與輸出資料規格 (Data Specification)

### 2.1 輸入規格
* LLM 輸出之 `ItineraryPayload`。
* AFS 輸出之 `FlightOfferItem[]`。
* 任務識別碼：`itinerary_id` 與 `job_id`。

### 2.2 輸出規格
* **資料庫寫入操作**：
  * UPDATE `public.itineraries`：
    * `itinerary_data` = 清洗後的完整 JSONB 物件。
    * `flight_data` = 機票報價 JSONB 陣列。
    * `status` = `'completed'`。
  * UPDATE `public.itinerary_jobs`：
    * `status` = `'completed'`, `completed_at` = `NOW()`。

---

## 3. 詳細執行步驟 (Step-by-Step Checklist)
- [ ] 撰寫 n8n JavaScript Code 節點：
  - 迭代 `daily_itinerary[].activities[]`。
  - 檢查每個 activity 是否有 `id`，若無則生成 `act-d{day}-{index}-{uuid_short}` 賦值。
- [ ] 撰寫 Supabase Update 節點：將合併清洗完成的資料原子性寫入 `itineraries`。
- [ ] 同步更新 `itinerary_jobs` 狀態為 `completed`。
- [ ] 建立全局 Error Trigger 節點：
  - 捕獲工作流任何非預期例外。
  - 將 `itinerary_jobs` 狀態更新為 `failed`，寫入詳細 `error_code` 與 `error_message`。

---

## 4. 驗收條件 (Acceptance Criteria)
- [ ] 資料庫中儲存的 `itinerary_data` 中，每一個 activity 都有全域唯一的字串 `id`。
- [ ] 行程主表與任務表之狀態在同一次工作流中同步更新為 `completed`。
- [ ] 若刻意注入異常測試資料，工作流能安全觸發 Error 節點，資料庫狀態正確轉為 `failed` 而非無限卡在進行中。
