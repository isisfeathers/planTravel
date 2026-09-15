# TRACK0-01: Atrip 品牌設計系統與 Tailwind Tokens 規範

* **工單編號**：TRACK0-01
* **所屬軌道**：Track 0 - 視覺 UI/UX 設計組
* **建議負責人**：1 人 (UI/UX 設計師)
* **優先級**：High (P1)
* **前置依賴 (Dependencies)**：None (可立即開工)
* **狀態**：ready-for-agent

---

## 0. 開工前確認檢查清單 (Pre-Execution Sign-off / 執行者自檢)
> ⚠️ **執行者開工前必讀・問詢門檻**：動工前請確認以下項目皆已就緒並手動勾選，未確認前置產出前切勿盲目施工：
- [ ] **硬性前置實體產出確認**：已查閱 品牌名稱提案.pptx 內之旅行藍 #347FA3、鼠尾草綠 #6F8F72、暖日橘 #F97316 品牌色定義。
- [ ] **規範與契約理解確認**：清楚知道需產出 Figma Master Tokens 與 tailwind.config.js 的 theme.extend 擴充設定檔。
- [ ] **紅線與禁止事項確認**：文字與背景對比度必須符合 WCAG AA (>= 4.5:1)，不得隨意自創未授權色號。
- [ ] **執行者開工簽核**：我已完全理解本任務之驗收標準與前置交付物，確認無缺漏並正式開工。

---

## 1. 任務說明 (What to Build)
依據品牌提案與系統總綱，建立 Atrip 專屬的設計系統規範（Design System），定義色票代碼、字體層級、按鈕膠囊（Chips / Pills）狀態與 Tailwind CSS 配置檔案（`tailwind.config.js`），產出 Figma Design Tokens 供前端團隊直接套用。

---

## 2. 輸入與輸出資料規格 (Data Specification)

### 2.1 輸入規格
* 品牌主色：旅行藍 `#347FA3` (智慧清爽)。
* 品牌次色：鼠尾草綠 `#6F8F72` (自然陪伴)。
* 品牌強調色：暖日橘 `#F97316` (行動按鈕與時間錨點)。
* 背景底色：雲白灰 `#F8FAFC`、畫布白 `#FFFFFF`。

### 2.2 輸出規格
* **Design Token 規格檔**：包含顏色（Colors）、圓角（Border Radius）、陰影（Box Shadow）、按鈕狀態（Default / Hover / Selected / Disabled）。
* **Tailwind Config 擴充片段**：輸出可直接置入前端專案之 `theme.extend` 色階物件。

---

## 3. 詳細執行步驟 (Step-by-Step Checklist)
- [ ] 於 Figma 建立 Atrip Master Library，配置色票 Style：`brand-primary` (`#347FA3`)、`brand-secondary` (`#6F8F72`)、`brand-accent` (`#F97316`)。
- [ ] 設計按鈕膠囊（Chip/Pill）元件：高度 36px/40px，全圓角 `rounded-full`，定義「未選中 (淺灰底暗字)」與「選中 (旅行藍底白字/帶微陰影)」兩種狀態。
- [ ] 產出字型層級規範：H1 (20px, Bold)、H2 (16px, Semi-bold)、Body (14px, Regular)、Caption (12px, Regular)。
- [ ] 匯出 Tailwind CSS 設定檔擴充片段，交付 Track 1 前端工程師。

---

## 4. 驗收條件 (Acceptance Criteria)
- [ ] 色票對比度符合 WCAG AA 無障礙可讀性標準（一般文字對比度 $\ge 4.5:1$）。
- [ ] 按鈕膠囊元件在手機 375px 視口寬度下具備足夠的點擊熱區（高度 $\ge 40px$）。
- [ ] 產出完整的 Tailwind 擴充配置物件，能順利被 Next.js 專案載入。
