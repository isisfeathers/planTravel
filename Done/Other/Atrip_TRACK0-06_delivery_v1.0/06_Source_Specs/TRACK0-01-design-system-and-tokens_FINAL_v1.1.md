# TRACK0-01: Atrip 品牌設計系統與 Tailwind Tokens 規範 — Final v1.1

- **工單編號**：TRACK0-01
- **所屬軌道**：Track 0 - 視覺 UI/UX 設計組
- **文件用途**：最終規格追溯／前端附件
- **狀態**：`FINAL / HANDOFF-READY`
- **更新日期**：2026-09-17

> **重要：本版取代原始工單中的舊 UI 色碼、元件尺寸與狀態描述。**
> 前端實作不得再以原始 ticket 內的 `#347FA3 / #6F8F72 / #F97316` 作為目前 UI Action Token；所有畫面以本版與 TRACK0-01 Final Design System / Tokens 為準。

---

## 0. Source of Truth

前端套版時的優先序：

1. TRACK0-01 Final Design System / Tokens
2. Figma Master Library（Foundations / Components / QA）
3. TRACK0-02 Dashboard / 雙層標籤精靈 Final
4. TRACK0-03 時間軸 Final
5. TRACK0-05 Print / PDF Final
6. 原始 ticket 僅供需求追溯，不作為色碼與尺寸的最終依據

若視覺稿、舊工單與 Final Tokens 有衝突，**Final Tokens 優先**。

---

## 1. 任務完成定義

Atrip 共用 Design System 已定義：

- Color / semantic tokens
- Typography
- Spacing
- Radius
- Shadow
- Button / PreferenceChip / IconButton / InfoTag
- Default / Hover / Pressed / Selected / Focus / Disabled / Loading 狀態
- Mobile-first 320–430px RWD 規則
- Figma 元件庫與前端對應規則

---

## 2. Final Color Tokens

| 用途 | Token | Final value |
|---|---|---|
| Primary action | `color.action.primary` | `#B9E85A` |
| Primary action text/icon | `color.action.on-primary` | `#182B36` |
| Primary hover | `color.action.primary-hover` | `#ACDD4D` |
| Page | `color.surface.page` | `#FFFDFA` |
| Card | `color.surface.card` | `#FFFFFF` |
| Subtle surface | `color.surface.subtle` | `#F3F5EF` |
| Primary text | `color.text.primary` | `#182B36` |
| Secondary text | `color.text.secondary` | `#52616B` |
| Subtle border | `color.border.subtle` | `#E4E8E0` |
| Selection background | `color.selection.background` | `#EFF8DA` |
| Selection foreground | `color.selection.foreground` | `#416519` |
| Focus ring / logo AI | `color.focus.ring` | `#277E99` |
| Info tag bg | `color.tag.background` | `#F0F2EC` |
| Info tag fg | `color.tag.foreground` | `#52616B` |

### 舊工單色碼處理

原始 ticket 的：

- `#347FA3`
- `#6F8F72`
- `#F97316`
- `#F8FAFC`

屬早期需求輸入，**不得直接覆蓋 Final semantic tokens**。若未來品牌識別另有使用需求，需由 Design System 明確重新 mapping 後才使用。

---

## 3. Typography

全介面中文、英文與數字：

```css
font-family: "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif;
```

| Token | Size | Line-height | Weight | 用途 |
|---|---:|---:|---:|---|
| `type.display` | 28px | 40px | 700 | 首頁主宣言 |
| `type.h1` | 20px | 30px | 700 | 頁面主標題 |
| `type.h2` | 16px | 24px | 600 | 區塊／卡片標題 |
| `type.body` | 14px | 22px | 400 | 內文 |
| `type.caption` | 12px | 18px | 400 | 日期／輔助資訊 |
| `type.button` | 16px | 24px | 600 | Button |
| `type.chip` | 14px | 20px | 500 | PreferenceChip |
| `type.input` | 16px | 24px | 400 | Input / Select |

**長文字規則：**不縮字、不裁切；允許換行並讓容器自然增高。

---

