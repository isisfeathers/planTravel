# Atrip TRACK1-03 雙層標籤精靈｜D1～D4 完整交付包

**版本：** 2.0.0  
**技術棧：** Next.js 14.2.35、React 18、TypeScript、Tailwind CSS 3.4.17、Zustand、Zod、Supabase JavaScript Client、Lucide React  
**交付範圍：** D1～D2 純資料邏輯 + D3～D4 視覺套版與互動狀態

## 1. 交付結論

本交付包保留 D1～D2 的正式資料契約、Zustand 狀態機、Zod 執行期驗證與 Supabase repository，並依 Track0 最終 Tokens、component states、Wizard Default／Expanded／Selected 設計稿完成 LIFF Web App 的視覺層。初次進入即套用 `classic_bundle`，可 0 點擊產生合法 `PreferenceSnapshot`；手動微調仍依正式契約切換為 `custom`，但視覺層會保留使用者目前選取的來源套版卡，不把 UI 選取狀態誤寫回資料契約。

所有 UI 色彩、字型、間距、圓角、陰影、元件尺寸及焦點值均從 `atrip.tokens.json` 經 `tailwind.config.js` 產生語意類別。`src/` 不使用客製 hex 色碼、任意 arbitrary color class 或 `service_role`。

## 2. 主要交付檔案

| 檔案 | 責任 |
|---|---|
| `atrip.tokens.json` | Track0 Final 基礎 Design Tokens，主色 `color.action.primary` 為 `#B9E85A`。 |
| `atrip.component-states.json` | Button／Chip 狀態引用與優先序資料。 |
| `tailwind.config.js` | 將 Atrip Tokens 映射為 `atrip-*` 語意工具類別，並保留 `brand-primary` 相容別名。 |
| `postcss.config.js` | Tailwind 3.4 與 Autoprefixer 編譯設定。 |
| `src/app/globals.css` | Semantic UI classes、Selected／Hover／Pressed／Focus／Loading 與 reduced-motion 規則。 |
| `src/components/wizard/WizardHeadlessForm.tsx` | Default／Expanded／Sports Selected 三種狀態的完整可操作畫面與既有提交資料流。 |
| `src/components/wizard/PresetCard.tsx` | 橫向滑動套版卡、Selected 外框、勾選與圖示狀態。 |
| `src/components/wizard/PreferenceChip.tsx` | 住宿、交通、興趣 Chip 與分類色彩映射。 |
| `src/stores/useWizardStore.ts` | 正式偏好狀態機；運動賽事套版聯動住宿換宿、大眾捷運、運動／美食／購物。 |
| `scripts/visual-qa.cjs` | 320／375／390／430px、展開、Sports Selected、Focus、200% 文字縮放自動化 QA。 |
| `qa/visual-qa-report.json` | 最終自動化視覺驗收結果。 |
| `qa/visual-review-notes.md` | 關鍵畫面人工視覺檢查紀錄。 |
| `docs/design-reference/` | Track0 handoff、Wizard spec 與三張 SVG 參考稿。 |

## 3. 本機驗收

```bash
pnpm install
pnpm test
pnpm typecheck
pnpm build
pnpm qa:visual
```

最終驗收結果：

| 檢查 | 結果 |
|---|---|
| Vitest | 2 個測試檔、7 項測試通過 |
| TypeScript | `tsc --noEmit` 通過 |
| Next.js | Next.js 14.2.35 production build 通過 |
| Responsive QA | 320／375／390／430px 無頁面水平溢位 |
| Default UI | 1 張套版卡 Selected、CTA 52px、0 點擊摘要正確 |
| Expanded UI | Chip 最小高度 44px、Selected 數量與聯動正確 |
| Sports Selected | 賽事時間錨點、住宿／交通／興趣聯動、套版 Selected 保留 |
| 200% 文字 | 320px 可自然換行增高，無固定高度裁切或水平溢位 |
| 樣式紅線 | `src/` 無 raw hex、arbitrary color class 或 `service_role` |
| Token | `color.action.primary === #B9E85A` |

## 4. 與正式資料契約的邊界

`selectedBundle` 是前端狀態機的 UI／資料模式欄位；使用者手動微調後會輸出不含 `selected_bundle` 的正式快照，因為正式契約沒有 `custom` 列舉值。視覺上的來源套版卡另由 `activePreset` 管理，以符合 Selected 設計稿，不新增 API 欄位。

`event_note` 維持選填；只有當 `sports` interest 存在時顯示時間錨點輸入。UI 文案「隨景點換宿」映射至既有 `switch_hotel`，交通文案「大眾捷運」映射至既有 `public_transit`，沒有自行擴充資料列舉。

