# TRACK0-02｜Dashboard 與雙層標籤精靈 Handoff 規格

版本：v1.0｜375px mobile-first 交付稿  
日期：2026-09-17  
依據：TRACK0-01 色彩／字體／版面／元件狀態／Design Tokens；TRACK0-02 ticket；TRACK0-03 僅作 Header、卡片、字體、圖示與導覽一致性參考。

## 0. 採用決策

1. **TRACK0-01 為視覺 Token 最終來源。** TRACK0-02 ticket 仍寫「暖日橘 `#F97316` CTA」，本稿不沿用舊色，主 CTA 改採 `action.primary #B9E85A` + `action.on-primary #182B36`。
2. **不修改 TRACK0-03。** 本稿只延續其白色 Header、單欄卡片、藍青線性圖示、亮綠主操作與暖白頁底的視覺語言。
3. **本階段不以 Figma Components 完成為前置條件。** SVG/PNG 可直接作前端切版與後續匯入 Figma 參考。
4. **不新增品牌色。** `購物` 等未對應既有六類 category token 的偏好，使用既有 `surface.subtle / text.secondary` 中性色，不自創第七個分類色。

## 1. 交付畫面

| 檔案 | 畫面 | 核心驗收點 |
|---|---|---|
| `01_dashboard.svg/png` | Dashboard | Atrip Header、主 CTA、活躍中卡片、當前關注、歷史封存、底部導覽 |
| `02_wizard_default.svg/png` | 雙層標籤精靈預設 | 第一層「平台推薦經典遊」預設已選；第二層收合但顯示推薦摘要；0 點擊可送出 |
| `03_wizard_expanded.svg/png` | 微調／第二層展開 | 住宿、交通、興趣三組 Pill；Selected 有深綠邊框＋勾選＋ soft shadow |
| `04_wizard_selected.svg/png` | 已選取 | 展示多個已選 Chip；選取「運動賽事」後出現賽事／時間錨點欄位 |

## 2. 畫布與版面

- 設計 frame：**375 × 844 px**。
- 頁面左右 gutter：**20 px**；內容寬 **335 px**。
- `< 360px` 時 gutter 改為 **16 px**。
- 主內容單欄；一般 section gap 32 px；卡片內距 16 px。
- 固定底部操作區：80 px（含上分隔線）；內容需保留相同底部空間，避免 CTA 遮住最後元件。
- Dashboard 固定底部導覽：68 px；Icon 視覺 20–24 px，觸控熱區至少 44 px。

## 3. 字體

- Font family：`Noto Sans TC`, `PingFang TC`, `Microsoft JhengHei`, sans-serif。
- H1：20/30, 700；H2：16/24, 600；Body：14/22, 400；Caption：12/18, 400；Button：16/24, 600；Chip：14/20, 500。
- 主要文字：`#182B36`；次要文字：`#52616B`。不使用透明度降低可讀性。

## 4. 核心 Token

```text
action.primary         #B9E85A
action.on-primary      #182B36
surface.page           #FFFDFA
surface.card           #FFFFFF
surface.subtle         #F3F5EF
text.primary           #182B36
text.secondary         #52616B
border.subtle          #E4E8E0
selection.background   #EFF8DA
selection.foreground   #416519
brand.logo-ai          #277E99
focus.ring             #277E99
```

圓角：`md 12 / lg 16 / xl 20 / full 9999`。一般卡片不加陰影；Selected Chip 才使用 `shadow.soft`。

## 5. Dashboard 切版規格

### 5.1 Header
- 高 64 px，白底，底部 1 px `border.subtle`。
- 左：Atrip 品牌圖；右：44 px IconButton 熱區。

### 5.2 主 CTA
- 335 × 52 px，full radius。
- Label：`＋ 規劃新旅程`。
- Default：`#B9E85A`；Pressed：`#ACDD4D` + `#416519` 邊框。

### 5.3 活躍行程卡
- 寬 335 px、radius 20 px、1 px `border.subtle`。
- 目的地視覺／縮圖：左側；內容區右側。
- 必備內容：目的地／旅程名、日期區間、天數、更多操作。
- 當前關注：`selection.background` + 星號 + `selection.foreground`，不可只以顏色表達。
- 更多選單：44 × 44 px 點擊區；操作項目：**設為當前關注／封存／移至垃圾桶**。

