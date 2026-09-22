# Atrip 系統規格書 (Feature Specification)

## Problem Statement

當代自主旅遊（自由行）規劃者在安排跨日行程時，面臨多重碎裂且耗時的痛點：
1. **工具分散與重工繁瑣**：旅客必須在機票比價網、地圖導航、住宿訂房平台、筆記軟體與社群聊天室之間反覆切換。現有工具多半要求填寫冗長問卷或手動拼湊景點資訊，規劃一套 5 天行程平均耗費數天至數週。
2. **AI 行程空洞且不可行**：通用型大型語言模型（LLM）常給出泛泛的景點列表，缺乏真實地理空間坐標、明確的日夜動線、合宜的交通轉乘路線，且忽略「頻繁換宿之行李拖行與寄放」等真實痛點。
3. **通訊軟體內嵌環境障礙**：多數台灣與日本用戶高度仰賴 LINE，但在 LINE 內建瀏覽器（In-App Browser）中，長耗時的 AI 生成常因切換應用程式或網路波動而逾時中斷，且檔案下載常遭原生攔截。
4. **行程管理與同行協同斷裂**：用戶一年有多趟不同規劃，缺乏單一儀表板集中管理；旅伴間分享行程難以直接複製接手二次客製，造成一人排行程、全員無法動態調整。

---

## Solution

**Atrip（你的 AI 自由行規劃夥伴）** 透過 LINE LIFF Web App、Supabase 資料中台、n8n 自動化引擎與 LLM 結構化輸出，打造全方位自由行規劃平台：
1. **極速進站與雙層標籤精靈**：透過 LINE 免密登入進入「我的行程儀表板」；新增行程時提供頂部「一鍵懶人套版（Preset Bundles）」，預先點亮大眾推薦設定，實現 **0 點擊直接生成**，同時提供住宿、交通與主題矩陣供進階微調。
2. **資料庫驅動動態提示詞工程**：將住宿策略（連住基地 Basecamp 約束 vs 分區換宿行李寄放節點）、交通方式（捷運路線出口代碼）、運動賽事（時間錨點 Anchor Event）抽離為資料庫範本，動態組裝 Master Prompt。
3. **非同步優先與雙軌通知韌性**：長耗時生成任務由獨立 Job 表管理，前台開啟走 Supabase Realtime 廣播秒級載入，離線跳出則透過 LINE Messaging API 發送 Bubble Flex Message 通知卡片喚回。
4. **合法授權機票資料取得服務 (AFS)**：整合合規 Flight Shopping API 與聯盟 Deep Link 轉址機制，提供搜尋、比價、去重評分、短期快取與驗價導流，MVP 不承擔站內付款開票風險。
5. **畫布級互動、去識別化分享與複製 (Fork)**：支援時間軸活動卡片拖拉重排 (Dnd)、地圖平滑移動 (FlyTo)、智能行李清單打勾，以及免登入去識別化外連分享與一鍵「複製到我的行程 (Fork)」。

---

## User Stories

### 模組 A：身分認證、儀表板與多行程管理
1. As a LINE 行動使用者, I want to 在點擊官方帳號 Rich Menu 後免密碼自動登入 Web App, so that 我無需手動註冊或輸入帳號密碼即可秒開使用。
2. As a 規劃多趟旅行的用戶, I want to 在進入系統後於「我的行程儀表板」中查看所有進行中與歷史封存的行程, so that 我能清晰切換與管理不同目的地的旅行專案。
3. As a 準備規劃新旅程的用戶, I want to 在儀表板頂部看到顯眼的「＋ 規劃新旅程」主按鈕, so that 我能隨時啟動新行程的建立流程。
4. As a 擁有多個行程的用戶, I want to 將其中一個行程標記為「★ 當前關注行程 (Active Itinerary)」, so that 我在 LINE 聊天室與 Chatbot 對話時，系統能自動以該行程作為上下文。
5. As a 用戶, I want to 在行程卡片選單中將過期旅程手動「封存」, so that 我的活躍列表保持乾淨整潔。
6. As a 用戶, I want to 在卡片選單中將不再需要的行程執行「軟刪除」, so that 我能隨時清理空間，並享有 30 天內防誤觸復原保護。

