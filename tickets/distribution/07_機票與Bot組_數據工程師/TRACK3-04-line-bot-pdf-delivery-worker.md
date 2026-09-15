# TRACK3-04: LINE Bot 實體 PDF 檔案渲染與推播 Worker

* **工單編號**：TRACK3-04
* **所屬軌道**：Track 3 - LINE Bot & 數據 API/機票組
* **建議負責人**：1 人 (LINE Bot & 後端工程師)
* **優先級**：Medium (P2)
* **前置依賴 (Dependencies)**：`TRACK3-01`、`TRACK1-09`
* **狀態**：ready-for-agent

---

## 0. 開工前確認檢查清單 (Pre-Execution Sign-off / 執行者自檢)
> ⚠️ **執行者開工前必讀・問詢門檻**：動工前請確認以下項目皆已就緒並手動勾選，未確認前置產出前切勿盲目施工：
- [ ] **硬性前置實體產出確認**：TRACK3-01 LINE Bot 推播能力、Puppeteer 執行環境、TRACK1-09 列印頁面 URL。
- [ ] **規範與契約理解確認**：清楚後端無頭瀏覽器渲染 A4 PDF、上傳 Supabase Storage 並透過 LINE Bot 發送實體檔案。
- [ ] **紅線與禁止事項確認**：PDF 渲染必須等待字體與圖片完全加載，檔案大小控制在 5MB 內。
- [ ] **執行者開工簽核**：我已完全理解本任務之驗收標準與前置交付物，確認無缺漏並正式開工。

---

## 1. 任務說明 (What to Build)
實作後端無頭瀏覽器（Puppeteer / Playwright）PDF 渲染 Worker 與 LINE Bot 文件推送功能。當用戶於 LINE 內嵌瀏覽器點擊「傳送 PDF 到 LINE 聊天室」時，Worker 非同步載入專色列印樣板網頁，產生標準 A4 PDF 檔案上傳至 Supabase Storage，隨後透過 LINE Messaging API 發送 `file` 訊息類型，將實體 PDF 直接推送至用戶的 LINE 對話視窗。

---

## 2. 輸入與輸出資料規格 (Data Specification)

### 2.1 輸入規格
* 觸發端點請求：`POST /functions/v1/export-pdf-line`，攜帶 `{ itinerary_id: string }` 與使用者 JWT。

### 2.2 輸出規格
* 產出檔案：A4 規格 PDF 檔案（檔案大小建議小於 5MB）。
* 儲存位置：Supabase Storage `itinerary-pdfs` Bucket（時效 URL）。
* LINE 訊息型態：
  ```json
  {
    "type": "file",
    "title": "東京5天4夜自由行行程表.pdf",
    "fileUrl": "https://storage.atrip.app/.../itinerary.pdf"
  }
  ```

---

## 3. 詳細執行步驟 (Step-by-Step Checklist)
- [ ] 撰寫 Puppeteer / Playwright 渲染腳本：
  - 載入行程之列印網址 `/print/[id]?token=secret`。
  - 等待字體與圖示加載完成 (`networkidle0`)。
  - 呼叫 `page.pdf({ format: 'A4', printBackground: true, margin: { top: '15mm', bottom: '15mm' } })`。
- [ ] 將生成的 PDF Buffer 上傳至 Supabase Storage，取得唯讀下載 URL。
- [ ] 呼叫 LINE Messaging API 發送 `file` 訊息推送文件給該使用者。
- [ ] 實作任務隊列（Queue）或非同步 Worker，避免並發列印消耗過多伺服器記憶體。

---

## 4. 驗收條件 (Acceptance Criteria)
- [ ] 產出之 PDF 檔案解析度清晰、中文字型完整無缺字亂碼，且分頁無斷行破圖。
- [ ] 請求送出後 30 秒內，用戶之 LINE 聊天室順利接收到實體 PDF 檔案附件。
- [ ] 用戶可在 LINE 內直接點擊下載、儲存或轉傳該 PDF 檔案。
