// =============================================================================
// TRACK2-03: n8n Webhook 觸發、密鑰驗證與用戶配額防刷檢查
// =============================================================================
// 節點串接順序（共 4 個節點 + 1 個 IF 分流）：
//
//   [Webhook] → [Code: 密鑰驗證與 Payload 萃取] → [Supabase: 查詢今日任務數]
//             → [Supabase: 查詢活躍行程數] → [Code: 配額防刷判斷]
//             → [IF: quotaExceeded?] ─true→ [Supabase Update: 寫回 failed]
//                                    └false→ [Supabase Update: 推進 generating_itinerary] → (交給 TRACK2-04)
//
// 下方提供兩個 Code 節點的完整程式碼，以及兩個 Supabase Execute Query 節點的 SQL。
// =============================================================================


// -----------------------------------------------------------------------------
// 【節點 1：Code - 密鑰驗證與 Payload 萃取】
// 緊接在 Webhook 節點之後
// -----------------------------------------------------------------------------
/*
const request = $input.first().json;

// n8n Webhook 節點預設把 Header 放在 request.headers，Body 放在 request.body
const receivedSecret = request.headers['x-webhook-secret'] || request.headers['X-Webhook-Secret'];
const expectedSecret = $env.SUPABASE_WEBHOOK_SECRET;

if (!expectedSecret) {
  throw new Error('伺服器未設定 SUPABASE_WEBHOOK_SECRET 環境變數，請檢查 n8n 環境設定。');
}

if (!receivedSecret || receivedSecret !== expectedSecret) {
  // 偽冒請求：丟出例外中斷工作流，搭配 Webhook 節點的錯誤分支回傳 401
  throw new Error('UNAUTHORIZED: X-Webhook-Secret 驗證失敗，拒絕此請求。');
}

const body = request.body || {};
const { itinerary_id: itineraryId, user_id: userId, preference_snapshot: preferenceSnapshot } = body;

if (!itineraryId || !userId) {
  throw new Error('BAD_REQUEST: 缺少必要欄位 itinerary_id 或 user_id。');
}

return [
  {
    json: {
      itinerary_id: itineraryId,
      user_id: userId,
      preference_snapshot: preferenceSnapshot || {},
    },
  },
];
*/


// -----------------------------------------------------------------------------
// 【節點 2：Supabase Execute Query - 查詢今日任務數（排除本次剛建立的這筆）】
// -----------------------------------------------------------------------------
/*
SELECT COUNT(*)::int AS jobs_today
FROM public.itinerary_jobs
WHERE user_id = $1
  AND itinerary_id <> $2
  AND created_at >= date_trunc('day', TIMEZONE('utc', NOW()));

-- 參數綁定：
-- $1 = {{ $json.user_id }}
-- $2 = {{ $json.itinerary_id }}
--
-- ⚠️ 關鍵：一定要排除 itinerary_id <> $2（本次這筆），
-- 否則因為前端已先 INSERT itinerary_jobs，這裡查到的數字會多算 1，
-- 導致第 3 次就被誤擋，而非驗收要求的「第 4 次才擋」。
*/


// -----------------------------------------------------------------------------
// 【節點 3：Supabase Execute Query - 查詢活躍行程數（同樣排除本次這筆行程）】
// -----------------------------------------------------------------------------
/*
SELECT COUNT(*)::int AS active_itineraries
FROM public.itineraries
WHERE user_id = $1
  AND id <> $2
  AND is_archived = false
  AND deleted_at IS NULL;

-- 參數綁定：
-- $1 = {{ $json.user_id }}
-- $2 = {{ $json.itinerary_id }}
*/


// -----------------------------------------------------------------------------
// 【節點 4：Code - 配額防刷判斷】
// 輸入來源：節點 1（Payload）、節點 2（今日任務數）、節點 3（活躍行程數）
// 請依實際節點命名調整下方 $('...') 字串
// -----------------------------------------------------------------------------

const payload = $('密鑰驗證與 Payload 萃取').first().json;
const jobsTodayRow = $('查詢今日任務數').first().json;
const activeRow = $('查詢活躍行程數').first().json;

const DAILY_LIMIT = 3;
const ACTIVE_LIMIT = 5;

// 這裡拿到的是「排除本次之後」既有的筆數
const jobsToday = Number(jobsTodayRow.jobs_today ?? 0);
const activeItineraries = Number(activeRow.active_itineraries ?? 0);

// 既有筆數 >= 上限，代表「這一次」會是超過上限的那一次，應予阻擋
const dailyExceeded = jobsToday >= DAILY_LIMIT;
const activeExceeded = activeItineraries >= ACTIVE_LIMIT;
const quotaExceeded = dailyExceeded || activeExceeded;

let errorMessage = null;
if (dailyExceeded) {
  errorMessage = '您今日的 AI 規劃額度已滿（每日上限 3 次），明日 00:00 自動重置';
} else if (activeExceeded) {
  errorMessage = '活躍行程數已達上限 (5 個)，請先封存或刪除部分行程';
}

return [
  {
    json: {
      itinerary_id: payload.itinerary_id,
      user_id: payload.user_id,
      preference_snapshot: payload.preference_snapshot,
      quotaExceeded,
      errorCode: quotaExceeded ? 'QUOTA_EXCEEDED' : null,
      errorMessage,
      // 除錯用：方便在 n8n Execution 記錄中直接看到判斷依據
      debug_jobsTodayExcludingSelf: jobsToday,
      debug_activeItinerariesExcludingSelf: activeItineraries,
    },
  },
];