### 模組 B：雙層標籤精靈與偏好配置 (Chip Selector)
7. As a 不想花時間打字的懶人用戶, I want to 在新增行程時看到預先點亮的「🏆 平台推薦經典遊」套版, so that 我可以直接 0 點擊點選「一鍵開始 AI 規劃」立即產生行程。
8. As a 購物愛好者, I want to 點選「🛍️ 都會潮流血拚狂」套版, so that 系統自動幫我帶入市區連住、大眾捷運與潮流商圈標籤。
9. As a 體育迷, I want to 點選「⚾ 熱血運動賽事遊」套版並填寫特定比賽日期/時間, so that AI 將該場賽事作為當日不可撼動之重點時間錨點 (Anchor Event)。
10. As a 重視住宿動線的用戶, I want to 選擇「依推薦連住同一間」, so that AI 規劃時強制以首日飯店為 Basecamp 基地，每日行程以該飯店為中心輻射規劃且無中途 Check-in 負擔。
11. As a 想要體驗不同區域飯店的用戶, I want to 選擇「隨景點分區換宿」, so that AI 自動在換宿日安排上午行李寄放於車站或飯店，並於下午排定 Check-in 放置行李節點。
12. As a 習慣搭捷運的背包客, I want to 選擇「大眾運輸優先」, so that AI 在景點之間精準標註地鐵線路名稱、搭乘方向、建議出入口與乘車時間。
13. As a 打算開車的家庭遊客, I want to 選擇「租車自駕/包車」, so that AI 提示景點間的行車距離、車程時間以及周邊停車便利度與收費提示。
14. As a 美食愛好者, I want to 自由加選「#在地老饕」、「#米其林摘星」或「#網美甜點」標籤, so that AI 每日午晚餐皆安排符合該等級之精選餐廳。
15. As a 回訪常客, I want to 系統自動預填我個人檔案中的偏好習慣, so that 我每次開新行程時無需重新重複勾選。

### 模組 C：非同步任務中台與機票資料取得服務 (AFS)
16. As a 送出規劃請求的用戶, I want to 在等待頁面看到飛機航線微動畫與目的地實用 Tips, so that 我在非同步等待的 15~30 秒內不感到枯燥。
17. As a 暫時跳出或關閉 LIFF 的用戶, I want to 在行程生成完成後於 LINE 聊天室收到精美 Bubble Flex Message 通知卡片, so that 我能一鍵點擊重開查看專屬行程。
18. As a 留在畫面的用戶, I want to 行程完成時畫布透過 Supabase Realtime 自動平滑載入最新排程, so that 我無需手動下拉刷新頁面。
19. As a 需要預訂機票的用戶, I want to 在行程主畫布中查看合法授權 API 查詢之最佳機票比價卡片, so that 我能評估航班時刻與機票預算。
20. As a 選定航班的用戶, I want to 點擊機票卡片進行即時驗價與可用性檢查 (Price Refresh), so that 我能確認當前票價依然有效且尚未售罄。
21. As a 確認購買機票的用戶, I want to 透過授權 Deep Link 轉址至航空公司或 OTA 官方結帳頁, so that 我能安全且直接完成開票付款。
22. As a 系統維運人員, I want to 系統限制單一使用者每日最多生成 3 次、活躍行程上限 5 個, so that 防止 API 額度被惡意濫刷並保障營運成本。

### 模組 D：動態行程主畫布、拖曳互動與行李清單
23. As a 檢視行程的用戶, I want to 按天數 Tab 切換查看每天的時間軸活動卡片, so that 我能直觀瀏覽每天從早到晚的時段與景點排程。
24. As a 想要微調順序的用戶, I want to 透過手指長按或滑鼠拖曳活動卡片調整前後次序, so that 我能依照個人突發想法自由調整行程順序。
25. As a 完成拖曳調整的用戶, I want to 系統於 800ms 防抖後自動將整包 JSONB 寫回資料庫, so that 我的修改隨時自動持久化而不遺失。
26. As a 多裝置登入的用戶, I want to 系統在遇到版本衝突 (Version Mismatch) 時跳出友善提示並重新載入, so that 避免我的修改被其他裝置的舊資料覆蓋。
27. As a 查閱地理位置的用戶, I want to 在點擊任一景點卡片時地圖平滑滾動 (FlyTo) 至該座標並彈出介紹資訊, so that 我清楚掌握景點周邊環境。
28. As a 行前準備行李的旅客, I want to 切換至「行李清單 (Packing List)」分頁查看 AI 推薦的打包物品並能打勾清點, so that 我出國前不會漏帶重要證件或裝備。

