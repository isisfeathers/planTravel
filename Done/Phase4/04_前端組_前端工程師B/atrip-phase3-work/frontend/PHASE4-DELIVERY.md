# Atrip Frontend B Phase 4 交付說明

## 完成範圍

本交付以 `frontend_app_complete_phase2_3.zip` 為基底，完成兩項工作：Canvas 地圖與時間軸雙向聯動，以及 TRACK1-08 去識別分享與 Fork。

### Canvas 地圖雙向聯動

`src/app/canvas/[id]/page.tsx` 使用 `InteractiveMapClient`。時間軸卡片點擊後設定 `activeActivityId`，Leaflet 元件會依此呼叫 `flyTo`；地圖 Marker 點擊則使用同一個 callback，設定 active 狀態並以 `scrollIntoView` 將時間軸卡片平滑捲動至畫面中央。切換日期時清除 active activity，地圖只顯示當日活動座標。手機版採單欄，桌面版採時間軸與地圖雙欄，地圖在桌面版 sticky 顯示。

### 去識別分享

`src/app/share/[token]/page.tsx` 僅以 `share_token`、`is_public = true` 與 `deleted_at IS NULL` 查詢必要公開欄位，不選取 `user_id`、作者資料或其他個資。`toDeidentifiedItinerary` 在資料進入 React state 前遞迴移除 `budget_level`、`cost_estimate`、`estimated_cost`、`approx_cost`、`budget` 與 `price` 欄位。分享頁使用 `PublicActivityCard`，不使用可編輯的拖曳 ActivityCard，也不渲染預算或作者欄位。

### Fork

`src/components/share/ForkButton.tsx` 先檢查 Supabase session。無 session 時將 `share_token` 暫存於 `sessionStorage`，呼叫既有 `useAuthStore.initLiffAndAuth()` 走 LINE LIFF 登入；登入回來後自動重試。已登入時只以公開查詢取得來源 `id`，再呼叫共用 API 契約指定的 `supabase.rpc('fork_itinerary', { source_itinerary_id })`。完整偏好、行程與航班資料由後端 RPC 在受保護的交易內複製，前端不重新組裝或傳送敏感欄位，成功後依 `new_itinerary_id` 導向 `/canvas/[new_id]`。

## 正式環境依賴

正式執行前需提供：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_LIFF_ID`

Supabase 需套用 TRACK2-01 RLS，包含公開行程 SELECT、登入使用者 session 與 `fork_itinerary(source_itinerary_id)` RPC。分享端點必須維持 `is_public = true`、`deleted_at IS NULL` 條件。正式建置不可使用本次驗證用的 placeholder 值。

## 驗收

- `pnpm test`：1 個去識別安全測試通過。
- `pnpm typecheck`：通過。
- `pnpm build`：以不落盤的 placeholder Supabase 公開值建置通過。
- Canvas 與 Share 路由本機及公開 URL HTTP 200 驗證通過。
