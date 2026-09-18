# TRACK0-05: A4 / PDF Print Layout — Final Handoff v1.1

- **工單編號**：TRACK0-05
- **所屬軌道**：Track 0 - 視覺 UI/UX 設計組
- **前置依賴**：TRACK0-03 Timeline Final
- **文件用途**：最終 Print / PDF 規格追溯與前端附件
- **狀態**：`FINAL / HANDOFF-READY`
- **更新日期**：2026-09-17

---

## 0. Goal

將 TRACK0-03 時間軸轉為適合 A4 直式列印及離線閱讀的 PDF，確保：

- 不切掉卡片
- 不發生文字腰斬
- 不留下 Web-only controls
- 換日清楚
- 紙本與 PDF 均有一致的資訊階層

---

## 1. A4 Base

- Size：A4 Portrait `210mm × 297mm`
- Margin：`15mm`
- Print base font：`10pt`
- 兼顧美觀、省墨、黑白／雙色列印可讀性

頁首：

- Atrip Logo
- 行程標題
- 目的地
- 總天數

每日：

- Day Header
- 日期
- 本日摘要
- Timeline / activity nodes

頁尾：

- 頁碼，例如「第 1 頁，共 4 頁」

---

## 2. @media print

Web-only 元素在 print 必須隱藏：

- Global / bottom navigation
- Floating CTA
- Input / editable controls
- Drag handles
- Share / action buttons
- Hover-only UI
- Web share watermark / non-print decoration

建議使用明確 `.no-print` 或對應元件 selector，不依賴「畫面外」隱藏。

---

## 3. Pagination Rules

### 核心紅線

**任何單張活動卡片不得跨頁腰斬。**

```css
.activity-card,
.print-keep-together {
  break-inside: avoid;
  page-break-inside: avoid;
}
```

### Final QA 追加的 grouping 原則

以下應視為「不可隨意拆散」的 print unit：

- Activity Card
- Time Anchor + 對應 Activity Card
- Day Summary
- Map Preview（若存在）

交通提示（Transit Pill / Transit info）若語意依附前後活動，不應單獨落在頁尾／頁首造成語意斷裂。

### Day Boundary

- 換日可啟動新頁，或至少有乾淨 Day Header
- 不可只留下 Day Header 在上一頁、內容全部跑下一頁
- 跨頁時可重複輕量「行程名稱＋Day」header，協助離線閱讀
- Map Preview 不應無條件每頁重複

---

## 4. Long-content / Boundary QA

正式交付前必做至少一組「刻意卡在頁尾」壓力測試：

1. 長景點名稱
2. 多行地址
3. 多行交通說明
4. 多行注意事項
5. 長 Day Summary
6. Activity Card 正好落在 page boundary
7. Time Anchor 接近 page bottom

驗收：

- 無半張卡片
- 無 orphan Time Anchor
- 無單獨 Transit Pill
- 無被裁切的文字
- 無右側／下方 page clipping

---

## 5. Visual Consistency with TRACK0-03

PDF 不重新設計另一套品牌語言；沿用：

- Typography hierarchy
- Card information hierarchy
- Time / day structure
- Icon semantics
- Atrip logo treatment

但 print 可移除非必要陰影、互動 affordance 與高耗墨裝飾。

---

## 6. Browser / PDF Export QA

最終至少檢查：

- Chrome print preview / PDF export
- A4 Portrait
- default scaling / 100%
- margins 15mm
- background graphics 設定差異下仍可閱讀
- 多頁 page number 正確
- 實際 PDF逐頁檢視

若後端 PDF renderer 使用不同引擎，需再跑同一組 boundary case。

---

## 7. Acceptance Criteria

- [ ] A4 210×297mm / 15mm margin 正確
- [ ] Header / Day Header / Timeline hierarchy 清楚
- [ ] 所有 Web-only controls 在 print 隱藏
- [ ] Activity Card 絕不跨頁腰斬
- [ ] Time Anchor 不成為孤兒節點
- [ ] Day Header 不單獨留在上一頁
- [ ] Transit information 不無語意地單獨落頁
- [ ] 長文字不裁切
- [ ] 頁碼正確
- [ ] Chrome / 實際 PDF page-by-page spot check 完成
- [ ] TRACK0-03 視覺語言保留，但不重新設計