### 模組 E：去識別化外連分享、社群複製 (Fork) 與離線 PDF
29. As a 想要與朋友分享行程的用戶, I want to 一鍵複製專屬外連分享網址, so that 任何同行旅伴在未登入狀態下也能直接於瀏覽器查看行程。
30. As a 瀏覽他人分享網址的訪客, I want to 畫面自動遮蔽原作者姓名、頭像與預算數字, so that 原作者的隱私資訊獲得嚴格保護。
31. As a 喜歡朋友行程的訪客, I want to 點擊「複製到我的行程 (Fork)」按鈕並在登入後產生獨立副本, so that 我能將其納入自己的儀表板並展開二次客製編輯。
32. As a 在無網路環境或飛機上的旅客, I want to 點擊匯出離線專用版面 PDF, so that 我隨時可以離線閱讀完整行程。
33. As a 使用 LINE 內建瀏覽器的用戶, I want to 點擊「傳送 PDF 到 LINE 聊天室」按鈕, so that 繞過手機瀏覽器的檔案下載限制，直接在對話框接收 PDF 檔案。

---

## Implementation Decisions

### 1. 系統架構與模組劃分 (Modular Architecture)
系統遵循前後端完全解耦原則，切分為 6 大高內聚、低耦合模組：

* **模組 A：身分認證與多行程儀表板 (Auth & Dashboard)**
  * 負責 LINE LIFF 初始化、呼叫 Token 交換端點發行 JWT、維持本地會話。
  * 負責儀表板列表查詢（排除軟刪除 `deleted_at IS NOT NULL` 行程），並維護 `profiles.active_itinerary_id` 供 LINE Bot 綁定對話上下文。
* **模組 B：雙層標籤精靈 (Quick-Choice Chip Selector)**
  * 提供「一鍵懶人套版膠囊」與「自選按鈕矩陣」雙層心智介面。
  * 負責組裝結構化 `PreferenceSnapshot` 物件，並以 `status = 'queued'` 寫入資料庫觸發生成。
* **模組 C：資料中台與動態提示詞庫 (Database & Prompt Store)**
  * 管理 PostgreSQL 15+ 表結構，以單一 `JSONB` 欄位儲存多日行程主結構（符合 ADR 0001）。
  * 維護 `prompt_templates` 表，管理連住基地、換宿行李、捷運出口、運動賽事時間錨點之 Prompt 約束語句與預設值（符合 ADR 0003）。
  * 實作嚴格 Row Level Security (RLS) 政策，區分個人讀寫與去識別化公開唯讀。
* **模組 D：n8n 自動化中台與生成管線 (Workflow & Async Pipeline)**
  * 負責接收 Database Webhook、執行用戶每日 3 次防刷檢查與活躍行程限額（符合 ADR 0002）。
  * 查詢 `prompt_templates` 動態拼裝 Master System Prompt，並平行調用 LLM 與機票服務。
  * 負責清洗回傳資料、注入唯一活動 ID、更新任務狀態為 `completed`，並發送 LINE Bubble Flex Message。
* **模組 E：機票資料取得服務 (Flight Data Acquisition Service - AFS)**
  * 徹底摒棄消費者網站 DOM 爬蟲，採用合法授權 API ＋ 聯盟 Deep Link（符合 ADR 0004）。
  * 包含 IATA 機場解析器、搜尋調度器 (Search Orchestrator)、Amadeus/Skyscanner 適配器、加權評分演算法、20 分鐘短期快取、驗價與 Circuit Breaker 熔斷機制。
* **模組 F：動態畫布、去識別化分享與離線 PDF (Canvas, Share & Export)**
  * 負責每日時間軸活動卡片、拖曳重排 (Dnd) 800ms 防抖覆蓋寫回（帶樂觀鎖 `version` 檢核）。
  * 整合 Mapbox/Leaflet 地圖平滑滾動 (FlyTo) 與智能行李清單打勾狀態持久化。
  * 負責去識別化外連分享 (`/share/:token`)、一鍵 Fork 副本交易寫入，以及專用列印樣板與 LINE Bot 檔案推送。

### 2. 關鍵實體資料契約 (Data Contracts & State Machine)

#### 狀態機模型 (Itinerary & Job Lifecycle)
行程主表與非同步任務表之狀態流轉：
* `itineraries.status`: `draft` $\rightarrow$ `generating` $\rightarrow$ `completed` / `failed`
* `itinerary_jobs.status`: `queued` $\rightarrow$ `searching_flight` $\rightarrow$ `generating_itinerary` $\rightarrow$ `validating` $\rightarrow$ `completed` / `failed`

