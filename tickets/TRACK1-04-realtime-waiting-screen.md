# TRACK1-04: 動態等待畫布與 Supabase Realtime 即時切換

* **工單編號**：TRACK1-04
* **所屬軌道**：Track 1 - 前端開發組 (LIFF Web App)
* **建議負責人**：1 人 (前端工程師 B)
* **優先級**：High (P1)
* **前置依賴 (Dependencies)**：`TRACK1-03`、`TRACK2-03`
* **狀態**：ready-for-agent

---

## 0. 開工前確認檢查清單 (Pre-Execution Sign-off / 執行者自檢)
> ⚠️ **執行者開工前必讀・問詢門檻**：動工前請確認以下項目皆已就緒並手動勾選，未確認前置產出前切勿盲目施工：
- [ ] **硬性前置實體產出確認**：TRACK1-03 新增行程能成功拿到 itinerary_id、Supabase Realtime Channel 連線正常。
- [ ] **規範與契約理解確認**：清楚監聽 public.itineraries 或 public.itinerary_jobs 的 status === "completed"。
- [ ] **紅線與禁止事項確認**：必須實作 5 秒輪詢備援機制，防止行動端 WebSocket 中斷斷線時頁面無限等待。
- [ ] **執行者開工簽核**：我已完全理解本任務之驗收標準與前置交付物，確認無缺漏並正式開工。

---

## 1. 任務說明 (What to Build)
實作行程生成中的等待畫布 (`/waiting/[id]`)。呈現飛機航線微動畫、骨架屏效果與旅遊實用小知識（Tips）輪播。同時開啟 Supabase Realtime WebSocket 訂閱，監聽該筆行程或 Job 之 `status === 'completed'`，一旦收到完成訊號立即自動平滑導航進入主畫布 `/canvas/[id]`。

---

## 2. 輸入與輸出資料規格 (Data Specification)

### 2.1 輸入規格
* 路由參數：`itinerary_id` (UUID)。
* Supabase Realtime 訂閱通道：`postgres_changes`，監聽 `public.itineraries` 或 `public.itinerary_jobs`。

### 2.2 輸出規格
* **狀態轉場**：
  * 當偵測到 `status === 'completed'`：觸發轉場動畫，導航至 `/canvas/[id]`。
  * 當偵測到 `status === 'failed'`：畫面停止動畫，展示錯誤代碼與「重新生成」按鈕。

---

## 3. 詳細執行步驟 (Step-by-Step Checklist)
- [ ] 刻劃等待畫面：居中飛機航線動畫、進度進度條、隨機旅遊知識輪播卡片（每 4 秒切換）。
- [ ] 撰寫 `useRealtimeSubscription` Hook：
  ```typescript
  supabase
    .channel(`trip-${itineraryId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'itineraries',
      filter: `id=eq.${itineraryId}`
    }, (payload) => {
      if (payload.new.status === 'completed') {
        router.push(`/canvas/${itineraryId}`);
      }
    })
    .subscribe();
  ```
- [ ] 實作輪詢備援 (Polling Fallback)：若 Realtime 因行動網路切換中斷，每 5 秒發起一次備用 GET 查詢。
- [ ] 加入離線提示：告知用戶「您可以先關閉頁面，規劃完成後 LINE 將主動發送推播通知」。

---

## 4. 驗收條件 (Acceptance Criteria)
- [ ] 後端一旦更新 `status = 'completed'`，前端等待畫面在 1 秒內自動完成轉場，無需用戶手動重新整理。
- [ ] 若後端標記 `failed`（如配額超限），頁面清楚呈現錯誤訊息並提供重試機制。
- [ ] 網頁背景化或重回前台時，WebSocket 連線能自動重連恢復監聽。
