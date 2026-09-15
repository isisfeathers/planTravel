# TRACK0-04: LINE Rich Menu 圖文選單與 Bubble Flex Message 視覺設計

* **工單編號**：TRACK0-04
* **所屬軌道**：Track 0 - 視覺 UI/UX 設計組
* **建議負責人**：1 人 (UI/UX 設計師)
* **優先級**：Medium (P2)
* **前置依賴 (Dependencies)**：`TRACK0-01`
* **狀態**：ready-for-agent

---

## 0. 開工前確認檢查清單 (Pre-Execution Sign-off / 執行者自檢)
> ⚠️ **執行者開工前必讀・問詢門檻**：動工前請確認以下項目皆已就緒並手動勾選，未確認前置產出前切勿盲目施工：
- [ ] **硬性前置實體產出確認**：TRACK0-01 色票代碼、LINE Flex Message 官方規格手冊。
- [ ] **規範與契約理解確認**：清楚 Rich Menu (2500x843) 點擊熱區與 Bubble Flex Message 完成推播的 JSON 結構。
- [ ] **紅線與禁止事項確認**：圖檔大小必須小於 1MB，Flex Message 必須在 LINE Simulator 驗證無文字折行破損。
- [ ] **執行者開工簽核**：我已完全理解本任務之驗收標準與前置交付物，確認無缺漏並正式開工。

---

## 1. 任務說明 (What to Build)
設計 LINE 官方帳號底部的 Rich Menu 圖文選單視覺（2500x1686 或 2500x843 規格），以及行程生成完畢時由 LINE Bot 發送的 Bubble Flex Message 訊息氣泡視覺樣式與 JSON Template。

---

## 2. 輸入與輸出資料規格 (Data Specification)

### 2.1 輸入規格
* Atrip 品牌主色：旅行藍 `#347FA3`、鼠尾草綠 `#6F8F72`。
* 官方帳號 Rich Menu 互動區域規劃：「Atrip 智慧自由行」、「我的行程」、「使用說明」。

### 2.2 輸出規格
* **Rich Menu 視覺圖檔**：2500 x 843 px PNG 圖檔，附帶座標熱區（Action Bounds）規格。
* **LINE Flex Message JSON Template**：
  * Header：`#347FA3` 底色，文字「🎉 您的專屬自由行已規劃就緒！」。
  * Hero Image：目的地封面照片。
  * Body：行程標題、天數、特色標籤 Chips（`#在地老饕` `#大眾捷運`）。
  * Footer：按鈕「開啟 Atrip 專屬行程」，綁定 LIFF URL。

---

## 3. 詳細執行步驟 (Step-by-Step Checklist)
- [ ] 繪製 LINE Rich Menu 圖片，確保於行動裝置各種比例下皆清晰且點擊引導明確。
- [ ] 規劃 Rich Menu 點擊區塊座標設定檔（JSON 格式）。
- [ ] 使用 LINE Flex Message Simulator 建立完成通知氣泡卡片，反覆調校字距、配色與按鈕樣式。
- [ ] 建立「生成異常重試」之輔助 Flex Message 樣板。
- [ ] 交付圖檔與 Flex Message JSON 給 Track 3 (LINE Bot 組)。

---

## 4. 驗收條件 (Acceptance Criteria)
- [ ] Rich Menu 圖檔符合 LINE 官方規格（小於 1MB，解析度精準）。
- [ ] Flex Message JSON 於 iOS 與 Android LINE 聊天室中渲染正常，無字體折行破碎。
- [ ] 點擊按鈕能正確觸發 `uri` 動作開啟指定 LIFF 網址。
