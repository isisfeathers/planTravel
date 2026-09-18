# TRACK0-02: Dashboard 與雙層標籤精靈 — Final Handoff v1.1

- **工單編號**：TRACK0-02
- **所屬軌道**：Track 0 - 視覺 UI/UX 設計組
- **前置依賴**：TRACK0-01 Final Design System
- **文件用途**：最終規格追溯／前端附件
- **狀態**：`FINAL / HANDOFF-READY`
- **更新日期**：2026-09-17

> **重要更新：**原始工單中的暖日橘 `#F97316` CTA 已被 Final Design System supersede。前端主 CTA 請使用 `action.primary #B9E85A` + `action.on-primary #182B36`。

---

## 0. Source of Truth

1. TRACK0-01 Final Design System / Tokens
2. TRACK0-02 Final Figma visual
3. 本文件
4. 原始 ticket 僅供需求追溯

若本文件與 Final Tokens 有衝突，以 TRACK0-01 為準。

---

## 1. Final Scope

### 畫面 1｜我的行程 Dashboard

- Atrip Header
- 「＋ 規劃新旅程」Primary CTA
- 活躍中行程 cards
- destination image
- date range / days
- 當前關注狀態
- card action menu
- 歷史旅程 Archived list

### 畫面 2｜雙層標籤精靈

**Layer 1｜一鍵套版**

- 平台推薦經典遊：預設 Selected
- 都會潮流
- 運動賽事

使用者不操作任何選項，也能直接送出預設組合。

**Layer 2｜偏好微調**

- 住宿策略
- 交通模式
- 興趣標籤
- 選擇「運動賽事」時展開賽事／時間錨點備註欄

不得改成傳統多頁文字問卷。

---

## 2. Final CTA

### Primary CTA

- Background：`#B9E85A`
- Text / icon：`#182B36`
- Hover：`#ACDD4D`
- Height：min `52px`
- Radius：full
- Typography：16 / 24 / 600

**原始 ticket 的 `#F97316` 不再作為本畫面 Primary Action 色。**

CTA 建議位於單手拇指易操作區；若採 fixed / sticky：

```css
padding-bottom: calc(var(--bottom-action-height) + env(safe-area-inset-bottom));
```

頁面內容必須留足 bottom spacing，不能遮住最後一組 chip / input。

---

## 3. Responsive Rules

### Viewports

必測：

- 320px
- 375px
- 390px
- 430px

### Gutter

- >=360px：20px
- <360px：16px

### General

- 不固定內容高度
- 長文字可換行，容器自然增高
- 不以縮小 font-size 解決 overflow
- 不產生非必要水平捲動
- 文字放大 200% 仍可操作

### Cards

- card padding：16px
- radius：20px
- 區塊 gap：依 TRACK0-01 spacing tokens
- 若使用雙欄：gap 12px、單卡 min 152px
- 可用寬不足 316px 或長文字容不下時，改單欄

### Chips

- min-height 44px
- `flex-wrap`
- gap 8px
- 不強制等寬
- 中文長標籤可在 chip 內換行並增高

---

## 4. Component States

Dashboard 與 Wizard 不可只做 Default / Selected。

### Buttons

- Default
- Hover
- Pressed
- Focus
- Disabled
- Loading

### PreferenceChip

- Unselected / Selected
- Default / Hover / Pressed / Disabled
- FocusVisible 可與 Selected 同時存在

Selected：

- 保留分類底色
- `#416519` border
- 顯示勾選
- soft shadow
- 不改變元件寬度

### IconButton / 當前關注

- 44×44px touch target
- visual icon 20px
- Toggle 狀態使用 `aria-pressed`
- Selected 不只靠顏色

---

## 5. Long-text QA Cases

至少使用以下類型內容驗收：

1. 長目的地／旅程名稱
2. 跨兩行的日期／狀態資訊
3. 長偏好 chip 文案
4. 「運動賽事」展開後的長賽事名稱與時間錨點
5. Loading 文案比 Default CTA 更長
6. 200% text scale

禁止：

- ellipsis 掩蓋必要操作文案
- fixed-height clipping
- 以 10–12px 小字硬塞

---

## 6. Cross-screen Visual Consistency

TRACK0-02 必須與 TRACK0-03 共用：

- Header visual language
- Card radius / border / spacing
- Noto Sans TC typography scale
- Icon family / visual sizes
- Bottom / main navigation behavior
- Focus treatment
- Primary action colors

**不需回頭重新設計 TRACK0-03；只需確認共用 Design System 套用一致。**

---

## 7. Accessibility / Interaction Notes

- Primary text contrast >= WCAG AA
- Focus：3px `#277E99`, offset 3px
- Hover 僅在 `(hover:hover) and (pointer:fine)` 啟用
- Touch 不依賴 Hover
- Chip 使用 `button type="button"` + `aria-pressed`
- Loading 阻止重複送出，並保留文字狀態
- Disabled 提供鄰近原因說明

---

## 8. Acceptance Criteria

- [ ] Dashboard 清楚區分 Active / Archived
- [ ] 當前關注狀態可辨識
- [ ] Wizard 無操作即可使用預設組合送出
- [ ] Layer 1 / Layer 2 結構清楚
- [ ] Primary CTA 使用 Final green token，不使用舊橘色
- [ ] 320 / 375 / 390 / 430px 無裁切、重疊、非必要橫向捲動
- [ ] 長文字可換行／增高
- [ ] Button / Chip / IconButton 狀態完整
- [ ] Selected + Focus 同時可辨識
- [ ] Sticky bottom CTA 不遮住內容，處理 safe-area
- [ ] Header / Card / Typography / Icon / Navigation 與 TRACK0-03 一致
- [ ] 前端以 TRACK0-01 Final Tokens 為 style source of truth
