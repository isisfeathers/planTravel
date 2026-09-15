# TRACK1-07: 智能行李打包清單 (Packing List) 互動分頁開發

* **工單編號**：TRACK1-07
* **所屬軌道**：Track 1 - 前端開發組 (LIFF Web App)
* **建議負責人**：1 人 (前端工程師 A)
* **優先級**：Medium (P2)
* **前置依賴 (Dependencies)**：`TRACK1-05`
* **狀態**：ready-for-agent

---

## 0. 開工前確認檢查清單 (Pre-Execution Sign-off / 執行者自檢)
> ⚠️ **執行者開工前必讀・問詢門檻**：動工前請確認以下項目皆已就緒並手動勾選，未確認前置產出前切勿盲目施工：
- [ ] **硬性前置實體產出確認**：TRACK1-05 主畫布結構就緒、mock_itinerary.json 包含 packing_list 範例。
- [ ] **規範與契約理解確認**：清楚 Checkbox 打勾劃線互動，並將更新後的整包 packing_list 寫回 Supabase。
- [ ] **紅線與禁止事項確認**：更新打勾狀態必須做防抖或局部更新，避免頻繁寫入資料庫。
- [ ] **執行者開工簽核**：我已完全理解本任務之驗收標準與前置交付物，確認無缺漏並正式開工。

---

## 1. 任務說明 (What to Build)
在行程主畫布中實作「行李清單 (Packing List)」分頁標籤。依據 `itinerary_data.packing_list` 分類呈現推薦物品（重要證件、衣物、3C、盥洗）。提供即時 Checkbox 打勾劃線互動，並將勾選狀態寫回 Supabase JSONB，方便旅客在出國前收拾行李清點。

---

## 2. 輸入與輸出資料規格 (Data Specification)

### 2.1 輸入規格
* `itinerary_data.packing_list`（陣列包含 `id`, `category`, `item_name`, `is_checked`, `notes`）。

### 2.2 輸出規格
* **資料庫更新**：更新 `itinerary_data.packing_list` 中特定 item 之 `is_checked: boolean`。

---

## 3. 詳細執行步驟 (Step-by-Step Checklist)
- [ ] 刻劃行李清單介面：分類分塊（重要證件、季節衣物、3C電子、隨身常備藥）。
- [ ] 實作打勾 Checkbox 互動：勾選時文字加上刪除線 (Strike-through) 與淡灰色樣式。
- [ ] 支援新增自訂項目：提供「＋ 新增自訂物品」輸入框。
- [ ] 勾選變更後觸發防抖儲存，更新寫回 Supabase。

---

## 4. 驗收條件 (Acceptance Criteria)
- [ ] 清單正確按類別歸納顯示，項目名稱與行前提示（Notes）完整呈現。
- [ ] 點選打勾能立即獲得視覺回饋，重整頁面後勾選狀態完整保持。
- [ ] 使用者可自由新增或刪除個人自訂的行李項目。
