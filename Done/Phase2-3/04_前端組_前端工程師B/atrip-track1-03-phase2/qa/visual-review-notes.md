# TRACK1-03 Phase 2 視覺檢查紀錄

## 375px Default

畫面符合 `02_wizard_default` 的核心層級：白色 Header、平台推薦經典遊預設 Selected、橫向套版卡露出下一張、推薦細節收合摘要、0 點擊提示，以及固定底部亮綠 Primary CTA。CTA 未遮住內容，中文文案完整，無頁面水平溢位。

## 375px Sports Selected + Focus

運動賽事套版會自動展開第二層；住宿、交通、興趣與已選數量正確更新，Selected Chip 同時顯示深綠框和勾選。鍵盤焦點會顯示藍青色外框。自動化檢查發現填寫時間錨點後資料狀態改為 `custom`，使套版卡失去 Selected 視覺；後續修正為以獨立 UI state 保留來源套版選取，不改寫資料契約。

## 修正後 Sports Selected + Focus

運動賽事卡在時間錨點填寫與其他微調後仍保留 selection background、深綠 2px 邊框與勾選，符合「Selected 與資料 custom 狀態分離」原則。第二層已選 Chip 同時有勾選和深綠框；固定 CTA 使用 Final `action.primary` Token。

## 320px + 200% 文字縮放

Header、H1、說明與 CTA 均自然換行增高，未出現頁面水平溢位或固定高度裁切。Sticky CTA 保持可操作並有相應倍增的底部保留空間；頁面可垂直捲動至其餘內容。
