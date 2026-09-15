# TRACK1-03: 雙層標籤精靈 (Chip Selector - 0 點擊懶人套版與自選矩陣)

* **工單編號**：TRACK1-03
* **所屬軌道**：Track 1 - 前端開發組 (LIFF Web App)
* **建議負責人**：1 人 (前端工程師 B)
* **優先級**：Highest (P0)
* **前置依賴 (Dependencies)**：`TRACK1-01`、`TRACK0-02`
* **狀態**：ready-for-agent

---

## 0. 開工前確認檢查清單 (Pre-Execution Sign-off / 執行者自檢)
> ⚠️ **執行者開工前必讀・問詢門檻**：動工前請確認以下項目皆已就緒並手動勾選，未確認前置產出前切勿盲目施工：
- [ ] **硬性前置實體產出確認**：TRACK1-01 登入環境就緒、TRACK0-02 雙層標籤精靈 Wireframe 稿已交付。
- [ ] **規範與契約理解確認**：清楚狀態機聯動（點選套版全選下方標籤、微調下方標籤切換自訂組合），初次進入預設點亮經典套版。
- [ ] **紅線與禁止事項確認**：送出之 preference_snapshot 必須 100% 通過 JSON Schema 驗證，不可缺少必要欄位。
- [ ] **執行者開工簽核**：我已完全理解本任務之驗收標準與前置交付物，確認無缺漏並正式開工。

---

## 1. 任務說明 (What to Build)
實作 Atrip 新增行程時的「雙層標籤精靈」頁面 (`/wizard`)。徹底捨棄打字問卷，改採按鈕膠囊矩陣：第 1 層預設點亮「🏆 平台推薦經典遊」懶人套版（支援 0 點擊直接發動），第 2 層提供住宿策略、交通方式、主題標籤與運動賽事錨點微調。點擊送出後寫入 `itineraries` 並轉導至等待畫布。

---

## 2. 輸入與輸出資料規格 (Data Specification)

### 2.1 輸入規格
* 使用者全域偏好：`user_preferences.preferences`（若有儲存則作為初次進入之預填依據）。
* 預設套版字典：
  * `classic_bundle`（預設點亮）：連住同一間 ＋ 大眾捷運 ＋ 慢活 ＋ #在地老饕 #經典必訪。
  * `shopping_bundle`：連住商圈 ＋ 大眾捷運 ＋ 充實 ＋ #百貨商場 #潮流小店。
  * `sports_bundle`：交通樞紐 ＋ 大眾捷運 ＋ 適中 ＋ #運動賽事。

### 2.2 輸出規格
* **寫入 Supabase 資料庫 Payload (`POST /rest/v1/itineraries`)**：
  ```json
  {
    "title": "東京 5 天 4 夜慢活文藝與在地美食探索",
    "destination": "東京",
    "status": "generating",
    "preference_snapshot": {
      "destination": "東京",
      "total_days": 5,
      "start_date": "2026-10-15",
      "pace": "relaxed",
      "budget_level": "standard",
      "accommodation_strategy": "single_hotel",
      "transit_mode": "public_transit",
      "interests": ["gourmet", "cultural", "sports"],
      "event_note": "週五晚間東京巨蛋棒球賽",
      "selected_bundle": "classic_bundle"
    }
  }
  ```

---

## 3. 詳細執行步驟 (Step-by-Step Checklist)
- [ ] **階段 1：純邏輯與狀態管理 (Headless State，不卡設計)**：
  - 建立 Zustand Store 管理標籤狀態樹：`selectedBundle`, `destination`, `totalDays`, `accommodation`, `transit`, `interests`, `eventNote`。
  - 實作套版與自選矩陣之聯動狀態機：點擊套版時下方選項自動聯動全選；手動微調下方選項時，套版自動切換為「自訂組合」。
  - 實作預設值邏輯：初次進入時自動點亮「🏆 平台推薦經典遊」對應之所有預設值，支援 0 點擊直接組裝出完整 `preference_snapshot`。
  - 撰寫 Supabase INSERT 函式，打通資料庫寫入並獲取 `itinerary_id`。
- [ ] **階段 2：視覺套版與 Tokens 注入 (待 TRACK0-02 交付後執行)**：
  - 刻劃雙層結構介面：
    - 第 1 層：橫向滾動一鍵套版按鈕組（使用 `bg-brand-primary` 高亮預設套版）。
    - 第 2 層：自選按鈕矩陣（目的地城市 Chips、天數選取、住宿膠囊、交通膠囊、主題標籤陣列，全套用 `rounded-pill` 規範）。
    - 若勾選 `#運動賽事`，動態平滑展開單行賽事備註輸入框。
  - 底部配置暖日橘主行動按鈕「一鍵開始 AI 規劃」(`bg-brand-accent`)。
- [ ] 建立成功取得 `itinerary_id` 後，立即轉導至 `/waiting/[itinerary_id]`。

---

## 4. 驗收條件 (Acceptance Criteria)
- [ ] 用戶首次進入此頁，無需手動點選任何按鈕，畫面已呈現完整的預選狀態。
- [ ] 懶人用戶直接點擊「一鍵開始 AI 規劃」，能 100% 成功建立資料並轉導至等待頁。
- [ ] 產出之 `preference_snapshot` 結構完全符合 `03-JSON-Schema` 定義。
