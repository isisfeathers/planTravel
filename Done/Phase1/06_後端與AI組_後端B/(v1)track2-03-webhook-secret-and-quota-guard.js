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
// 【後續：IF 節點 - 依 quotaExceeded 分流】
// 條件：{{ $json.quotaExceeded }} === true
//
// True 分支 → 兩個 Supabase Update 節點：
/*
  UPDATE public.itinerary_jobs
  SET status = 'failed', error_code = {{ $json.errorCode }}, error_message = {{ $json.errorMessage }}
  WHERE itinerary_id = {{ $json.itinerary_id }};

  UPDATE public.itineraries
  SET status = 'failed', error_message = {{ $json.errorMessage }}
  WHERE id = {{ $json.itinerary_id }};
*/
// 之後接 Respond to Webhook 節點，回傳 200（前端靠 Realtime 收到 failed 狀態即可，
// 不建議回傳 4xx 給 Database Webhook 觸發器，避免 Supabase 端誤判 Webhook 本身故障）。
//
// False 分支 → 更新狀態並推進至 TRACK2-04：
/*
  UPDATE public.itinerary_jobs
  SET status = 'generating_itinerary', started_at = NOW()
  WHERE itinerary_id = {{ $json.itinerary_id }};
*/
// -----------------------------------------------------------------------------