#### 核心資料表關聯
* `profiles`: `id (PK)`, `line_user_id (UK)`, `display_name`, `avatar_url`, `active_itinerary_id (FK to itineraries.id)`
* `user_preferences`: `id (PK)`, `user_id (FK to profiles.id, UK)`, `preferences (JSONB)`
* `prompt_templates`: `id (PK)`, `category`, `option_key (UK)`, `display_label`, `prompt_directive`, `is_default`, `priority`
* `itineraries`: `id (PK)`, `user_id (FK to profiles.id)`, `forked_from_id (FK to itineraries.id)`, `share_token (UK)`, `title`, `destination`, `status`, `is_archived`, `version`, `is_public`, `preference_snapshot (JSONB)`, `itinerary_data (JSONB)`, `flight_data (JSONB)`, `deleted_at`
* `itinerary_jobs`: `id (PK)`, `itinerary_id (FK)`, `user_id (FK)`, `status`, `attempt`, `idempotency_key (UK)`, `error_code`, `error_message`, `started_at`, `completed_at`
* `itinerary_shares`: `id (PK)`, `itinerary_id (FK)`, `created_by (FK)`, `share_token_hash (UK)`, `views_count`, `expires_at`, `revoked_at`

### 3. API 協定與邊界規範 (API Contracts)
* **身分驗證**：`POST /functions/v1/auth-line`（交換 LINE `id_token` 發行 Supabase JWT）。
* **行程管理**：標準 REST API 支援儀表板查詢（過濾 `deleted_at IS NULL`）、標籤精靈建立行程、拖曳寫回（帶 `version` 樂觀鎖檢核）、軟刪除與 Active 行程鎖定。
* **外連分享與 Fork**：`GET /rest/v1/itineraries?share_token=eq.:token`（匿名唯讀，自動遮蔽個資）、`POST /rest/v1/rpc/fork_itinerary`（登入者複製為名下副本）。
* **機票服務**：`GET /api/v1/flights/search`（搜尋與評分）、`POST /api/v1/flights/refresh`（驗價可用性檢查）。
* **PDF 匯出**：`POST /functions/v1/export-pdf-line`（後端產生實體 PDF 並透過 LINE Bot 推播）。

---

## Testing Decisions

### 1. 測試原則
* **外部行為優先**：堅持只測試系統外部可觀測之輸入與輸出行為（資料庫狀態、API 回傳結構、畫面操作反應），嚴禁測試內部私有函式或組件內部 state。
* **單一最高測試縫線 (Highest Seam)**：全系統以 **前端 Client SDK 整合縫線** 與 **API 協定合約縫線** 作為最高測試層級。

### 2. 測試縫線定義與驗證標的 (Testing Seams)

* **最高核心縫線：端到端客戶端與合約縫線 (Client & Contract Seam)**
  * **驗證標的**：透過測試工具（Playwright / Vitest）模擬使用者於 LIFF 前端的操作行為，對接模擬之 Supabase Client 與外部服務。
  * **外部行為驗證**：
    1. 使用者在標籤精靈選擇「🏆 平台推薦經典遊」並點擊送出，驗證資料庫建立了一筆 `status = 'queued'` 之行程與 Job，且帶入正確的連住、大眾運輸與美食標籤。
    2. 模擬非同步生成完成廣播，驗證前端介面於 1 秒內自動平滑切換至主畫布，時間軸完整展示每日景點卡片與地圖標記。
    3. 模擬手指拖曳交換景點卡片次序，驗證觸發了 800ms 防抖更新，且寫入之資料庫 Payload 陣列順序精確變更、版本號遞增。
    4. 模擬多裝置版本衝突（Version Mismatch），驗證系統能攔截 409 並彈出「行程已被其他裝置修改」之提示，而非默默覆蓋。
* **次級縫線：資料中台 RLS 權限與軟刪除安全縫線 (Database Security Seam)**
  * **驗證標的**：使用 SQL 測試套件（如 pgTAP）直接對 Supabase 進行權限穿透測試。
  * **外部行為驗證**：
    1. 驗證 User A 的 JWT 無法以任何方式讀取或修改 User B 未分享的行程。
    2. 驗證持有效 `share_token` 的匿名訪客可讀取公開行程，但無法讀取標註 `deleted_at IS NOT NULL` 或 `is_public = false` 之行程。
    3. 驗證訪客無法透過公開分享端點獲取建立者的 `user_id` 或具體預算數字。
