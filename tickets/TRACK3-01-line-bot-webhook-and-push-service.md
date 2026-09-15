# TRACK3-01: LINE Messaging API Webhook 接收與 Bubble Flex Message 推播服務

* **工單編號**：TRACK3-01
* **所屬軌道**：Track 3 - LINE Bot & 數據 API/機票組
* **建議負責人**：1 人 (LINE Bot & 後端工程師)
* **優先級**：High (P1)
* **前置依賴 (Dependencies)**：`TRACK0-04`
* **狀態**：ready-for-agent

---

## 0. 開工前確認檢查清單 (Pre-Execution Sign-off / 執行者自檢)
> ⚠️ **執行者開工前必讀・問詢門檻**：動工前請確認以下項目皆已就緒並手動勾選，未確認前置產出前切勿盲目施工：
- [ ] **硬性前置實體產出確認**：LINE Developers Messaging API Channel Secret & Token、TRACK0-04 的 Flex 卡片 JSON 範本。
- [ ] **規範與契約理解確認**：清楚驗證 x-line-signature，以及發送 Bubble Flex Message 推播通知（綁定 LIFF 深度連結）。
- [ ] **紅線與禁止事項確認**：嚴禁忽略簽章驗證，推播失敗必須有記錄與重試防護。
- [ ] **執行者開工簽核**：我已完全理解本任務之驗收標準與前置交付物，確認無缺漏並正式開工。

---

## 1. 任務說明 (What to Build)
實作 LINE Messaging API Webhook 伺服器與主動推播模組。處理用戶在 LINE 官方帳號的對話訊息（讀取 `profiles.active_itinerary_id` 作為上下文回覆）；並提供推播端點供 n8n 呼叫，在行程生成完成或失敗時，主動發送依照 `TRACK0-04` 規範設計的 Bubble Flex Message 卡片至用戶對話框。

---

## 2. 輸入與輸出資料規格 (Data Specification)

### 2.1 輸入規格
* n8n 呼叫之推播請求 Payload：
  ```json
  {
    "line_user_id": "string",
    "itinerary_id": "string",
    "trip_title": "string",
    "destination": "string",
    "total_days": 5,
    "tags": ["在地老饕", "大眾運輸"]
  }
  ```

### 2.2 輸出規格
* 發送至 LINE 官方端點：`POST https://api.line.me/v2/bot/message/push`。
* 輸出符合 LINE Flex Message 規範之 Bubble JSON 物件。

---

## 3. 詳細執行步驟 (Step-by-Step Checklist)
- [ ] 於 LINE Developers Console 配置 Messaging API Channel，設定 Webhook URL。
- [ ] 撰寫 Webhook 處理程式（Express / Fastify 或 Supabase Edge Function）：
  - 驗證 LINE 簽章 `x-line-signature`。
  - 當用戶傳送文字訊息時，查詢資料庫取得其 `active_itinerary_id`，回覆行程摘要。
- [ ] 封裝 `pushItineraryReadyMessage` 函式：
  - 帶入 `TRACK0-04` 設計之 Flex Message JSON。
  - 注入自訂標題、天數、特色標籤與專屬 LIFF 開啟連結。
- [ ] 實作重試與錯誤監控（防止 LINE 429 限流或 Token 過期）。

---

## 4. 驗收條件 (Acceptance Criteria)
- [ ] LINE Webhook 簽章驗證能 100% 阻擋偽造的假請求。
- [ ] 呼叫推播端點後，目標使用者的 LINE 聊天室能在 2 秒內收到排版精美的 Flex Message 氣泡卡片。
- [ ] 點擊卡片上的「開啟 Atrip 專屬行程」按鈕，能無縫開啟 LIFF 並正確定向至該行程。
