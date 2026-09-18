# TRACK1-01 成果交付說明書：LINE LIFF SDK 整合與 Supabase Token 交換

* **工單編號**：TRACK1-01
* **負責人**：前端工程師 A
* **階段**：階段 1 (Phase 1: 純資料邏輯與狀態機整合)
* **狀態**：Ready for Review

---

## 1. 交付檔案與結構清單
* `types/auth.ts`：嚴格對齊 API 契約 1.1 之 Token 交換 Request/Response 型別與狀態機列舉。
* `types/index.ts`：全域領域模型型別（對齊 DATA_STRUCTURES.md 規格）。
* `lib/supabaseClient.ts`：前端 Supabase Client 單例（自動持久化 JWT Bearer Session）。
* `stores/useAuthStore.ts`：純資料邏輯 Zustand Store，處理 LIFF 初始化、無感登入、Token 交換與狀態流轉。
* `components/auth/QrLoginGuide.tsx`：一般桌面瀏覽器 QR Code 掃描登入引導組件（抽象語意 class）。
* `components/auth/LiffProvider.tsx`：全域認證生命週期 Provider 與自動轉導 `/dashboard` 控制。
* `.env.example`：前端必要環境變數設定範本。

---

## 2. 驗收標準 (Acceptance Criteria) 檢核結果

| 驗收項目 | 實作機制與檢核說明 | 檢核結果 |
| :--- | :--- | :---: |
| **LINE App 內 100% 免密登入** | `liff.isInClient()` 偵測為 true 時，自動觸發登入與交換，不跳出外部帳密視窗。 | ✅ 通過 |
| **自動攜帶 Bearer JWT** | Token 交換成功後執行 `supabase.auth.setSession()`，後續 API 請求皆自動帶上合法的 JWT。 | ✅ 通過 |
| **桌面端引導登入** | 一般瀏覽器開啟時切換至 `unauthenticated` 狀態，展示 `QrLoginGuide` 引導 LINE 登入。 | ✅ 通過 |
| **自動轉導至 `/dashboard`** | 登入成功後若在根路徑且無特定行程參數，自動轉導至 `/dashboard`。 | ✅ 通過 |
| **紅線遵守與資安規範** | 嚴禁前端洩漏 `service_role` 密鑰；無硬編碼 hex 色碼，全採用抽象語意 class。 | ✅ 通過 |
