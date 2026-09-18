# Atrip Design Tokens 與 Tailwind 套用說明 v1.0

工單：TRACK0-01｜交付對象：Track 1 前端與設計組

## 1. 檔案

| 檔案 | 用途 |
|---|---|
| atrip.tokens.json | 色彩、字體、字級、間距、圓角、陰影、元件尺寸及焦點基準 |
| atrip.component-states.json | 元件狀態對既有 Tokens 的引用與視覺覆寫 |
| tailwind.config.js | 從 atrip.tokens.json 讀取數值，產生 theme.extend 擴充設定 |
| 04_Atrip_Tokens_Integration_Guide_v1.md | 命名對應、版本適用方式與驗證範圍 |

JSON 採 Atrip 專案格式，不宣稱可直接匯入任意 Figma 外掛。基礎值以 atrip.tokens.json 為來源；component-states 檔的 `$ref` 以點號路徑引用該檔，不是 JSON Schema 的 `$ref`。Figma 建立 Styles／Variables 時依此對應，元件互動依《03_Atrip_Component_States_Spec_v1.md》實作。

## 2. Tailwind 3.4 套用

新專案：將 `tailwind.config.js` 與 `atrip.tokens.json` 放在前端專案根目錄且維持相鄰。設定檔為 CommonJS；若 package.json 宣告 `"type": "module"`，設定檔改名為 `tailwind.config.cjs`。

已有 Tailwind 設定的專案：將本包設定檔改名為 `atrip.tailwind.preset.cjs`，與 JSON 一起放在根目錄。將它加入既有設定的 presets，不覆蓋既有 content、plugins 或 theme 設定。

```js
// 既有 tailwind.config.cjs；合併到現有內容，不另建第二份主設定檔。
module.exports = {
  presets: [require('./atrip.tailwind.preset.cjs')],
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}', './app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  // 保留專案原有 theme、plugins 等設定；content 依實際目錄補齊。
};
```

若已有 presets，將 Atrip 項目附加至原陣列。若既有 theme.extend 中存在同名 atrip-* 或 brand-primary，需確認衝突後合併，不能保留兩套不同色值。

主樣式檔沿用專案的 Tailwind 3 初始化方式：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Noto Sans TC 字型檔需由前端另行載入；font-atrip 只指定字體清單，不下載字型。字重為 400、500、600、700，載入方式使用現有專案配置。

## 3. Tailwind 4 注意事項

Tailwind 4 不自動偵測 JavaScript 設定檔；需使用 `@config` 明確載入。CSS-first 專案若已有同名 @theme 變數，需檢查覆蓋關係。以下路徑假設樣式檔在 `src/app/globals.css`，設定檔在專案根目錄：

```css
@import "tailwindcss";
@config "../../tailwind.config.js";
```

若改用 .cjs 或 preset 檔名，需同步修改路徑。保留現有 Tailwind 4 的 PostCSS／Vite 安裝設定與來源掃描配置，不混入 Tailwind 3 的初始化指令。本包的實際編譯驗證使用 Tailwind 3.4.17；Tailwind 4 路徑與生成結果需在目標專案驗證。

