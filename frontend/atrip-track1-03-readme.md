# Atrip TRACK1-03 階段 1：雙層標籤精靈純資料邏輯

**版本：** 1.0.0  
**技術棧：** Next.js 14.2.35、React 18、TypeScript、Zustand、Zod、Supabase JavaScript Client  
**範圍：** TRACK1-03 階段 1（Headless State）

## 1. 交付結論

本交件包完成雙層標籤精靈的純資料邏輯。初次載入時會選取 `classic_bundle`，並立即具備可送出的完整 `preference_snapshot`。使用者選擇其他套版時，下層狀態會整組切換。使用者手動修改任一欄位或主題標籤後，內部狀態會切換為 `custom`。由於正式資料契約沒有定義 `custom` 為合法 `selected_bundle` 值，自訂組合輸出時會省略選填的 `selected_bundle`，不會自行發明新的 API 值。

此交件包沒有加入設計稿、品牌顏色或客製 CSS。`WizardHeadlessForm.tsx` 只提供可操作的語意化 HTML 骨架，以便驗證資料流。視覺套版應等 TRACK0-02 Wireframe 與正式 Tailwind Tokens 就緒後再執行。

## 2. 交付內容

| 檔案 | 責任 |
|---|---|
| `src/contracts/atrip.ts` | 將 03 JSON Schema 規格書中的偏好與行程建立型別轉為 TypeScript 契約。 |
| `src/contracts/preferenceSnapshot.ts` | 使用 Zod 執行 `PreferenceSnapshot` 執行期驗證，拒絕額外欄位。 |
| `src/stores/useWizardStore.ts` | 實作預設套版、套版聯動、手動微調、偏好還原、重設與快照組裝。 |
| `src/repositories/itineraryRepository.ts` | 實作 `public.itineraries` 的 Supabase INSERT 與錯誤處理。 |
| `src/lib/supabase/client.ts` | 建立只讀取 `NEXT_PUBLIC_*` 變數的瀏覽器端 Supabase Client。 |
| `src/components/wizard/WizardHeadlessForm.tsx` | 示範頁面如何使用 Store、取得登入者、建立行程並導向等待頁。 |
| `src/app/wizard/page.tsx` | 建立 `/wizard` App Router 路由。 |
| `tests/useWizardStore.test.ts` | 驗證 0 點擊、三套版聯動、自訂切換、Mock 還原與賽事備註行為。 |
| `tests/itineraryRepository.test.ts` | 驗證 INSERT payload、回傳識別碼與資料庫錯誤處理。 |

## 3. 第一步：本機驗收

請在此資料夾執行：

```bash
pnpm install
pnpm test
pnpm typecheck
pnpm build
```

目前交付版本的實際驗收結果如下。

| 檢查 | 結果 |
|---|---|
| Vitest | 2 個測試檔、7 項測試全部通過 |
| TypeScript | `tsc --noEmit` 通過 |
| Next.js | Next.js 14.2.35 production build 通過 |
| 樣式紅線 | `src/` 無 hex 色碼，未加入客製視覺樣式 |

## 4. 第二步：接入團隊現有 Next.js 專案

團隊建立正式前端專案後，先複製 `src/contracts`、`src/stores`、`src/repositories` 與 `src/lib/supabase`。接著把 `src/components/wizard/WizardHeadlessForm.tsx` 與 `src/app/wizard/page.tsx` 合併到對應路徑。若正式專案已有 Supabase Client，保留團隊版本並只替換 `getSupabaseBrowserClient()` 的 import，不要建立第二個 Session 管理來源。

安裝本功能所需依賴：

```bash
pnpm add zustand zod @supabase/supabase-js
```

把 `.env.example` 複製為 `.env.local`，再填入團隊 Supabase 專案的 URL 與 anon key。瀏覽器端只能使用 anon key；不得放入 `service_role`。

## 5. 第三步：連接 TRACK1-01 登入環境

`WizardHeadlessForm` 在提交前呼叫 `supabase.auth.getUser()`。未登入時會顯示錯誤，不會嘗試建立行程。TRACK1-01 完成後，應由其 LINE LIFF 與 Supabase Session 流程提供使用者身分。成功 INSERT 後，頁面使用回傳的 `id` 導向 `/waiting/[id]`。

