# TRACK2-02: 動態提示詞範本庫 (prompt_templates) 種子資料與管理機制

* **工單編號**：TRACK2-02
* **所屬軌道**：Track 2 - 後端與 AI 邏輯組 (n8n & Supabase)
* **建議負責人**：1 人 (後端工程師 A)
* **優先級**：High (P1)
* **前置依賴 (Dependencies)**：`TRACK2-01`
* **狀態**：ready-for-agent

---

## 0. 開工前確認檢查清單 (Pre-Execution Sign-off / 執行者自檢)
> ⚠️ **執行者開工前必讀・問詢門檻**：動工前請確認以下項目皆已就緒並手動勾選，未確認前置產出前切勿盲目施工：
- [ ] **硬性前置實體產出確認**：TRACK2-01 之 prompt_templates 資料表已成功建立。
- [ ] **規範與契約理解確認**：清楚 8 組種子資料的 category、option_key、prompt_directive、is_default 與 priority。
- [ ] **紅線與禁止事項確認**：每個 category 必須有且僅有一組 is_default = true 的預設項，option_key 嚴格小寫底線命名。
- [ ] **執行者開工簽核**：我已完全理解本任務之驗收標準與前置交付物，確認無缺漏並正式開工。

---

## 1. 任務說明 (What to Build)
在 `prompt_templates` 資料表中灌入完整的種子資料（Seed Data），涵蓋住宿策略（連住基地 vs 分區換宿行李）、交通方式（大眾捷運出口路線代碼 vs 租車自駕停車提示）、主題興趣（在地老饕、逛街、運動賽事時間錨點）之具體 Prompt 約束指令，並配置預設項（`is_default = true`），確保後台可隨時熱更新。

---

## 2. 輸入與輸出資料規格 (Data Specification)

### 2.1 輸入規格
* [Final SPEC/02-資料庫設計與SQL-DDL.md](../Final%20SPEC/02-資料庫設計與SQL-DDL.md) 第 4 節定義之種子資料矩陣。

### 2.2 輸出規格
* `prompt_templates` 資料表內建置至少 8 組標準範本：
  * `single_hotel` (is_default: true, priority: 10)
  * `switch_hotel` (is_default: false, priority: 10)
  * `public_transit` (is_default: true, priority: 20)
  * `self_drive` (is_default: false, priority: 20)
  * `gourmet` (is_default: true, priority: 30)
  * `shopping` (is_default: false, priority: 30)
  * `sports` (is_default: false, priority: 30)
  * `cultural` (is_default: true, priority: 30)

---

## 3. 詳細執行步驟 (Step-by-Step Checklist)
- [ ] 撰寫 SQL Seed Script，將各選項之約束詞句 INSERT 入庫。
- [ ] 驗證每條 `prompt_directive` 語氣強烈且邊界明確（如強制約束以第 1 晚飯店為 basecamp、強制輸出地鐵線路名稱）。
- [ ] 於 Supabase Studio 測試單條修改，確認可在不停機情況下即時反映變更。
- [ ] 撰寫資料查詢 View 或 RPC 供 n8n 呼叫。

---

## 4. 驗收條件 (Acceptance Criteria)
- [ ] 種子資料完整入庫，`option_key` 與前端標籤代碼 100% 吻合。
- [ ] 每個分類（category）均具備唯一一組標註為 `is_default = true` 的退回選項。
