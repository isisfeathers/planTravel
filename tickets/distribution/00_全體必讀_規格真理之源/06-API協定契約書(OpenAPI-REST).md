# 06 API 協定契約書 (API Contract & Endpoint Specifications)

* **專案代號**：Project Atrip
* **協定標準**：RESTful API / JSON Payload / Bearer Token 授權
* **版本**：v2.0.0

---

## 1. 認證授權與會話管理 (Authentication & Session)

### 1.1 LINE Token 交換與會話建立
* **端點**：`POST /functions/v1/auth-line`
* **身分驗證**：無需授權 Header（公開驗證端點）
* **請求格式**：
  ```json
  {
    "id_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "line_user_id": "U1234567890abcdef1234567890abcdef",
    "display_name": "王小明",
    "picture_url": "https://profile.line-scdn.net/..."
  }
  ```
* **回應格式 (200 OK)**：
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
    "token_type": "bearer",
    "expires_in": 3600,
    "refresh_token": "rX9...",
    "user": {
      "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      "line_user_id": "U1234567890abcdef1234567890abcdef",
      "display_name": "王小明",
      "active_itinerary_id": "b1ffbc88-8b0a-4ef8-bb6d-5bb9bd380b22"
    }
  }
  ```

---

## 2. 行程管理核心介面 (Itinerary Management API)

### 2.1 查詢我的行程列表 (儀表板首頁)
* **端點**：`GET /rest/v1/itineraries?select=*&deleted_at=is.null&order=created_at.desc`
* **請求 Headers**：`Authorization: Bearer <JWT>`, `apikey: <SUPABASE_ANON_KEY>`
* **回應格式 (200 OK)**：回傳該使用者名下未軟刪除之 `ItineraryEntity[]`。

### 2.2 建立新行程（提交標籤精靈）
* **端點**：`POST /rest/v1/itineraries`
* **請求 Headers**：`Authorization: Bearer <JWT>`, `Prefer: return=representation`
* **請求格式**：
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
* **回應格式 (201 Created)**：回傳包含 `id` 與 `share_token` 之新建立物件。

### 2.3 拖曳重排或手動編輯寫回 (樂觀鎖覆蓋)
* **端點**：`PATCH /rest/v1/itineraries?id=eq.{id}&version=eq.{current_version}`
* **請求 Headers**：`Authorization: Bearer <JWT>`, `Prefer: return=representation`
* **請求格式**：
  ```json
  {
    "itinerary_data": { /* 完整的 ItineraryPayload 巢狀物件 */ },
    "version": 2
  }
  ```
* **回應格式 (200 OK)**：更新成功。若版本號不符合（即被其他裝置修改過），回傳空陣列或 409 Conflict，前端提示用戶重新載入。

### 2.4 軟刪除行程 (移至垃圾桶)
* **端點**：`PATCH /rest/v1/itineraries?id=eq.{id}`
* **請求格式**：`{ "deleted_at": "2026-09-14T10:00:00Z" }`
* **回應格式 (200 OK)**：標註軟刪除成功。

### 2.5 設為當前關注行程 (Active Itinerary Context)
* **端點**：`PATCH /rest/v1/profiles?id=eq.{user_id}`
* **請求格式**：`{ "active_itinerary_id": "{itinerary_id}" }`
* **回應格式 (200 OK)**：LINE Chatbot 後續對話即以此行程為上下文主體。

---

## 3. 分享與社群複製 (Sharing & Fork API)

### 3.1 取得去識別化之公開分享內容
* **端點**：`GET /rest/v1/itineraries?share_token=eq.{share_token}&is_public=eq.true&deleted_at=is.null`
* **請求 Headers**：`apikey: <SUPABASE_ANON_KEY>`（**無需 Bearer Token，未登入可用**）
* **回應保護規則**：
  * **可讀欄位**：`id`, `title`, `destination`, `status`, `itinerary_data`, `flight_data`。
  * **自動遮蔽/隱藏**：`user_id`、使用者個人檔案、`preference_snapshot.budget_level`。

### 3.2 複製到我的行程 (Fork Itinerary)
* **端點**：`POST /rest/v1/rpc/fork_itinerary` 或直接 Insert：
* **請求 Headers**：`Authorization: Bearer <JWT>`（**必須已登入**）
* **請求格式**：
  ```json
  {
    "source_itinerary_id": "e0b57e79-5e92-4f01-9f9b-640a2bbd29e4"
  }
  ```
* **回應格式 (201 Created)**：
  ```json
  {
    "new_itinerary_id": "c2aa6d88-4f10-4bc2-8e8a-731b1aad38f5",
    "forked_from_id": "e0b57e79-5e92-4f01-9f9b-640a2bbd29e4",
    "share_token": "f4bb7e99-6a21-4cd3-9f9b-842c2bbd49a6"
  }
  ```

---

## 4. 機票資料取得服務內部介面 (Flight Service API)

### 4.1 搜尋與評分航班
* **端點**：`GET /api/v1/flights/search`
* **查詢參數**：
  * `origin`: 出發地機場代碼 (如 `TPE`)
  * `destination`: 目的地機場代碼 (如 `HND`)
  * `departure_date`: 出發日期 (`YYYY-MM-DD`)
  * `return_date`: 回程日期 (`YYYY-MM-DD`, 可選)
  * `adults`: 成人數 (預設 1)
  * `cabin`: 艙等 (`economy` | `business`)
* **回應格式 (200 OK)**：回傳依評分演算法排序前 5 組之 `FlightOfferItem[]`。

### 4.2 驗價與即時可用性檢查 (Price Refresh)
* **端點**：`POST /api/v1/flights/refresh`
* **請求格式**：`{ "offer_id": "fl-001" }`
* **回應格式**：
  * 價格有效：`{ "valid": true, "current_price": 14250, "deep_link": "https://..." }`
  * 變價或售罄：`{ "valid": false, "reason": "PRICE_CHANGED", "new_price": 15800 }`

---

## 5. 離線 PDF 導出觸發介面 (PDF Export API)

### 5.1 請求 LINE Bot 發送實體 PDF 文件
* **端點**：`POST /functions/v1/export-pdf-line`
* **請求 Headers**：`Authorization: Bearer <JWT>`
* **請求格式**：
  ```json
  {
    "itinerary_id": "b1ffbc88-8b0a-4ef8-bb6d-5bb9bd380b22"
  }
  ```
* **處理邏輯**：後端 Worker 以 Headless Chrome 載入該行程之專用列印頁面並渲染為 A4 PDF，上傳至 Supabase Storage，隨後透過 LINE Messaging API 將檔案直接推送至使用者的 LINE 對話視窗。
* **回應格式 (202 Accepted)**：`{ "status": "queued", "message": "PDF 檔案將於 30 秒內直接傳送至您的 LINE 聊天室" }`
