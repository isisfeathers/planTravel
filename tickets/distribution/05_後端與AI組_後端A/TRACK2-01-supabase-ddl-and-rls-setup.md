# TRACK2-01: Supabase 資料庫完整 DDL 部署與 RLS 安全政策配置

* **工單編號**：TRACK2-01
* **所屬軌道**：Track 2 - 後端與 AI 邏輯組 (n8n & Supabase)
* **建議負責人**：1 人 (後端工程師 A)
* **優先級**：Highest (P0)
* **前置依賴 (Dependencies)**：None (可立即開工)
* **狀態**：ready-for-agent

---

## 0. 開工前確認檢查清單 (Pre-Execution Sign-off / 執行者自檢)
> ⚠️ **執行者開工前必讀・問詢門檻**：動工前請確認以下項目皆已就緒並手動勾選，未確認前置產出前切勿盲目施工：
- [ ] **硬性前置實體產出確認**：Supabase 專案環境已建立、已閱讀 [Final SPEC/02-資料庫設計與SQL-DDL.md](../Final%20SPEC/02-資料庫設計與SQL-DDL.md)。
- [ ] **規範與契約理解確認**：清楚 6 大資料表之循環外鍵相依建表順序、GIN 倒排索引、軟刪除部分索引與 RLS 政策。
- [ ] **紅線與禁止事項確認**：嚴禁關閉任何一張表的 RLS，嚴禁將 service_role 授予公開角色。
- [ ] **執行者開工簽核**：我已完全理解本任務之驗收標準與前置交付物，確認無缺漏並正式開工。

---

## 1. 任務說明 (What to Build)
在 Supabase PostgreSQL 15+ 實例中執行並部署完整的資料庫 DDL 遷移腳本。建立 6 大核心表（`profiles`, `user_preferences`, `itineraries`, `itinerary_jobs`, `prompt_templates`, `itinerary_shares`），設定 GIN 索引、外鍵約束、`updated_at` 自動觸發器與嚴格的 Row Level Security (RLS) 權限。

---

## 2. 輸入與輸出資料規格 (Data Specification)

### 2.1 輸入規格
* [Final SPEC/02-資料庫設計與SQL-DDL.md](../Final%20SPEC/02-資料庫設計與SQL-DDL.md) 完整 SQL 腳本。

### 2.2 輸出規格
* **資料庫物件就緒**：
  * 列舉：`itinerary_job_status`, `prompt_category`。
  * 6 張資料表與主外鍵約束建立完成。
  * 啟用 RLS 並套用擁有者防護、軟刪除過濾與去識別化公開唯讀政策。
  * 啟用 `supabase_realtime` 廣播通道（針對 `itineraries` 與 `itinerary_jobs`）。

---

## 3. 詳細執行步驟 (Step-by-Step Checklist)
- [ ] 登入 Supabase Dashboard 或使用 Supabase CLI 建立 Migration 檔案。
- [ ] 執行 DDL 建立 `uuid-ossp` 與 `pgcrypto` 擴充套件。
- [ ] 建立 6 張核心資料表與關聯約束（特別注意循環外鍵相依之建表順序）。
- [ ] 建立 GIN 倒排索引（針對 `itinerary_data` 與 `flight_data`）以及軟刪除部分索引。
- [ ] 建立自動更新 `updated_at` 之 Trigger 與 Procedure。
- [ ] 逐一啟用資料表之 RLS，並建立驗證 Policies。
- [ ] 將 `itineraries` 與 `itinerary_jobs` 加入 `supabase_realtime` 發布集。

---

## 4. 驗收條件 (Acceptance Criteria)
- [ ] 6 張資料表成功建立，所有欄位型別與預設值與規格書完全一致。
- [ ] 使用 anon key 嘗試查詢未公開或他人未分享的行程，回傳空陣列（RLS 生效）。
- [ ] 持合法 `share_token` 可以在未登入狀態下查詢到該筆公開行程。
- [ ] Realtime Inspector 能正常接收到該兩張表的 INSERT / UPDATE 事件。
