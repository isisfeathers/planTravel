# TRACK1-05: 動態行程時間軸卡片、拖曳重排 (Dnd) 與防抖自動儲存

* **工單編號**：TRACK1-05
* **所屬軌道**：Track 1 - 前端開發組 (LIFF Web App)
* **建議負責人**：1 人 (前端工程師 A)
* **優先級**：Highest (P0)
* **前置依賴 (Dependencies)**：`TRACK0-000`、`TRACK1-04`、`TRACK0-03`
* **狀態**：ready-for-agent

---

## 0. 開工前確認檢查清單 (Pre-Execution Sign-off / 執行者自檢)
> ⚠️ **執行者開工前必讀・問詢門檻**：動工前請確認以下項目皆已就緒並手動勾選，未確認前置產出前切勿盲目施工：
- [ ] **硬性前置實體產出確認**：tickets/mocks/mock_itinerary.json、TRACK1-04 轉場正常、TRACK0-03 卡片與拖曳 Wireframe 稿。
- [ ] **規範與契約理解確認**：清楚階段 1 先以 Zustand 實作 @hello-pangea/dnd 拖曳陣列重算、800ms 防抖更新與樂觀鎖 version 衝突處理；階段 2 再注入 Token 樣式。
- [ ] **紅線與禁止事項確認**：嚴禁在拖曳過程中頻繁向後端發送 HTTP 請求（必須防抖 800ms），寫回時嚴禁遺失版本號。
- [ ] **執行者開工簽核**：我已完全理解本任務之驗收標準與前置交付物，確認無缺漏並正式開工。

---

## 1. 任務說明 (What to Build)
實作 Atrip 核心動態行程主畫布 (`/canvas/[id]`)。根據 `itinerary_data` 渲染每日時間軸 Tab、景點活動卡片與交通轉乘標籤。整合 `@hello-pangea/dnd` 實現單日內景點長按拖曳更換順序，並於拖曳完成後觸發 800ms 防抖整包覆蓋寫回 Supabase，並嚴格落實樂觀鎖 `version` 檢核。

---

## 2. 輸入與輸出資料規格 (Data Specification)

### 2.1 輸入規格
* `itineraries.itinerary_data`（符合 `ItineraryPayload` 結構，參考 `mock_itinerary.json`）。
* 當前行程之 `version`（整數）。

### 2.2 輸出規格
* **資料庫更新 Payload (`PATCH /rest/v1/itineraries?id=eq.{id}&version=eq.{current_version}`)**：
  ```json
  {
    "itinerary_data": { /* 拖曳更新後的完整 ItineraryPayload */ },
    "version": 2
  }
  ```

---

## 3. 詳細執行步驟 (Step-by-Step Checklist)
- [ ] **階段 1：純邏輯與拖曳資料狀態管理 (Headless Logic，不卡設計)**：
  - 建立 Zustand 全域 Store 維護當前行程之 `itineraryData` 與 `version`（以 `mock_itinerary.json` 進行本地驗證）。
  - 實作天數 Tab 切換邏輯。
  - 整合 `@hello-pangea/dnd` 核心拖曳事件：監聽 `onDragEnd`，以純陣列重排演算法精準重算當天 `activities` 順序。
  - 實作 800ms 防抖更新 (Debounced Save) 函式與樂觀鎖檢核：呼叫 Supabase PATCH，帶入 `version = currentVersion`。
  - 實作 409 Conflict 錯誤攔截處理。
- [ ] **階段 2：視覺套版與 Tokens 注入 (待 TRACK0-03 交付後執行)**：
  - 封裝 `ActivityCard` 視覺元件：套用 Atrip 品牌陰影、圓角與字級規範。
  - 套用交通換乘提示膠囊樣式（包含地鐵、步行、自駕不同圖標與顏色標籤）。
  - 實作拖曳進行中之陰影放大與放置目標指示藍線（Drop Indicator）動效。

---

## 4. 驗收條件 (Acceptance Criteria)
- [ ] 時間軸各景點卡片渲染順序正確，時段、交通換乘與費用標註清晰。
- [ ] 手機端手指長按活動卡片可流暢拖曳重排，放開後 UI 立即反映新順序。
- [ ] 拖曳結束 800ms 後發出 PATCH 請求，資料庫中的 `itinerary_data` 正確被整包更新，版本號自動自增 1。
- [ ] 多端修改衝突時能成功攔截錯誤，絕不發生無預警覆蓋他人修改之情形。
