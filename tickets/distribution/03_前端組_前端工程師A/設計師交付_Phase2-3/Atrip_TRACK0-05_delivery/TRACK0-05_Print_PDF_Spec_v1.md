# TRACK0-05｜A4 行程範例與 PDF／列印規格 v1.0

工單：TRACK0-05  
基準：TRACK0-03 行程時間軸為唯一視覺與內容架構來源；TRACK0-01 Design System 為色彩、字體、間距與元件語意來源。  
本工單不修改 TRACK0-03 既有 LIFF UI，也不以完成 Figma Components 為前置條件。

## 1. 本次交付

- `TRACK0-05_A4_Itinerary_Sample_v1.pdf`：A4 portrait 高擬真行程輸出範例。
- `TRACK0-05_A4_Itinerary_Sample_v1.png`：同版面 300 dpi 預覽圖，供 review／簡報／Figma 放圖。
- `TRACK0-05_A4_Itinerary_Sample_v1.html`：可直接於 Chromium 開啟的列印原型。
- `atrip-print.css`：A4、分頁與 print-only 規則，可移植到前端。
- `TRACK0-05_Print_PDF_Spec_v1.md`：本文件。

## 2. 不變原則

### 2.1 不重新設計 TRACK0-03

保留 TRACK0-03 的資訊層級與順序：

1. 行程名稱
2. Day 摘要
3. Map Preview
4. Timeline
5. Activity Card
6. Transit Pill
7. Time Anchor Card

活動卡、交通膠囊、時間軸節點、時間錨點的色彩語意、圓角與主要文字層級均沿用 TRACK0-03／TRACK0-01。

### 2.2 Print-only translation 不回寫手機 UI

PDF／紙本不具互動能力，因此下列元素只在列印層隱藏，不更動 LIFF 畫面：

- 分享、匯出 PDF 等操作按鈕
- 時間軸／地圖切換控制
- 拖曳把手與 Drag／Drop 狀態
- hover、focus、loading 等互動狀態

保留所有行程內容、時間、標籤、費用、提示、交通與時間錨點資訊。

## 3. A4 版面規格

| 項目 | 規格 |
|---|---|
| 紙張 | A4 Portrait，210 × 297 mm |
| 出血 | 一般家用／辦公列印不設出血；若交印刷廠另由製作端加 3 mm，不改內容尺寸 |
| 安全邊界 | 左右 15 mm；上 12 mm；下至少 11 mm |
| 可用內容寬 | 180 mm |
| 背景 | `surface.page #FFFDFA` |
| Header | 品牌圖形＋行程名稱＋目前 Day；底部 `border.subtle` 分隔 |
| Footer | 只放行程識別／Day 或頁碼；不得搶過 Timeline 視覺層級 |
| 字型 | Noto Sans TC；fallback 依 TRACK0-01 |
| 色彩輸出 | `print-color-adjust: exact`；PDF 匯出需 `printBackground: true` |

A4 是「輸出版面」，不是新增 App breakpoint。手機版 360–430 px 與既有 768 px RWD 不因本工單改動。

## 4. 元件在 A4 的轉譯

### Header

- 延用 TRACK0-03 品牌標記與行程名稱。
- 不印出「分享／匯出 PDF」等自身操作控制。
- 可顯示目前 Day 的 selected pill 作輸出定位；不得新增新的資料欄位。

### Day Summary

- 保留 `Day N｜主題`、活動數、時間區間、交通偏好。
- 整組不可被分頁拆開。

### Map Preview

- 保留既有 route line／marker 的視覺語言。
- PDF 中為靜態預覽，不輸出「切換地圖視圖」按鈕。
- Map block 不允許跨頁。

### Activity Card

- 一張卡片必須完整位於同一頁。
- 不因剩餘空間不足而壓縮字級或卡片內距。
- 卡片右側拖曳把手屬 interactive-only，在 print 隱藏。

### Transit Pill

- 交通膠囊不可單獨成為一頁最後一個元素；若剩餘高度不足以同時容納「交通膠囊＋下一個 Activity／Anchor」，整組推到下一頁。
- 步行／一般資訊與地鐵色彩沿用 TRACK0-03。

### Time Anchor

- `selection.background`＋`selection.foreground` 的特殊狀態保留。
- 一張 Time Anchor Card 必須完整位於同一頁。
- 「時間錨點」標籤、固定時間、建議抵達、限制文字皆保留。

## 5. 分頁規則

### 5.1 允許分頁的位置

優先順序：

1. Day 與 Day 之間。
2. Activity／Time Anchor 卡片之前。
3. 「Transit Pill＋下一張卡」整組之前。

### 5.2 禁止分頁的位置

- Header 內。
- Day Summary 內。
- Map Preview 內。
- Activity Card 內。
- Time Anchor Card 內。
- 標籤與其卡片標題之間。
- 時間節點與其對應卡片之間。
- Transit Pill 與下一個目的地卡片之間（視為同一 segment）。