// -----------------------------------------------------------------------------
// 【重要架構前提】Webhook 節點設定
// -----------------------------------------------------------------------------
// 因為完整生成流程（Prompt 拼裝 + LLM + 機票查詢 + 寫回）需要 15~40 秒，
// 遠超過大多數 Webhook 呼叫方（含 Supabase Database Webhook）能接受的逾時秒數，
// 所以「回應 HTTP 請求」跟「繼續跑後面的生成流程」必須分開處理。
//
// Webhook 節點設定：
//   - Respond：選 "Using 'Respond to Webhook' Node"（不要選 Immediately）
//   - 這樣可以在流程中間視情況（密鑰錯誤 / 配額超限 / 正常受理）
//     分別呼叫「Respond to Webhook」節點回應，之後續接的節點仍會繼續在背景執行。
//
// 整體分流結構：
//
//   [Webhook]
//     → [Code: 密鑰驗證] ─(丟出例外)→ 由 n8n 全域 Error Trigger 接手 → Respond 401
//     → [Supabase: 今日任務數] → [Supabase: 活躍行程數] → [Code: 配額判斷]
//     → [IF: quotaExceeded]
//         ├─ true  → [Supabase Update: jobs=failed] → [Supabase Update: itineraries=failed]
//                   → [Respond to Webhook: 200, quota_exceeded]
//         └─ false → [Supabase Update: jobs=generating_itinerary]
//                   → [Respond to Webhook: 202, accepted]
//                   → （不中斷，繼續往下接 TRACK2-04 動態提示詞拼裝節點）
// -----------------------------------------------------------------------------


// -----------------------------------------------------------------------------
// 【分支 True｜節點 5a：Supabase Update - itinerary_jobs 寫回 failed】
// -----------------------------------------------------------------------------
/*
UPDATE public.itinerary_jobs
SET status = 'failed',
    error_code = $1,
    error_message = $2,
    completed_at = NOW()
WHERE itinerary_id = $3;

-- 參數綁定：
-- $1 = {{ $json.errorCode }}        (固定為 'QUOTA_EXCEEDED')
-- $2 = {{ $json.errorMessage }}
-- $3 = {{ $json.itinerary_id }}
*/


// -----------------------------------------------------------------------------
// 【分支 True｜節點 5b：Supabase Update - itineraries 寫回 failed】
// -----------------------------------------------------------------------------
/*
UPDATE public.itineraries
SET status = 'failed',
    error_message = $1
WHERE id = $2;

-- 參數綁定：
-- $1 = {{ $json.errorMessage }}
-- $2 = {{ $json.itinerary_id }}
*/


// -----------------------------------------------------------------------------
// 【分支 True｜節點 6a：Respond to Webhook】
// -----------------------------------------------------------------------------
// Response Code: 200
//   （回 200 而非 4xx，因為呼叫方是 Supabase Database Webhook 而非終端使用者，
//    前端實際上是靠 Realtime 監聽 itinerary_jobs.status 變化，不是讀這個 HTTP 回應；
//    回 4xx 反而容易讓 Supabase 把它誤判成 Webhook 端點本身異常。）
// Response Body (JSON)：
/*
{
  "accepted": false,
  "reason": "QUOTA_EXCEEDED",
  "message": "{{ $json.errorMessage }}",
  "itinerary_id": "{{ $json.itinerary_id }}"
}
*/


// -----------------------------------------------------------------------------
// 【分支 False｜節點 5c：Supabase Update - itinerary_jobs 推進狀態】
// -----------------------------------------------------------------------------
/*
UPDATE public.itinerary_jobs
SET status = 'generating_itinerary',
    started_at = NOW(),
    attempt = attempt + 1
WHERE itinerary_id = $1;

-- 參數綁定：
-- $1 = {{ $json.itinerary_id }}
*/


// -----------------------------------------------------------------------------
// 【分支 False｜節點 6b：Respond to Webhook】
// -----------------------------------------------------------------------------
// Response Code: 202 (Accepted)
// Response Body (JSON)：
/*
{
  "accepted": true,
  "status": "generating_itinerary",
  "itinerary_id": "{{ $json.itinerary_id }}"
}
*/
//
// ⚠️ 這個節點回應之後，n8n 工作流「不會」中止——執行會繼續往下走，
// 接續 TRACK2-04（Prompt 動態拼裝）→ 平行呼叫 LLM 與機票服務 → TRACK2-06（清洗入庫）。
// 這正是達成「非同步優先、不阻塞 HTTP 連線」的關鍵設計（對應 ADR 0002）。


// -----------------------------------------------------------------------------
// 【密鑰驗證失敗的回應】
// -----------------------------------------------------------------------------
// 因為密鑰驗證是在最前面的 Code 節點用 throw new Error(...) 中斷，
// 建議做法二選一：
//
// 方案 A（簡單）：讓工作流直接失敗，n8n 預設會對 Webhook 呼叫方回傳 500。
//   優點：實作最少。缺點：無法自訂 401 狀態碼與回應內容。
//
// 方案 B（建議）：把密鑰驗證從「Code 節點 throw error」改成「IF 節點判斷」，
//   NG 分支接一個獨立的 [Respond to Webhook] 節點：
//     Response Code: 401
//     Response Body: { "accepted": false, "reason": "INVALID_SECRET" }
//   這樣才能精準符合「偽冒的 Webhook 請求會被 100% 拒絕」且回應格式一致的驗收要求。
// -----------------------------------------------------------------------------
