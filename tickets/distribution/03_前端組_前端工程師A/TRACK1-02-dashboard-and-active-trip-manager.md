# TRACK1-02: 我的行程儀表板 (Dashboard) 與 Active 行程切換

* **工單編號**：TRACK1-02
* **所屬軌道**：Track 1 - 前端開發組 (LIFF Web App)
* **建議負責人**：1 人 (前端工程師 A)
* **優先級**：High (P1)
* **前置依賴 (Dependencies)**：`TRACK1-01`、`TRACK0-02`
* **狀態**：ready-for-agent

---

## 0. 開工前確認檢查清單 (Pre-Execution Sign-off / 執行者自檢)
> ⚠️ **執行者開工前必讀・問詢門檻**：動工前請確認以下項目皆已就緒並手動勾選，未確認前置產出前切勿盲目施工：
- [ ] **硬性前置實體產出確認**：TRACK1-01 登入會話正常運作、TRACK0-02 儀表板 Wireframe 稿已交付。
- [ ] **規範與契約理解確認**：清楚階段 1 先寫純邏輯（讀取列表、切換 Active 行程、軟刪除過濾），階段 2 再套用 Token 樣式。
- [ ] **紅線與禁止事項確認**：嚴禁手寫 hex 色碼，嚴禁顯示 deleted_at IS NOT NULL 的行程。
- [ ] **執行者開工簽核**：我已完全理解本任務之驗收標準與前置交付物，確認無缺漏並正式開工。

---

## 1. 任務說明 (What to Build)
實作 Atrip 首頁「我的行程儀表板 (Dashboard)」，查詢當前登入者所有未軟刪除的行程，分類展示「活躍中/即將出發 (Active & Upcoming)」與「歷史旅程 (Archived)」，並支援卡片快速選單（設為當前關注、封存、移至垃圾桶）以及頂部「＋ 規劃新旅程」導航。

---

## 2. 輸入與輸出資料規格 (Data Specification)

### 2.1 輸入規格
* Supabase 查詢：`itineraries` 表，篩選條件 `deleted_at IS NULL`，排序 `created_at DESC`。
* 使用者當前鎖定值：`profiles.active_itinerary_id`。

### 2.2 輸出規格
* **資料庫更新行為**：
  * 設為當前關注：`UPDATE profiles SET active_itinerary_id = :id WHERE id = :user_id`。
  * 封存行程：`UPDATE itineraries SET is_archived = true WHERE id = :id`。
  * 軟刪除行程：`UPDATE itineraries SET deleted_at = NOW() WHERE id = :id`。

---

## 3. 詳細執行步驟 (Step-by-Step Checklist)
- [ ] **階段 1：純邏輯先發 (Headless Data Layer，不卡設計)**：
  - 撰寫 `useItineraries` Hook：呼叫 Supabase Client 讀取行程列表與 Profile 狀態。
  - 實作資料流與操作方法：切換關注行程、手動封存、軟刪除（寫入 `deleted_at`），並提供樂觀更新 (Optimistic UI Update)。
  - 驗證軟刪除過濾：確保 `deleted_at IS NOT NULL` 的行程在本地 state 與查詢結果中被正確排除。
- [ ] **階段 2：視覺套版與 Tokens 注入 (待 TRACK0-02 交付後執行)**：
  - 依據 Track 0 視覺稿刻劃 `/dashboard` 頁面結構。
  - 強制使用 `tailwind.config.js` 語意化色票（如 `bg-brand-primary`、`text-brand-secondary`），嚴禁手寫客製顏色代碼。
  - 實作卡片流元件：顯示目的地照片、自訂標題、日期區間、天數、狀態 Badge 與「★ 當前關注」徽章。
  - 實作卡片右上下拉選單與操作反饋。
- [ ] 頂部主按鈕連結轉導至 `/wizard`（雙層標籤精靈）。

---

## 4. 驗收條件 (Acceptance Criteria)
- [ ] 進入儀表板能正確讀取名下所有行程，且標記 `deleted_at IS NOT NULL` 的行程被嚴格過濾不顯示。
- [ ] 點選「設為當前關注」時，徽章立即高亮切換，並成功寫回 `profiles.active_itinerary_id`。
- [ ] 點選「移至垃圾桶」後，該卡片自畫面平滑淡出，資料庫欄位寫入當前時間戳記。
