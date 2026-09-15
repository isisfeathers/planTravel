# TRACK2-03: n8n Webhook 觸發、密鑰驗證與用戶配額防刷檢查

* **工單編號**：TRACK2-03
* **所屬軌道**：Track 2 - 後端與 AI 邏輯組 (n8n & Supabase)
* **建議負責人**：1 人 (後端工程師 B)
* **優先級**：Highest (P0)
* **前置依賴 (Dependencies)**：`TRACK2-01`
* **狀態**：ready-for-agent

---

## 0. 開工前確認檢查清單 (Pre-Execution Sign-off / 執行者自檢)
> ⚠️ **執行者開工前必讀・問詢門檻**：動工前請確認以下項目皆已就緒並手動勾選，未確認前置產出前切勿盲目施工：
- [ ] **硬性前置實體產出確認**：TRACK2-01 之 itinerary_jobs 表已建立、n8n 實例已就緒並取得 SUPABASE_WEBHOOK_SECRET。
- [ ] **規範與契約理解確認**：清楚驗證 Webhook Secret，以及查詢每日呼叫次數是否 >= 3 與活躍行程是否 >= 5 的檢查邏輯。
- [ ] **紅線與禁止事項確認**：超限請求必須直接更新 status = "failed" 並終止後續昂貴的 LLM 呼叫，嚴禁放行。
- [ ] **執行者開工簽核**：我已完全理解本任務之驗收標準與前置交付物，確認無缺漏並正式開工。

---

## 1. 任務說明 (What to Build)
在 n8n 建立主工作流的 Ingress 端點。接收來自 Supabase 的 Database Webhook POST 請求，驗證 Header 密鑰；隨後執行使用者配額防護檢查（限制單一用戶當日生成任務 $\le 3$ 次、未封存活躍行程 $\le 5$ 個）。若超限則標註失敗並終止，若合格則將任務狀態推進至處理中。

---

## 2. 輸入與輸出資料規格 (Data Specification)

### 2.1 輸入規格
* Webhook 請求 Header：`X-Webhook-Secret: {{ $env.SUPABASE_WEBHOOK_SECRET }}`。
* Webhook Payload：`{ itinerary_id: string, user_id: string, preference_snapshot: object }`。

### 2.2 輸出規格
* **正常通過**：推進至 Prompt 組裝節點，同時更新 `itinerary_jobs` 狀態為 `generating_itinerary`。
* **配額超限**：
  * 更新 `itinerary_jobs`：`status = 'failed'`, `error_code = 'QUOTA_EXCEEDED'`。
  * 更新 `itineraries`：`status = 'failed'`, `error_message = '今日生成次數已達上限 (3次)'`。

---

## 3. 詳細執行步驟 (Step-by-Step Checklist)
- [ ] 在 n8n 建立 Webhook 節點，配置 POST 方法與路徑 `/webhook/v1/generate-itinerary`。
- [ ] 加入 IF 節點校驗 `X-Webhook-Secret` 密鑰。
- [ ] 加入 Supabase 查詢節點：計算該 `user_id` 在 `itinerary_jobs` 表中今日（UTC 00:00 起）的任務筆數。
- [ ] 計算該用戶名下 `is_archived = false AND deleted_at IS NULL` 的行程數量。
- [ ] 撰寫條件分支：若超限則轉入失敗寫回節點，若合原則推進至後續步驟。

---

## 4. 驗收條件 (Acceptance Criteria)
- [ ] 偽冒的 Webhook 請求（缺少或錯誤的 Secret）會被 100% 拒絕。
- [ ] 單一使用者在第 4 次發送生成請求時，工作流正確被阻擋並寫回 `QUOTA_EXCEEDED` 錯誤。
- [ ] 正常合法的請求能順暢取得所需參數並進入下一節點。
