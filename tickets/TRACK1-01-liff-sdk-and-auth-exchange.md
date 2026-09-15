# TRACK1-01: LINE LIFF SDK 整合與 Supabase Token 交換會話建立

* **工單編號**：TRACK1-01
* **所屬軌道**：Track 1 - 前端開發組 (LIFF Web App)
* **建議負責人**：1 人 (前端工程師 A)
* **優先級**：Highest (P0)
* **前置依賴 (Dependencies)**：`TRACK0-000`、`TRACK2-01`
* **狀態**：ready-for-agent

---

## 0. 開工前確認檢查清單 (Pre-Execution Sign-off / 執行者自檢)
> ⚠️ **執行者開工前必讀・問詢門檻**：動工前請確認以下項目皆已就緒並手動勾選，未確認前置產出前切勿盲目施工：
- [ ] **硬性前置實體產出確認**：tickets/mocks/mock_user_prefs.json 已建立、已取得 LINE Developers LIFF_ID、Supabase 專案 URL 與 Anon Key。
- [ ] **規範與契約理解確認**：清楚 LINE id_token 送交 Edge Function 交換 JWT 的認證通訊流程。
- [ ] **紅線與禁止事項確認**：嚴禁將 service_role 密鑰帶入前端，嚴禁使用未加密的 localStorage 儲存敏感 Token。
- [ ] **執行者開工簽核**：我已完全理解本任務之驗收標準與前置交付物，確認無缺漏並正式開工。

---

## 1. 任務說明 (What to Build)
在 Next.js 前端專案中整合 `@line/liff` SDK，初始化 LINE 登入環境；取得使用者 LINE `id_token` 後，發送至後端 Supabase Edge Function (`/functions/v1/auth-line`) 驗證換取 Supabase Session (JWT)，並以取得的 Token 初始化前端 Supabase Client，建立全域 Auth Context。

---

## 2. 輸入與輸出資料規格 (Data Specification)

### 2.1 輸入規格
* 環境變數：`NEXT_PUBLIC_LIFF_ID`、`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`。
* LINE LIFF SDK 取得之 `liff.getIDToken()`。

### 2.2 輸出規格
* **API 請求 Payload (`POST /functions/v1/auth-line`)**：
  ```json
  {
    "id_token": "string",
    "line_user_id": "string",
    "display_name": "string",
    "picture_url": "string"
  }
  ```
* **客戶端狀態持久化**：
  * Supabase Client Session 注入 LocalStorage / Cookie。
  * 全域狀態 `user`：`{ id, line_user_id, display_name, active_itinerary_id }`。

---

## 3. 詳細執行步驟 (Step-by-Step Checklist)
- [ ] 安裝 `@line/liff` 與 `@supabase/supabase-js` 套件。
- [ ] 撰寫 `LiffProvider` 與 `useAuth` hook，處理 `liff.init({ liffId })`。
- [ ] 實作免密登入邏輯：判斷 `liff.isLoggedIn()`，取得 ID Token 並呼叫 Edge Function。
- [ ] 成功取得 Supabase JWT 後，執行 `supabase.auth.setSession()` 並寫入本地儲存。
- [ ] 實作自動轉導：若為初次進入或未帶特定行程參數，轉導至 `/dashboard`。

---

## 4. 驗收條件 (Acceptance Criteria)
- [ ] 在 LINE 應用程式內開啟 LIFF URL，能 100% 自動無感完成免密登入，不跳出外部登入帳密視窗。
- [ ] 登入成功後，Supabase Client 發送的後續所有 Request 皆自動攜帶合法的 `Bearer <JWT>`。
- [ ] 若使用者於一般桌面瀏覽器開啟，能友善引導至 LINE QR Code 掃描登入頁面。