## 6. 狀態機規則

| 使用者事件 | `selectedBundle` | 下層資料結果 |
|---|---|---|
| 初次進入或 `reset()` | `classic_bundle` | `single_hotel`、`public_transit`、`relaxed`、`standard`、`gourmet`、`cultural` |
| `applyBundle("shopping_bundle")` | `shopping_bundle` | `single_hotel`、`public_transit`、`packed`、`standard`、`shopping` |
| `applyBundle("sports_bundle")` | `sports_bundle` | `single_hotel`、`public_transit`、`moderate`、`standard`、`sports` |
| 修改欄位或切換 interest | `custom` | 保留修改後資料；輸出時省略未定義的自訂 bundle 值 |
| `hydratePreferences(mock)` | 契約中的 bundle 或 `custom` | 以已儲存的 `PreferenceSnapshot` 預填 |

## 7. 契約決策與待團隊確認事項

正式文件之間存在數項差異。本交件包採取「不發明欄位、不擴充列舉、以可執行 DDL/API 為準」的保守策略。

| 差異 | 本交件包處理 |
|---|---|
| 工單範例未包含 `user_id`，但 DDL 宣告 `user_id NOT NULL` 且 RLS 要求等於 `auth.uid()` | INSERT payload 帶入目前登入者的 `user_id`。 |
| SPEC 曾描述行程以 `queued` 建立，但 `ItineraryStatus` 與 DDL 不允許 `queued` | `itineraries.status` 使用 `generating`；`queued` 保留給 `itinerary_jobs.status`。 |
| UI 文字包含「連住商圈」與「交通樞紐住宿」，但 `AccommodationStrategy` 只有兩個列舉 | 兩種套版皆映射至合法的 `single_hotel`，不新增列舉值。 |
| UI 有多個細粒度興趣名稱，但 `prompt_templates.option_key` 目前只定義 `gourmet`、`shopping`、`sports`、`cultural` | Store 只使用資料庫種子中存在的 option key。 |
| `event_note` 在正式 TypeScript 契約中是選填 | sports 套版會顯示欄位，但不把備註改成額外的必填條件。 |
| 嚴格 LLM JSON Schema 把 `tips`、`transit_to_next` 列為必填，但 TypeScript 介面與官方 Mock 允許缺省 | 此差異不影響 TRACK1-03；TRACK1-05 開工前應由資料契約負責人統一規則。 |
| `mock_itinerary.json` 把 `flight_data` 放在 `ItineraryPayload` 根內，但正式介面把它定義為 `ItineraryEntity.flight_data` 的同層欄位 | 本階段原樣保存 Mock，不用它建立偏好快照；TRACK1-05／08 前需先正規化。 |

## 8. 尚未納入本階段的工作

此版本不包含 TRACK0-02 視覺稿、Tailwind Token 注入、真實 Supabase 專案連線、LINE LIFF 登入、`itinerary_jobs` 建立流程、等待頁、Realtime、地圖與分享功能。這些項目分別屬於 TRACK1-03 階段 2 或後續工單，必須在其硬性依賴就緒後實作。

## References

[1]: file:///home/ubuntu/upload/03-%E8%A1%8C%E7%A8%8B%E8%88%87%E5%81%8F%E5%A5%BD-JSON-Schema%E8%A6%8F%E6%A0%BC%E6%9B%B8.md "Atrip 行程與偏好 JSON Schema 規格書 v2.0.0"
[2]: file:///home/ubuntu/upload/DATA_STRUCTURES.md "Atrip 全系統資料結構與領域模型規格書 v2.0.0"
[3]: file:///home/ubuntu/upload/02-%E8%B3%87%E6%96%99%E5%BA%AB%E8%A8%AD%E8%A8%88%E8%88%87SQL-DDL.md "Atrip 資料庫設計與 SQL DDL 規格書"
[4]: file:///home/ubuntu/upload/06-API%E5%8D%94%E5%AE%9A%E5%A5%91%E7%B4%84%E6%9B%B8(OpenAPI-REST).md "Atrip API 協定契約書"
[5]: file:///home/ubuntu/upload/TRACK1-03-dual-layer-chip-wizard.md "TRACK1-03 雙層標籤精靈工單"
