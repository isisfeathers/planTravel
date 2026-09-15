# TRACK2-04: n8n 動態提示詞查詢與 Master System Prompt 組裝節點

* **工單編號**：TRACK2-04
* **所屬軌道**：Track 2 - 後端與 AI 邏輯組 (n8n & Supabase)
* **建議負責人**：1 人 (後端工程師 B)
* **優先級**：High (P1)
* **前置依賴 (Dependencies)**：`TRACK2-02`、`TRACK2-03`
* **狀態**：ready-for-agent

---

## 0. 開工前確認檢查清單 (Pre-Execution Sign-off / 執行者自檢)
> ⚠️ **執行者開工前必讀・問詢門檻**：動工前請確認以下項目皆已就緒並手動勾選，未確認前置產出前切勿盲目施工：
- [ ] **硬性前置實體產出確認**：TRACK2-02 的種子資料在庫、TRACK2-03 的 Webhook 流程通過驗證。
- [ ] **規範與契約理解確認**：清楚 SQL 查詢邏輯（用戶勾選查對應 key，留白則自動回退 is_default），並按 priority 排序拼接。
- [ ] **紅線與禁止事項確認**：拼裝後的 Prompt 不得有重複指令或字串語法錯誤。
- [ ] **執行者開工簽核**：我已完全理解本任務之驗收標準與前置交付物，確認無缺漏並正式開工。

---

## 1. 任務說明 (What to Build)
在 n8n 中建立 Prompt 組裝邏輯。讀取傳入之 `preference_snapshot`，向 Supabase 查詢對應選項鍵值之 `prompt_directive`；若用戶未做個別選擇，自動回退套用標記為 `is_default = true` 的預設指令；最後依照優先權序號 (`priority`) 將指令拼接為完整的 Master System Prompt。

---

## 2. 輸入與輸出資料規格 (Data Specification)

### 2.1 輸入規格
* `preference_snapshot` 內容（包含 `destination`, `total_days`, `pace`, `accommodation_strategy`, `transit_mode`, `interests`, `event_note`）。

### 2.2 輸出規格
* **組裝輸出（傳給 LLM 之 System Prompt）**：
  * Base System Rules（世界頂級旅遊管家定位、JSON 格式強制約束）。
  * Injected Directives（住宿基地約束、地鐵代碼輸出規範、老饕美食篩選、賽事時間錨點）。
  * User Target Data（目的地、總天數、出發日期區間）。

---

## 3. 詳細執行步驟 (Step-by-Step Checklist)
- [ ] 在 n8n 中建立 Supabase 節點執行 SQL 查詢：
  ```sql
  SELECT option_key, prompt_directive, priority 
  FROM public.prompt_templates 
  WHERE option_key = ANY($1::text[])
     OR option_key = $2
     OR option_key = $3
     OR (is_default = true AND category NOT IN (
         SELECT category FROM public.prompt_templates WHERE option_key = ANY($1::text[])
     ))
  ORDER BY priority ASC;
  ```
- [ ] 撰寫 n8n Code 節點：將多筆查詢結果字串以分行符號與標題組合成單一字串變數 `assembledSystemPrompt`。
- [ ] 加入特殊賽事備註處理：若 `preference_snapshot.event_note` 存在，注入「【絕對時間錨點】活動：{{ event_note }}，當日周邊活動嚴格以此為軸心安排」。
- [ ] 輸出結果提供給 LLM 節點使用。

---

## 4. 驗收條件 (Acceptance Criteria)
- [ ] 當用戶傳入 `interests: ["gourmet", "sports"]` 時，產出的 System Prompt 具備美食與運動賽事的約束語句。
- [ ] 當用戶傳入空陣列 `[]` 時，組裝出的 Prompt 自動包含連住基地、大眾捷運與在地美食之預設約束。
- [ ] 提示詞內容無任何語意衝突或重複段落。