## 5. 合併至團隊現有 Next.js 專案

若目標專案已有 Tailwind 設定，請把 `tailwind.config.js` 改名為 `atrip.tailwind.preset.cjs`，與 `atrip.tokens.json` 放在根目錄，並以 preset 合併，不要覆蓋既有 `content`、`plugins` 或其他 theme。複製 `src/contracts`、`src/stores`、`src/repositories`、`src/lib/supabase` 與 Wizard components；若已有 Supabase Client，沿用團隊的 Session 管理來源。

```bash
pnpm add zustand zod @supabase/supabase-js lucide-react
pnpm add -D tailwindcss@3.4.17 postcss autoprefixer
```

瀏覽器端只可使用 `NEXT_PUBLIC_SUPABASE_URL` 與 `NEXT_PUBLIC_SUPABASE_ANON_KEY`；不可放入 `service_role`。正式 LIFF 登入、waiting／Realtime、地圖與分享頁仍依各自 Track1 工單接入。

## 6. 尚未納入

本包不包含 TRACK1-04 即時等待頁、TRACK1-06 地圖同步、TRACK1-08 去識別分享與分叉、真實 LINE LIFF 登入流程或正式 Supabase 專案密鑰。既有提交成功後仍導向 `/waiting/[id]`，供後續工單接續。

## 7. TRACK1-04 動態等待畫布

新增路由 `/waiting/[id]`、`src/hooks/useRealtimeSubscription.ts` 與 `src/components/waiting/WaitingCanvas.tsx`。

Hook 執行順序如下：

1. 首次以 `itineraries.id` 查詢目前 `status`，避免漏接已經完成的行程。
2. 建立 `postgres_changes` UPDATE channel，監聽 `public.itineraries` 的指定 `id`。
3. 每 5 秒執行一次 Supabase GET 查詢作為 WebSocket 中斷時的備援。
4. `completed` 只導航一次至 `/canvas/[id]`；`failed` 顯示錯誤代碼與重新生成按鈕。
5. Realtime 連線狀態會顯示「即時連線中」或「備援檢查中」，並在 unmount 時清除 timer、unsubscribe channel。

正式環境需確認 Supabase Realtime 已將 `public.itineraries` 加入 publication，且資料表具有 `status` 與選用的 `error_code` 欄位。若後端使用不同的錯誤欄位，請在 Hook 的 select 與 payload mapping 位置對應，不要新增前端資料契約欄位。

## 8. TRACK1-06 互動地圖

新增 `src/components/map/InteractiveMap.tsx` 與 `InteractiveMapClient.tsx`。地圖採 Leaflet + OpenStreetMap，透過 dynamic import 關閉 SSR，避免瀏覽器專用 API 在 Next.js server render 時執行。

元件輸入維持中性的前端 view model：

```ts
{
  id: string;
  name: string;
  timeSlot?: string;
  coordinates?: { lat: number; lng: number };
}
```

使用方式：

```tsx
<InteractiveMap
  activities={activities}
  activeActivityId={activeActivityId}
  onActivitySelect={setActiveActivityId}
/>
```

具體行為：有座標時以 markers 顯示活動，初次載入使用 `fitBounds`；`activeActivityId` 改變時呼叫 Leaflet `flyTo` 平滑移動至該 marker；點擊 marker 會回傳 activity id；沒有座標時顯示可讀取的空狀態。地圖 marker 使用 Atrip semantic classes，不直接寫客製色碼。

從正式 `mock_itinerary.json` 轉換活動資料時，使用 `location_name` → `name`、`time_slot` → `timeSlot`，保留 `coordinates` 原結構；不要把地圖 view model 寫回正式 JSON Schema。

本次整合新增依賴：`leaflet`、`react-leaflet@4.2.1`、`@types/leaflet`。此版本與既有 React 18／Next.js 14 相容。

## 9. TRACK1-04／TRACK1-06 驗收結果

| 檢查 | 結果 |
|---|---|
| Realtime Hook 型別檢查 | 通過 |
| Waiting route production build | 通過，`/waiting/[id]` 為 dynamic route |
| 5 秒 polling fallback | 已實作 |
| completed 導向 | 已實作且以 ref 防止重複導向 |
| failed 錯誤狀態 | 已實作 |
| Leaflet markers | 已實作 |
| `fitBounds` | 已實作 |
| active marker `flyTo` | 已實作，0.8 秒平滑移動 |
| React peer dependencies | 無問題 |
| 原始色碼／secret 掃描 | 通過 |