* **次級縫線：LLM Structured Output 與機票資料合規縫線 (Pipeline Contract Seam)**
  * **驗證標的**：使用 Ajv Schema Validator 檢驗 n8n 管線產出之最終 JSON 物件。
  * **外部行為驗證**：
    1. 斷言 `meta`, `daily_itinerary`, `transit_overview`, `recommendations`, `packing_list` 欄位型別與結構完整合規。
    2. 斷言所有景點之經緯度座標均在合法地理區間（$lat \in [-90, 90]$, $lng \in [-180, 180]$）。
    3. 斷言每個活動項目均具備唯一的 `id` 字串，機票陣列均包含有效之官方 Deep Link 轉址 URL。

---

## Out of Scope

為了讓團隊高度聚焦於核心閉環的交付與穩定上線，以下項目**明確排除**在本次實作範圍之外：
1. **站內機票金流刷卡與開票 (In-App Ticketing)**：系統只提供比價、驗價與授權 Deep Link 跳轉導流至航空公司或 OTA 官方結帳頁，不承擔站內收卡、開票、退改票與票務客服責任。
2. **多旅伴多人即時共同編輯 (Real-time Collaborative OT/CRDT)**：本階段採用「整包覆蓋寫回 ＋ 樂觀鎖版本控制」，暫不支援多用戶游標即時同步或多人同時在線協同編輯。
3. **即時體育賽程比分與官方售票 API 串接**：運動賽事以指標球場巡禮為基礎，若用戶輸入特定賽事則作為不可動搖之時間錨點 (Anchor Event)，不串接外部即時賽況與動態售票 API。
4. **即時多幣別外匯動態換算**：花費估算一律以行程建立時之基準貨幣（預設 TWD）或固定匯率計算，不提供即時動態外匯換算工具。
5. **旅遊靈感庫 (Inspiration / 口袋名單)**：靈感庫功能延後至 Phase 2 規劃，本次僅保留架構擴展性，前端暫不開放該分頁。

---

## Further Notes

1. **模組獨立開發與交付指引**：
   * **前端工程師**：可依據本規格書定義之 TypeScript 型別與 Mock JSON，獨立開發儀表板、雙層標籤精靈、時間軸主畫布（拖曳與地圖連動）與行李清單。
   * **後端工程師**：可直接部署 [Final SPEC/02-資料庫設計與SQL-DDL.md](Final%20SPEC/02-資料庫設計與SQL-DDL.md) 之 DDL 腳本、啟用 RLS 政策並灌入 `prompt_templates` 種子資料。
   * **自動化工程師**：可依據 [Final SPEC/05-n8n工作流與非同步資料管線.md](Final%20SPEC/05-n8n工作流與非同步資料管線.md) 實作 n8n 工作流，並依據 [Final SPEC/04-機票資料取得服務規格書(Flight-Service).md](Final%20SPEC/04-機票資料取得服務規格書(Flight-Service).md) 串接合法機票 API。
2. **架構圖檔與決策依據**：
   * 系統架構圖：[Final SPEC/diagrams/system-architecture.drawio](Final%20SPEC/diagrams/system-architecture.drawio)
   * 資料庫 ERD 圖：[Final SPEC/diagrams/database-erd.drawio](Final%20SPEC/diagrams/database-erd.drawio)
   * n8n 工作流時序圖：[Final SPEC/diagrams/n8n-workflow-sequence.drawio](Final%20SPEC/diagrams/n8n-workflow-sequence.drawio)
   * 使用者全流程圖：[Final SPEC/diagrams/user-flow.drawio](Final%20SPEC/diagrams/user-flow.drawio)
   * 核心架構決策：[Final SPEC/adr/0001-json-first-itinerary-data-model.md](Final%20SPEC/adr/0001-json-first-itinerary-data-model.md)、[Final SPEC/adr/0002-decoupled-async-generation-via-realtime-and-line-push.md](Final%20SPEC/adr/0002-decoupled-async-generation-via-realtime-and-line-push.md)、[Final SPEC/adr/0003-database-driven-prompt-directives.md](Final%20SPEC/adr/0003-database-driven-prompt-directives.md)、[Final SPEC/adr/0004-authorized-flight-api-over-web-scraping.md](Final%20SPEC/adr/0004-authorized-flight-api-over-web-scraping.md)。