### 5.3 孤兒規則（orphan prevention）

- 頁面底部若只剩一個 Transit Pill 的高度，整個 transit segment 移到下一頁。
- 新頁不得只剩「時間」而沒有對應卡片。
- 若下一張卡片為 Time Anchor，Transit Pill＋Time Anchor 優先保持同頁。
- 不以縮小至低於既有字級規格的方式硬塞內容。

### 5.4 跨頁 continuation

若單一 Day 超過一頁：

- 新頁頂端重複輕量 print header（行程名稱＋Day），不重複 Map Preview。
- Timeline 線可於新頁重新起始，但不新增「續」類 UI 元件；是否顯示文字型 `Day N` 由 print header 處理。
- Footer 頁碼由 PDF renderer 產生，不寫入行程資料。

## 6. 前端 CSS 實作核心

```css
@page {
  size: A4 portrait;
  margin: 0;
}

.print-sheet {
  width: 210mm;
  min-height: 297mm;
  padding: 12mm 15mm 11mm;
  background: #FFFDFA;
}

@media print {
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .interactive-only,
  .drag-handle {
    display: none !important;
  }

  .day-summary,
  .map-preview,
  .activity-card,
  .time-anchor-card,
  .segment-with-destination {
    break-inside: avoid;
    page-break-inside: avoid;
  }
}
```

### 建議 DOM grouping

```html
<section class="timeline">
  <article class="timeline-row activity-row">...</article>

  <div class="segment-with-destination">
    <div class="timeline-row transit-row">...</div>
    <article class="timeline-row activity-row">...</article>
  </div>

  <div class="segment-with-destination">
    <div class="timeline-row transit-row">...</div>
    <article class="timeline-row activity-row time-anchor-row">...</article>
  </div>
</section>
```

瀏覽器對 `display: contents`＋分頁的支援差異較大。正式匯出若發現 grouping 被拆開，請直接讓 `.segment-with-destination` 成為實際 block wrapper，再以內部 grid 還原原本 Timeline 對齊；不要用 JS 逐像素硬算版面作為第一選擇。

## 7. PDF 匯出方式

### 7.1 使用者直接列印

保留瀏覽器原生 `window.print()` 作為 fallback。要求：

- 使用 A4 portrait。
- Background graphics 開啟時色彩最接近設計稿。
- 不保證不同瀏覽器自帶頁首頁尾一致，因此產品正式「匯出 PDF」不建議只依賴使用者瀏覽器設定。

### 7.2 正式「匯出 PDF」建議

使用 Chromium／Playwright 或同級 headless renderer 於 server route 產 PDF，統一紙張、背景、margin 與頁碼。

```ts
const pdf = await page.pdf({
  format: 'A4',
  printBackground: true,
  preferCSSPageSize: true,
  margin: { top: '0', right: '0', bottom: '0', left: '0' },
  displayHeaderFooter: false,
});
```

若需頁碼，優先以 renderer 的 footer template 或 server-side post-process 實作；頁碼不是行程資料，不應混入 API schema。

## 8. 資料與呈現責任

- PDF 使用與 TRACK0-03 相同的 itinerary data；前端不得另外維護「PDF 專用文案」副本。
- `is_time_anchor` 仍是 Time Anchor 唯一判斷來源；不得依 category／description 推斷。
- `cost_estimate` 仍依資料層幣別輸出，不由 print CSS 改寫。
- PDF 層只控制可見性、分頁、紙張、靜態排版與 renderer 設定。

## 9. 驗收條件

- [ ] A4 210 × 297 mm，Portrait。
- [ ] 300 dpi 預覽無文字裁切、重疊、黑方塊或錯字。
- [ ] 色彩與 TRACK0-01 Token 一致。
- [ ] 行程內容順序與 TRACK0-03 一致。
- [ ] Activity／Transit／Time Anchor 視覺語意不重新設計。
- [ ] Activity 與 Time Anchor 不跨頁。
- [ ] Transit 不孤立於頁尾。
- [ ] 頁面不靠縮小字級解決 overflow。
- [ ] `print-color-adjust: exact` 且 server PDF 使用 `printBackground: true`。
- [ ] 行動版 UI 未因 print CSS 改版；print 規則只在 print/export scope 生效。
- [ ] Chrome/Chromium 與至少一個實際 PDF viewer 檢視無裁切。

## 10. 本次範例資料

高擬真範例只使用 TRACK0-03 已定稿 Day 2 的內容：

- 上野恩賜公園與美術館散策
- 步行 10 分・公園大道
- 伊豆榮 本店（百年鰻魚飯）
- 都營大江戶線・20 分
- 東京巨蛋｜讀賣巨人 vs 阪神虎（時間錨點）

未新增景點、行程、分類或資料欄位。
