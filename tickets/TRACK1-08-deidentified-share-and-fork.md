# TRACK1-08: 去識別化外連分享視圖與社群複製 (Fork) 交易

* **工單編號**：TRACK1-08
* **所屬軌道**：Track 1 - 前端開發組 (LIFF Web App)
* **建議負責人**：1 人 (前端工程師 B)
* **優先級**：High (P1)
* **前置依賴 (Dependencies)**：`TRACK1-05`、`TRACK2-01`
* **狀態**：ready-for-agent

---

## 0. 開工前確認檢查清單 (Pre-Execution Sign-off / 執行者自檢)
> ⚠️ **執行者開工前必讀・問詢門檻**：動工前請確認以下項目皆已就緒並手動勾選，未確認前置產出前切勿盲目施工：
- [ ] **硬性前置實體產出確認**：TRACK1-05 行程資料結構就緒、Supabase 公開分享 RLS 政策已生效。
- [ ] **規範與契約理解確認**：清楚去識別化保護（遮蔽作者姓名、頭貼與預算），以及訪客點擊 Fork 引導 LINE 登入並複製副本的流程。
- [ ] **紅線與禁止事項確認**：未登入訪客請求時，後端或前端嚴禁將作者 user_id 與預算數字回傳至 DOM。
- [ ] **執行者開工簽核**：我已完全理解本任務之驗收標準與前置交付物，確認無缺漏並正式開工。

---

## 1. 任務說明 (What to Build)
實作外連分享頁面路由 (`/share/[share_token]`)。未登入訪客可直接瀏覽去識別化的行程內容（嚴格遮蔽作者個資與預算數字）。在頁面頂部常駐「複製到我的行程 (Fork)」按鈕，訪客點擊後若未登入引導 LINE 免密授權，登入後將整份行程複製成為自己帳號名下的全新行程副本，並立即轉導進入編輯主畫布。

---

## 2. 輸入與輸出資料規格 (Data Specification)

### 2.1 輸入規格
* 路由參數：`share_token` (UUID)。
* 公開 API 查詢：`GET /rest/v1/itineraries?share_token=eq.:token&is_public=eq.true&deleted_at=is.null`。

### 2.2 輸出規格
* **Fork 交易 API 呼叫 (`POST /rest/v1/itineraries`)**：
  ```json
  {
    "user_id": "<current_user_id>",
    "forked_from_id": "<source_itinerary_id>",
    "title": "東京 5 天 4 夜慢活文藝與在地美食探索 (副本)",
    "destination": "東京",
    "status": "completed",
    "preference_snapshot": { ... },
    "itinerary_data": { ... },
    "flight_data": [ ... ]
  }
  ```

---

## 3. 詳細執行步驟 (Step-by-Step Checklist)
- [ ] 刻劃 `/share/[share_token]` 專用版面，自動隱藏所有拖曳手柄、刪除按鈕、底部浮動列與作者個資。
- [ ] 撰寫一鍵複製分享連結按鈕，呼叫 Web Share API 或 `navigator.clipboard.writeText()`。
- [ ] 實作「複製到我的行程」按鈕互動邏輯：
  - 檢查當前是否有 Supabase Session。
  - 若無 Session，保存當前 `share_token` 並觸發 LINE LIFF 登入授權流程。
  - 登入成功後，發送 INSERT 請求複製資料，將 `forked_from_id` 指向原行程。
  - 成功建立後，轉導至 `/canvas/[new_id]`。

---

## 4. 驗收條件 (Acceptance Criteria)
- [ ] 未登入訪客在無 Session 狀態下，能 100% 順暢開啟分享連結並瀏覽行程與地圖。
- [ ] 分享頁面絕不洩漏原建立者之 LINE UID、頭像、姓名與預算金額。
- [ ] 點選「複製到我的行程」後，新行程正確出現在該使用者的個人儀表板中，且原行程完全不受影響。