## 4. Layout / Responsive

- 基準 viewport：`375px`
- QA viewport：`320 / 375 / 390 / 430px`
- `>= 360px`：左右 page padding `20px`
- `< 360px`：左右 page padding `16px`
- 375px 可用內容寬度：`335px`
- 320px 可用內容寬度：`288px`
- 主要內容單欄；chip / card 可於內容區換行
- Chip：`flex-wrap`，gap `8px`，不可強制所有 chip 等寬
- 雙欄 card：gap `12px`，單卡 min-width `152px`；容器不足 `316px` 時改單欄
- 內容高度自然成長，不使用固定高度裁字
- 不應產生非必要 horizontal scroll
- 文字放大至 200% 時，主要操作仍可使用
- 固定底部 CTA / Navigation 必須保留其實際高度與 `safe-area-inset-bottom`

---

## 5. Shared Components

| Component | Final minimum | Radius | 備註 |
|---|---:|---:|---|
| Primary / Secondary Button | 52px high | full | px 20 / py 12 |
| PreferenceChip | 44px high | full | px 12 / py 10 |
| Input / Select | 48px high | 12px | px 12 / py 12 |
| IconButton | 44×44px | full | visual icon 20px |
| InfoTag | content-driven | 8px | px 8 / py 4 |

圖示視覺尺寸：Chip 18px / Button 20px / Main navigation 24px。

### Radius

- `radius.sm` 8px
- `radius.md` 12px
- `radius.lg` 16px
- `radius.xl` 20px（景點／旅程卡片）
- `radius.full` 9999px

### Shadow

- `shadow.none`：一般頁面、預設卡片、button、tag
- `shadow.soft`：Selected Chip
- `shadow.popover`：浮層／對話框

一般卡片以留白與細邊框區分，不普遍加 shadow。

---

## 6. Component States

### Primary / Secondary Button

必須支援：

- Default
- Hover（僅精細指標裝置）
- Pressed
- Focus
- Disabled
- Loading

注意：

- Pressed 不縮放、不改尺寸
- Disabled 不以整體 opacity 降低可讀性
- Loading 保留按鈕位置與寬度，阻止重複送出
- Focus 使用 `#277E99` 3px outline + 3px offset

### PreferenceChip

- `Selected` 與 `State` 分開
- Selected 保留 category background，加 `#416519` 邊框＋勾選＋soft shadow
- 勾選位置預留，切換 Selected 不得造成寬度跳動
- Pressed ≠ Selected
- Selected + Focus 必須可同時顯示
- Disabled 保留既有選取值，不自動清除

### IconButton

- Action / Toggle 分開
- Toggle 使用 Selected + `aria-pressed`
- 每個 IconButton 都要有可讀名稱

---

## 7. Accessibility / Interaction

- 一般文字對比度 >= 4.5:1
- Focus 不可被 parent overflow 裁切
- Hover 不承載必要資訊
- keyboard：Tab / Enter / Space 可正常操作
- Selected 不只靠顏色，需有勾選或實心圖示
- Loading 需有文字狀態，不只 spinner
- 尊重 `prefers-reduced-motion`

---

## 8. Figma Library QA

Figma 頁面：

- `01 Foundations`
- `02 Components`
- `03 QA`

`03 QA` 至少保留：

- 320px
- 375px
- 390px
- 430px
- 長標題
- 長 chip
- Selected + Focus
- Disabled / Loading
- 200% text scale 壓力測試

---

## 9. Frontend Handoff Checklist

- [ ] 前端引用 Final semantic tokens，不硬編舊 ticket 色碼
- [ ] Button / Chip / IconButton 尺寸符合規範
- [ ] 320–430px 無水平捲動、裁字、重疊
- [ ] Header / Card / Typography / Icon / Navigation 與 TRACK0-02 / 03 共用同一 Design System
- [ ] Sticky bottom UI 已處理 safe-area
- [ ] 元件狀態與 ARIA 行為完成
- [ ] Tailwind / token 檔載入成功
- [ ] Figma / browser QA 結果記錄完成