參考：[Tailwind 3 設定文件](https://v3.tailwindcss.com/docs/configuration)、[Tailwind 4 JavaScript 設定相容方式](https://tailwindcss.com/docs/upgrade-guide#using-a-javascript-config-file)。

## 4. 命名與常用類別

色彩路徑轉成 `atrip-` 加上以連字號連接的名稱。例如 `color.action.primary` → `atrip-action-primary`。

| 規範／Token | 類別範例 |
|---|---|
| color.action.primary | bg-atrip-action-primary |
| color.action.on-primary | text-atrip-action-on-primary |
| color.action.primary-hover | bg-atrip-action-primary-hover |
| color.surface.page | bg-atrip-surface-page |
| color.text.primary | text-atrip-text-primary |
| color.text.secondary | text-atrip-text-secondary |
| color.selection.foreground | border-atrip-selection-foreground |
| color.category.coffee.background | bg-atrip-category-coffee-background |
| color.category.coffee.foreground | text-atrip-category-coffee-foreground |
| font.family | font-atrip |
| type.display | text-atrip-display |
| type.button | text-atrip-button（含字級、行高、字重） |
| type.chip | text-atrip-chip（含字級、行高、字重） |
| space.2 | gap-atrip-2 |
| layout.gutter | px-atrip-gutter |
| size.button | min-h-atrip-button |
| size.chip | min-h-atrip-chip |
| size.icon-button | min-w-atrip-icon-button min-h-atrip-icon-button |
| inset.chip-y | py-atrip-chip-y |
| radius.full | rounded-atrip-full |
| radius.xl | rounded-atrip-xl |
| shadow.soft | shadow-atrip-soft |
| focus.width／offset | outline-atrip-focus outline-offset-atrip-focus |
| color.focus.ring | outline-atrip-focus-ring |
| motion.duration／easing | duration-atrip ease-atrip |

`bg-brand-primary` 僅為既有工單用名的相容別名，指向同一亮綠 #B9E85A。本包不定義用途未確認的 brand-secondary、brand-accent，請改用具體語意名稱。

spacing 使用 rem，以根字級 16px 換算。Chip 的上下內距 10px 是元件尺寸專用值，存於 inset.chip-y，不增加一般版面間距級距。元件最小高度不可改用 h-* 固定高度。

## 5. 狀態套用

component-states 中每個狀態包含 background、foreground、border、shadow 等值；`$ref` 從 atrip.tokens.json 解析，`$context` 從所選分類取得。未列出的屬性沿用元件基礎值；state 資料本身不會自動生成 CSS 或事件。

對照矩陣使用以下規則：

- Disabled > Loading > Pressed > Hover > Default；Selected 與 FocusVisible 為獨立屬性，依第 3 份規範疊加。
- 偏好 Chip 的分類樣式使用完整類別字串映射，不能動態組裝 `bg-atrip-category-${category}-background`，避免掃描遺漏。
- Selected 保留分類底色與文字色，切換 2px 邊框、勾選標記與 shadow.soft；先預留透明邊框與勾選位置，避免尺寸改變。
- Focus 需同時設定 outline-style:solid、寬度、色彩與 offset；不要只設定 outline 顏色。Disabled 不顯示 Focus。
- Hover CSS 放入 `@media (hover: hover) and (pointer: fine)`，並排除 Disabled／Loading。不能只用一般 hover 類別而忽略狀態優先序。
- Loading 的 aria-disabled 不會自動阻止事件；必須另外阻止重複 click、鍵盤與表單送出，並提供處理中文字與結果通知。
- 120ms 過渡僅用於 background-color、border-color、box-shadow；使用 motion-reduce:transition-none 等方式遵循降低動態設定。

靜態分類映射範例：

```js
const chipClasses = {
  coffee: 'bg-atrip-category-coffee-background text-atrip-category-coffee-foreground',
  nature: 'bg-atrip-category-nature-background text-atrip-category-nature-foreground',
  food: 'bg-atrip-category-food-background text-atrip-category-food-foreground',
  walk: 'bg-atrip-category-walk-background text-atrip-category-walk-foreground',
  culture: 'bg-atrip-category-culture-background text-atrip-category-culture-foreground',
  photo: 'bg-atrip-category-photo-background text-atrip-category-photo-foreground',
};
```

此映射是視覺分類，不新增或改寫產品偏好資料欄位。

## 6. 驗證範圍

已於隔離環境使用 Tailwind CSS 3.4.17／PostCSS 8.5.6 完成以下檢查：

- 兩份 JSON 可解析、CommonJS 設定可載入。
- 94 個狀態 Token 引用全部可解析。
- 146 個基礎工具類別實際編譯成功，無編譯警告。
- 主要按鈕字級與字重正確產生；按鈕最小高度 52px、Chip 最小高度 44px 的 Token 符合規範。
- preset 合併後保留測試用既有專案色彩，且正確加入 Atrip 主色。

上述驗證不含小組實際 Next.js 專案 build、Figma 匯入或 LINE 裝置畫面驗收。

目標專案仍需執行既有 build，檢查 Tailwind 版本、掃描路徑、字型載入與設定覆蓋；並在 375px 及窄螢幕檢查元件。非同步流程、LINE 登入及資料串接不屬於此設定包。
