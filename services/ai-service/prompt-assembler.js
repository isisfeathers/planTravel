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
// 2. 依 category 分組，同一 category 內優先採用「使用者實際選中」的選項，
//    否則保留 SQL 已篩出的 is_default 列（雙重防呆，避免 SQL 排序造成誤蓋）
// -----------------------------------------------------------------------------
const selectedKeys = new Set(
  [
    ...(preferenceSnapshot.interests || []),
    preferenceSnapshot.accommodation_strategy,
    preferenceSnapshot.transit_mode,
  ].filter(Boolean)
);

const byCategory = new Map();

for (const row of templateRows) {
  const isSelected = selectedKeys.has(row.option_key);

  if (!byCategory.has(row.category)) {
    byCategory.set(row.category, { row, isSelected });
    continue;
  }

  const existing = byCategory.get(row.category);
  if (isSelected && !existing.isSelected) {
    byCategory.set(row.category, { row, isSelected });
  }
}

// -----------------------------------------------------------------------------
// 3. 依 priority 由小到大排序並拼接指令行，同時去除重複字串
//    （驗收條件：提示詞內容無任何語意衝突或重複段落）
// -----------------------------------------------------------------------------
const directiveRows = Array.from(byCategory.values())
  .map((entry) => entry.row)
  .sort((a, b) => a.priority - b.priority);

const directiveLines = directiveRows.map((row) => `- ${row.prompt_directive}`);
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
// 5. Base System Rules（世界頂級旅遊管家定位 + JSON 格式強制約束 + 智能行李規範）
// -----------------------------------------------------------------------------
const baseSystemRules = [
  '你是 Atrip 頂級 AI 自由行旅遊管家兼專業行前打包顧問，擅長規劃真實可行、具備地理精確度、在地深度且緊密貼合用戶情境的自由行行程。',
  '你必須嚴格以符合 atrip_itinerary_schema 之 JSON 格式輸出，不得加入任何 JSON 以外的文字、Markdown 標記或註解。',
  '每個活動皆須包含精確的地理座標 (lat/lng)、真實地名與合理的交通轉乘建議。',
  '【專業行李打包顧問指令 (packing_list)】',
  '你必須根據使用者的目的地（地理、海關法規與氣候特徵）、總天數（精確計算換洗衣物數量）、出發月份季節與每日具體活動，量身打造 10~14 項高度相關的行李打包清單。',
  '嚴格涵蓋 4 大分類：',
  '  1. essentials（重要證件與金流）：依據目的地之簽證/入境要求、當地貨幣兌換（如歐元、英鎊、泰銖、日幣、韓元等當地專屬幣別）與支付習慣、熱門景點安全防護（如防扒腰包/防割包）。',
  '  2. clothing（季節衣物與配件）：精確依據旅遊天數計算換洗衣物數量（例如「舒適透氣換洗衣物與內著 N 套（N 天 N-1 夜剛好）」），並根據出發月份在當地的真實氣候、日夜溫差、步道地形（耐走健步鞋）與當地文化/宗教場所著裝規範（如寺廟禁露肩露膝）。',
  '  3. electronics（3C 數位與充電設備）：列出目的地專用插座規格轉接頭（如歐規雙圓孔/英規三腳方插/美規雙扁等）、當地推薦之高速上網工具（eSIM/上網卡/必備交通與地圖 App）、隨身行動電源。',
  '  4. toiletries（隨身常備藥與盥洗）：根據行程長度與目的地氣候提供個人常備藥（腸胃藥/止痛退燒/綜合感冒藥/暈車藥）、分裝盥洗包（標明歐洲等環保飯店不提供一次性牙刷備品）與當季皮膚防護（防曬/防蚊/保濕霜）。',
  '⚠️ 嚴禁提供與目的地無關的他國專屬名詞（例如前往非日本國家嚴禁出現 Suica、ICOCA 或 Visit Japan Web；前往非韓國國家嚴禁出現 WOWPASS 或 Q-CODE）！',
  '每個項目必須包含 item_name 與 notes（具體說明攜帶理由與實用建議）。',
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
