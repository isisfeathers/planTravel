# TRACK2-05: LLM Structured Output (JSON Mode) 整合與行李清單生成

* **工單編號**：TRACK2-05
* **所屬軌道**：Track 2 - 後端與 AI 邏輯組 (n8n & Supabase)
* **建議負責人**：1 人 (後端工程師 A)
* **優先級**：Highest (P0)
* **前置依賴 (Dependencies)**：`TRACK0-000`、`TRACK2-04`
* **狀態**：ready-for-agent

---

## 0. 開工前確認檢查清單 (Pre-Execution Sign-off / 執行者自檢)
> ⚠️ **執行者開工前必讀・問詢門檻**：動工前請確認以下項目皆已就緒並手動勾選，未確認前置產出前切勿盲目施工：
- [ ] **硬性前置實體產出確認**：TRACK0-000 的 atrip_itinerary_schema、OpenAI API Key、TRACK2-04 拼裝之 Prompt。
- [ ] **規範與契約理解確認**：清楚配置 model: "gpt-4o", temperature: 0.2, response_format: { type: "json_schema" }。
- [ ] **紅線與禁止事項確認**：嚴禁使用非 Strict 模式，回傳字串必須 100% 通過 Schema 驗證，並包含智能行李清單。
- [ ] **執行者開工簽核**：我已完全理解本任務之驗收標準與前置交付物，確認無缺漏並正式開工。

---

## 1. 任務說明 (What to Build)
在 n8n 中整合 OpenAI API（使用 `gpt-4o` 模型）。將組裝好的 Master System Prompt 注入，啟用 `response_format: { type: "json_schema", json_schema: atrip_itinerary_schema }`，強制要求 LLM 輸出 100% 結構化的每日時間軸、景點經緯度坐標、交通轉乘指引，以及依據目的地氣候與天數生成的智能行李打包清單（`packing_list`）。

---

## 2. 輸入與輸出資料規格 (Data Specification)

### 2.1 輸入規格
* 由 `TRACK2-04` 組裝之 Master System Prompt。
* 用戶旅行基本參數（目的地、天數、月份、節奏、賽事時間備註）。

### 2.2 輸出規格
* 符合 [Final SPEC/03-行程與偏好-JSON-Schema規格書.md](../Final%20SPEC/03-行程與偏好-JSON-Schema規格書.md) 定義之純 JSON 字串：
  * `meta` 物件。
  * `daily_itinerary` 陣列（長度等於 `total_days`）。
  * `transit_overview` 與 `recommendations`。
  * `packing_list`（分類包含 `essentials`, `clothing`, `electronics`, `toiletries`）。

---

## 3. 詳細執行步驟 (Step-by-Step Checklist)
- [ ] 在 n8n 中建立 OpenAI 或 HTTP Request 節點呼叫 `https://api.openai.com/v1/chat/completions`。
- [ ] 配置模型參數：`model: "gpt-4o"`, `temperature: 0.2`。
- [ ] 於 Body 注入 `response_format`，帶入完整之 `atrip_itinerary_schema` 定義。
- [ ] 撰寫錯誤重試邏輯：若遭遇 5xx 或連線逾時，自動重試最多 2 次，重試間隔 3 秒。
- [ ] 解析回傳字串，執行格式與基本語意校驗。

---

## 4. 驗收條件 (Acceptance Criteria)
- [ ] 呼叫 OpenAI 產出的字串 100% 能被 `JSON.parse()` 解析，無截斷或 Markdown 圍欄。
- [ ] 產出的 `daily_itinerary` 天數完全等於請求總天數，活動座標皆為合理數值。
- [ ] 產出之 `packing_list` 至少包含 5 項以上的打包物品，且分類合理。
