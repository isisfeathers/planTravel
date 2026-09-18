// =============================================================================
// TRACK2-04: n8n 動態提示詞查詢與 Master System Prompt 組裝節點
// 節點型態：n8n-nodes-base.code (建議設定為 "Run Once for All Items")
// 前置節點：
//   1. Webhook 節點 (TRACK2-03，已通過密鑰驗證與配額檢查)
//   2. Supabase 節點 (Execute Query，查詢 public.prompt_templates)
// =============================================================================

// -----------------------------------------------------------------------------
// 0. 取得上游資料
//    ⚠️ 請依你實際的節點命名調整 $('...') 內的字串
// -----------------------------------------------------------------------------
const webhookData = $('Webhook - Generate Itinerary').first().json;
const preferenceSnapshot = webhookData.preference_snapshot || {};
const itineraryId = webhookData.itinerary_id;
const userId = webhookData.user_id;

// Supabase 查詢節點回傳的所有列：{ option_key, prompt_directive, priority, category, is_default }
const templateRows = $input.all().map((item) => item.json);

// -----------------------------------------------------------------------------
// 1. 工具函式：清洗使用者自訂備註，防止 Prompt Injection
//    (依據 07-安全運維驗收與開發排程.md 第 1.3 節「提示詞注入防護」)
// -----------------------------------------------------------------------------
function sanitizeUserNote(rawText) {
  if (!rawText || typeof rawText !== 'string') return '';

  const blocklistPatterns = [
    /ignore\s+(all\s+)?previous\s+instructions/gi,
    /disregard\s+(all\s+)?(prior|previous)\s+instructions/gi,
    /system\s*prompt/gi,
    /you\s+are\s+now/gi,
    /忽略(以上|之前|上面)?(所有)?(指令|指示|規則)/g,
    /改變你的(角色|身分|設定)/g,
  ];

  let cleaned = rawText;
  for (const pattern of blocklistPatterns) {
    cleaned = cleaned.replace(pattern, '');
  }

  // 移除換行符並限制長度，避免破壞既有 Prompt 結構或灌爆 Token
  cleaned = cleaned.replace(/[\r\n]+/g, ' ').trim();
  if (cleaned.length > 200) {
    cleaned = cleaned.slice(0, 200);
  }
  return cleaned;
}

// -----------------------------------------------------------------------------
// 2. 依 priority 由小到大排序，並去除完全相同的重複字串。
//
//    ⚠️ 修正紀錄（v2）：v1 版本這裡曾經多做了一層「同一個 category 只保留一筆」
//    的防呆邏輯，但這個假設是錯的——SQL 查詢節點已經正確處理好選取邏輯：
//      - 同一 category 允許有多筆「使用者選中」的列同時存在
//        （例如 interests: ["gourmet","sports"] 應該兩條指令都要出現）
//      - 同一 category 也可能同時有多筆 is_default=true 的預設列
//        （例如 gourmet 與 cultural 都標記 is_default=true）
//    v1 的 category 收斂邏輯會把這些「合法的多筆結果」誤砍到只剩一筆，
//    導致實際跑驗收條件 1（interests: ["gourmet","sports"]）時，
//    產出的 Prompt 會漏掉「運動賽事」指令而測試失敗。
//    v2 移除該邏輯，直接信任 SQL 節點已篩好的候選列，Code 節點只負責排序與去重複。
// -----------------------------------------------------------------------------
const sortedRows = [...templateRows].sort((a, b) => a.priority - b.priority);
const directiveLines = sortedRows.map((row) => `- ${row.prompt_directive}`);
const uniqueDirectiveLines = [...new Set(directiveLines)];

// -----------------------------------------------------------------------------
// 4. 賽事 / 演唱會等「絕對時間錨點」特殊處理
// -----------------------------------------------------------------------------
let anchorDirective = '';
if (preferenceSnapshot.event_note) {
  const safeNote = sanitizeUserNote(preferenceSnapshot.event_note);
  if (safeNote) {
    anchorDirective = `【絕對時間錨點】活動：${safeNote}，當日周邊活動嚴格以此為軸心安排，不可更動或忽略此時段。`;
  }
}

// -----------------------------------------------------------------------------
// 5. Base System Rules（世界頂級旅遊管家定位 + JSON 格式強制約束）
// -----------------------------------------------------------------------------
const baseSystemRules = [
  '你是 Atrip 平台的世界頂級旅遊規劃管家，擅長規劃真實可行、具備地理精確度的自由行行程。',
  '你必須嚴格以符合 atrip_itinerary_schema 之 JSON 格式輸出，不得加入任何 JSON 以外的文字、Markdown 標記或註解。',
  '每個活動皆須包含精確的地理座標 (lat/lng)、真實地名與合理的交通轉乘建議。',
].join('\n');

// -----------------------------------------------------------------------------
// 6. User Target Data
// -----------------------------------------------------------------------------
const userTargetData = [
  `目的地：${preferenceSnapshot.destination || '未指定'}`,
  `總天數：${preferenceSnapshot.total_days || '未指定'} 天`,
  preferenceSnapshot.start_date && preferenceSnapshot.end_date
    ? `出發區間：${preferenceSnapshot.start_date} ~ ${preferenceSnapshot.end_date}`
    : null,
  `步調：${preferenceSnapshot.pace || 'moderate'}`,
  `預算等級：${preferenceSnapshot.budget_level || 'standard'}`,
]
  .filter(Boolean)
  .join('\n');

// -----------------------------------------------------------------------------
// 7. 最終拼裝 Master System Prompt
// -----------------------------------------------------------------------------
const sections = [
  '## Base System Rules',
  baseSystemRules,
  '',
  '## Injected Directives',
  uniqueDirectiveLines.join('\n') || '(無額外約束，套用系統預設)',
];

if (anchorDirective) {
  sections.push('', anchorDirective);
}

sections.push('', '## User Target Data', userTargetData);

const assembledSystemPrompt = sections.join('\n');

// -----------------------------------------------------------------------------
// 8. 輸出，供後續 LLM 節點 (分支 A) 與機票服務節點 (分支 B) 使用
// -----------------------------------------------------------------------------
return [
  {
    json: {
      itinerary_id: itineraryId,
      user_id: userId,
      preference_snapshot: preferenceSnapshot,
      assembledSystemPrompt,
    },
  },
];
