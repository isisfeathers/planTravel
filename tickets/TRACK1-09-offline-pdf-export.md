# TRACK1-09: 離線 PDF 匯出 (瀏覽器列印樣板與 LINE Bot 檔案推送)

* **工單編號**：TRACK1-09
* **所屬軌道**：Track 1 - 前端開發組 (LIFF Web App)
* **建議負責人**：1 人 (前端工程師 A)
* **優先級**：Medium (P2)
* **前置依賴 (Dependencies)**：`TRACK1-05`、`TRACK0-05`、`TRACK3-04`
* **狀態**：ready-for-agent

---

## 0. 開工前確認檢查清單 (Pre-Execution Sign-off / 執行者自檢)
> ⚠️ **執行者開工前必讀・問詢門檻**：動工前請確認以下項目皆已就緒並手動勾選，未確認前置產出前切勿盲目施工：
- [ ] **硬性前置實體產出確認**：TRACK1-05 頁面就緒、TRACK0-05 列印 CSS 規則已到手、TRACK3-04 PDF Worker 端點已發布。
- [ ] **規範與契約理解確認**：清楚環境判斷：非 LINE 瀏覽器調用 window.print()，LINE 內嵌瀏覽器發送 API 請求後端推送至對話框。
- [ ] **紅線與禁止事項確認**：列印模式下嚴禁出現導航列、按鈕與浮動元素。
- [ ] **執行者開工簽核**：我已完全理解本任務之驗收標準與前置交付物，確認無缺漏並正式開工。

---

## 1. 任務說明 (What to Build)
實作離線 PDF 匯出功能。前端實現專用 `@media print` CSS 列印樣式表，支援桌面與外部瀏覽器之一鍵列印與儲存為 PDF；針對 LINE 內建瀏覽器環境（阻擋 Blob 下載），提供「傳送 PDF 到 LINE 聊天室」按鈕，呼叫後端產生並透過 LINE Bot 檔案推播完成閉環。

---

## 2. 輸入與輸出資料規格 (Data Specification)

### 2.1 輸入規格
* [Final SPEC/01-產品需求規格與使用者流程(PRD).md](../Final%20SPEC/01-產品需求規格與使用者流程(PRD).md) 與 `TRACK0-05` 列印規範。
* 當前行程之完整資料。

### 2.2 輸出規格
* **環境判斷與執行**：
  * **非 LINE 環境**：直接觸發 `window.print()`，由瀏覽器原生列印視窗導出。
  * **LINE 內嵌環境**：發送請求至後端 `POST /functions/v1/export-pdf-line`，由 LINE Bot 推播實體檔案。

---

## 3. 詳細執行步驟 (Step-by-Step Checklist)
- [ ] 撰寫 `@media print` 樣式規則：
  - 強制邊距 `15mm`，設定背景列印 `print-color-adjust: exact`。
  - 對所有卡片加入 `break-inside: avoid` 防止分頁腰斬。
  - 隱藏導覽列、Tab 切換按鈕與浮動元素。
- [ ] 實作環境偵測函式：判斷 `liff.isInClient()`。
- [ ] 若在 LINE 內，點擊按鈕彈出確認框並呼叫後端 API，顯示提示「PDF 檔案將於 30 秒內直接傳送至您的 LINE 對話框」。

---

## 4. 驗收條件 (Acceptance Criteria)
- [ ] 桌面與外部瀏覽器點擊列印，A4 預覽無版面破損，換頁乾淨無字體腰斬。
- [ ] 在 LINE 內建瀏覽器點擊按鈕，成功發出 API 請求並提示成功訊息。
