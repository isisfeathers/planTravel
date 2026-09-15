# TRACK0-000: 規格基準 Mock 測試資料產生器 (Mock Data Generator)

* **工單編號**：TRACK0-000
* **所屬軌道**：基石任務 (Foundation)
* **建議負責人**：1 人 (全棧/架構負責人或後端先鋒)
* **優先級**：Highest (P0 - 全員開工前置阻擋任務)
* **前置依賴 (Dependencies)**：None (可立即開工)
* **狀態**：ready-for-agent

---

## 0. 開工前確認檢查清單 (Pre-Execution Sign-off / 執行者自檢)
> ⚠️ **執行者開工前必讀・問詢門檻**：動工前請確認以下項目皆已就緒並手動勾選，未確認前置產出前切勿盲目施工：
- [ ] **硬性前置實體產出確認**：已詳讀 [Final SPEC/03-行程與偏好-JSON-Schema規格書.md](../Final%20SPEC/03-行程與偏好-JSON-Schema規格書.md) 與 [Final SPEC/DATA_STRUCTURES.md](../Final%20SPEC/DATA_STRUCTURES.md)。
- [ ] **規範與契約理解確認**：清楚知道 mock 資料必須完整包含 meta, daily_itinerary (含真實座標與 transit_to_next), transit_overview, recommendations, packing_list, flight_data。
- [ ] **紅線與禁止事項確認**：嚴禁產生超出地理界限的坐標，嚴禁活動缺少唯一字串 id。
- [ ] **執行者開工簽核**：我已完全理解本任務之驗收標準與前置交付物，確認無缺漏並正式開工。

---

## 1. 任務說明 (What to Build)
依據 [Final SPEC/03-行程與偏好-JSON-Schema規格書.md](../Final%20SPEC/03-行程與偏好-JSON-Schema規格書.md) 與 [Final SPEC/DATA_STRUCTURES.md](../Final%20SPEC/DATA_STRUCTURES.md)，產出標準且真實度高的假資料檔案：`mock_itinerary.json` 與 `mock_user_prefs.json`。
此兩份檔案將作為前端 UI 渲染、拖曳測試、後端管線校驗與機票比價展示的唯一共用標準資料源（Fixtures），讓前端與後端能在資料庫和 API 尚未串通前完全平行開工。

---

## 2. 輸入與輸出資料規格 (Data Specification)

### 2.1 輸入規格
* [Final SPEC/03-行程與偏好-JSON-Schema規格書.md](../Final%20SPEC/03-行程與偏好-JSON-Schema規格書.md) 定義之 `ItineraryPayload`、`PreferenceSnapshot`、`FlightOfferItem` TypeScript 型別與 JSON Schema。

### 2.2 輸出規格
* **檔案 1：`tickets/mocks/mock_user_prefs.json`**：
  * 符合 `PreferenceSnapshot` 介面，涵蓋：
    * `destination`: "東京"
    * `total_days`: 5
    * `start_date`: "2026-10-15", `end_date`: "2026-10-19"
    * `pace`: "relaxed", `budget_level`: "standard"
    * `accommodation_strategy`: "single_hotel"
    * `transit_mode`: "public_transit"
    * `interests`: ["gourmet", "cultural", "sports"]
    * `event_note`: "週五晚間 18:00 東京巨蛋棒球賽 (巨人 vs 阪神)"
    * `selected_bundle`: "classic_bundle"
* **檔案 2：`tickets/mocks/mock_itinerary.json`**：
  * 完整 5 天每日行程（包含真實坐標、時段、交通路線換乘指引 `transit_to_next`）。
  * 包含 `transit_overview`、`recommendations` (美食與住宿)。
  * 包含 `packing_list`（重要證件、衣物、3C 清單）。
  * 包含 `flight_data`（松山-羽田/成田-桃園 長榮航空即時報價與 Deep Link）。

---

## 3. 詳細執行步驟 (Step-by-Step Checklist)
- [ ] 建立 `tickets/mocks/` 目錄。
- [ ] 編寫 `tickets/mocks/mock_user_prefs.json`，校驗各欄位型別與列舉值域。
- [ ] 編寫 `tickets/mocks/mock_itinerary.json`，提供完整的 5 日東京行程活動項目（每項活動均具備唯一 `id`、合法 WGS84 座標、交通乘車出口指示）。
- [ ] 於 `mock_itinerary.json` 中注入完整的 `packing_list` 與 `flight_data` 陣列。
- [ ] 使用 JSON Schema Validator (Ajv) 驗證產出的 JSON 檔案是否 100% 通過 `atrip_itinerary_schema`。

---

## 4. 驗收條件 (Acceptance Criteria)
- [ ] `mock_user_prefs.json` 欄位與型別完全吻合 `PreferenceSnapshot` 定義。
- [ ] `mock_itinerary.json` 包含 5 天連續 `day_number` 排程，活動坐標皆位於合法地理區間（$lat \in [-90, 90]$, $lng \in [-180, 180]$）。
- [ ] 活動項目具備唯一 `id`（如 `act-d1-01`），且每項活動皆有 `transit_to_next` 指引。
- [ ] 包含至少 3 組推薦美食、2 組推薦住宿、3 項行李清單，以及 1 組來回直飛航班資料。
- [ ] 檔案已就緒並被 Track 1 (前端) 與 Track 2 (後端) 當作測試 fixture 引用。
