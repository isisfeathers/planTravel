# Atrip Track 0 → Track 1 Frontend Handoff v1.0

**日期：2026-09-17**  
**用途：前端實作唯一入口文件（先讀此份）**  
**狀態：FINAL HANDOFF**

---

## 1. 前端應先看什麼

### 必讀

1. 本文件 `Atrip_Track0_to_Track1_Frontend_Handoff_v1.0.md`
2. TRACK0-01 Final Design System / Tokens
3. TRACK0-02 Dashboard / Wizard Final Figma
4. TRACK0-03 Timeline Final Figma
5. TRACK0-05 Print / PDF Final Spec

### 附件／追溯用

- `TRACK0-01-design-system-and-tokens_FINAL_v1.1.md`
- `TRACK0-02-dashboard-wizard_FINAL_v1.1.md`
- `TRACK0-05-print-pdf_FINAL_v1.1.md`

原始 `ready-for-agent` ticket 是 Track 0 開工需求，不再作為前端 style source of truth。

---

## 2. Conflict Resolution Rule

若文件內容互相衝突：

**TRACK0-01 Final Design System / Tokens > Final Figma > Final Handoff Spec > 原始 tickets**

### 已知舊規格衝突

原始 TRACK0-01 / TRACK0-02 ticket 仍保留早期 `#347FA3 / #6F8F72 / #F97316`。

目前前端 Primary Action 一律採：

- `action.primary` = `#B9E85A`
- `action.on-primary` = `#182B36`
- `action.primary-hover` = `#ACDD4D`

**不要把 `#F97316` 當 Dashboard / Wizard Primary CTA。**

---

## 3. Shared UI Contract

| Item | Final contract |
|---|---|
| Font | Noto Sans TC |
| H1 | 20 / 30 / 700 |
| H2 | 16 / 24 / 600 |
| Body | 14 / 22 / 400 |
| Button | 16 / 24 / 600, min 52px |
| Chip | 14 / 20 / 500, min 44px |
| IconButton | 44×44 target, 20px icon |
| Main nav icon | 24px |
| Card radius | 20px |
| Primary CTA | #B9E85A / #182B36 |
| Focus | #277E99, 3px outline + 3px offset |
| Page | #FFFDFA |
| Card | #FFFFFF |

Dashboard、Wizard、Timeline 共用同一 Header / Card / Typography / Icon / Navigation visual language。

---

## 4. Responsive Contract

必測 viewport：`320 / 375 / 390 / 430px`

- >=360px：page padding 20px
- <360px：page padding 16px
- 375px content width 335px
- 320px content width 288px
- 不固定內容高度
- 長文字換行、容器增高
- 不縮字解 overflow
- 不產生非必要 horizontal scroll
- 200% text scale 仍可操作

Chip：flex-wrap / gap 8px / 非等寬。  
雙欄 Card：gap 12px / min 152px / 不足 316px 時單欄。

---

## 5. Dashboard / Wizard Contract

### Dashboard

- Active / Archived 清楚區分
- 當前關注狀態可辨識
- Card actions 使用 44×44 IconButton touch target

### Wizard

- Layer 1 預設套版已 Selected
- 使用者 0 次手動選擇也可送出
- Layer 2 再做住宿／交通／興趣微調
- 運動賽事才展開時間錨點欄
- 不得改成多頁文字問卷

### Sticky CTA

若固定底部：

- 保留 CTA / navigation 實際高度
- 加 `env(safe-area-inset-bottom)`
- 最後一組 chip / input 不得被遮住

---

## 6. State Contract

### Button

Default / Hover / Pressed / Focus / Disabled / Loading

### PreferenceChip

Selected 與 State 分離：

- Selected：分類底色保留 + #416519 border + check + soft shadow
- Selected + Focus 同時可見
- Pressed ≠ Selected
- Loading 不用在本地 chip toggle

### Accessibility

- Touch 不依賴 hover
- Chip / Toggle 使用 `aria-pressed`
- Loading 阻止重複送出
- Disabled 有原因
- Focus 不被 overflow 裁切
- 不用顏色作唯一狀態提示

---

## 7. TRACK0-03 Timeline Consistency

此次不要求重新設計 Timeline。

只需確認：

- Header
- Card radius / border / spacing
- Font hierarchy
- Icon family / size
- Primary / Focus colors
- Navigation behavior

全部沿用 TRACK0-01 Design System。

---

## 8. Print / PDF Contract

- A4 Portrait 210×297mm
- margin 15mm
- base 10pt
- print 隱藏 nav / CTA / input / drag / share actions
- `break-inside: avoid` + `page-break-inside: avoid`

不可任意拆散：

- Activity Card
- Time Anchor + Card
- Day Summary
- Map Preview（若有）

避免：

- 半張 activity card
- orphan time anchor
- 單獨 transit pill
- Day Header 留在上一頁、內容全在下一頁

正式交付前用長文字與 page-boundary case 實際輸出 PDF 檢查。

---

## 9. Final QA Before Merge

### Blocking

- [ ] 沒有使用舊 `#F97316` 作 Primary CTA
- [ ] 320 / 375 / 390 / 430px 實際 browser spot check
- [ ] 實際 PDF page-by-page spot check
- [ ] Final Tokens 與前端 theme 對得上

### Should Fix

- [ ] Button / Chip / IconButton 狀態完整
- [ ] long text / 200% text scale 不裁切
- [ ] sticky bottom safe-area 正確
- [ ] TRACK0-02 / 03 header-card-type-icon-nav 一致
- [ ] Print group 不被拆頁

### Nice to Have

- [ ] 保留 QA screenshots / recordings
- [ ] 建立 deliberate-long-text fixture
- [ ] 建立 page-boundary PDF regression case

---

## 10. Handoff Sign-off

前端開始切版後，若發現 Figma 與文件不一致：

1. 不自行猜色碼／尺寸
2. 先查 TRACK0-01 Final Tokens
3. 若仍衝突，再回報 Track 0 決策

此文件完成後，原始開工 tickets 可一併留存，但**不要求前端逐份閱讀**。