### 5.4 歷史旅程
- 預設折疊；整列最小高度 48–56 px。
- 展開後以清單顯示，避免與活躍旅程卡競爭視覺層級。

## 6. 雙層標籤精靈

### 6.1 第一層：懶人套版
- 橫向可滑動卡列，保留下一張局部露出以提示可橫滑。
- 套版：`平台推薦經典遊`（預設 Selected）、`都會潮流`、`運動賽事`。
- Selected：`selection.background`、2 px `selection.foreground`、勾選；保留卡片尺寸。
- **預設狀態不得要求使用者先點選任何項目。** 使用者可直接按 CTA。

### 6.2 第二層：微調
三組：
- 住宿策略：`連住同一間` / `隨景點換宿`
- 交通模式：`大眾捷運` / `租車自駕`
- 興趣：`主題美食` / `古蹟文化` / `購物`（可複選）

PreferenceChip：
- min-height 44 px；左右 12 px；上下 10 px；2 px 預留邊框。
- Selected 一律顯示 **勾選 + 深綠邊框**，不能只靠底色。
- 本地選取立即更新，不顯示 Loading。
- `aria-pressed=true/false`；同一群組提供可讀 label。

### 6.3 運動賽事條件展開
- 第一層選取 `運動賽事` 時，展開單行 `賽事／時間錨點（選填）`。
- Input min-height 48 px，radius 12 px。
- Placeholder 範例：`例：9/18 18:00 東京巨蛋`。
- 該欄位的值作為固定時間偏好傳給規劃流程；前端不要由文字標籤自行推斷 event category。

## 7. 固定 CTA 與 Thumb Zone

- 固定於 viewport 底部，左右 20 px，按鈕高 52 px。
- 位於單手拇指最易觸達區，且始終不被第二層內容推離畫面。
- CTA label：`一鍵開始 AI 規劃`。
- Default 已可提交；若有資料規則造成 Disabled，需在按鈕上方顯示原因，不以灰階透明度作唯一提示。
- Loading：`AI 規劃中…` + 20 px progress icon，阻止重複送出並保留焦點。

## 8. 前端元件建議

```text
TripDashboard
├── BrandHeader
├── PrimaryActionButton
├── ActiveTripSection
│   └── TripCard
│       ├── DestinationMedia
│       ├── CurrentFocusBadge
│       └── TripOverflowMenu
├── ArchivedTripAccordion
└── BottomNavigation

PreferenceWizard
├── WizardHeader
├── PresetScroller
│   └── PresetCard
├── PreferenceSummary / FineTuneAccordion
├── PreferenceGroup
│   └── PreferenceChip
├── SportsAnchorInput (conditional)
└── StickyPlanningCTA
```

## 9. 建議資料／狀態介面

```ts
type PresetId = 'classic' | 'urban' | 'sports';

type WizardState = {
  preset: PresetId;                 // default: 'classic'
  stayStrategy: 'same_hotel' | 'move_by_area';
  transitMode: 'public_transit' | 'self_drive';
  interests: string[];
  sportsAnchorNote?: string;
};
```

畫面狀態與資料狀態分離：`expanded/collapsed` 不等同於是否已選；`pressed` 也不可代替 `selected`。

## 10. RWD / Accessibility 驗收

- 320 / 375 / 390 / 430 px 皆需檢查；375 為本稿基準。
- Chip min-height 44、Button min-height 52、IconButton 44 × 44。
- 200% 文字縮放時允許元件增高，不裁切文字。
- `:focus-visible`：3 px `#277E99` outline + 3 px offset。
- Hover 只在精細指標裝置啟用；觸控端所有必要狀態都要靠形狀／文字／圖示表達。
- 一般文字對比至少 4.5:1。

## 11. 本次交付與 TRACK0-03 的邊界

- TRACK0-03 **不修改**。
- 僅對齊：Header 白底與邊框、卡片圓角語言、Noto Sans 系列字階、藍青線性圖示、亮綠主操作、暖白背景。
- TRACK0-02 的 Dashboard／Wizard 是新的畫面與互動狀態，不回寫 TRACK0-03 的 timeline、drag/drop、packing list layout。
