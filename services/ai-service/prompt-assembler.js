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
  '你是 Atrip 平台的世界頂級旅遊規劃管家，擅長規劃真實可行、具備地理精確度、在地深度且緊密貼合用戶情境的自由行行程。',
  '你必須嚴格以符合 atrip_itinerary_schema 之 JSON 格式輸出，不得加入任何 JSON 以外的文字、Markdown 標記或註解。',
  '每個活動皆須包含精確的地理座標 (lat/lng)、真實地名與合理的交通轉乘建議。',
  '【智能行李打包清單規範 (packing_list)】',
  '你必須根據使用者的目的地（地理與氣候特徵）、出發月份季節與天氣預期、以及每日安排的具體行程活動（例如海島水上活動/浮潛、雪地/極光徒步、溫泉、球賽應援、文青參訪），量身打造 10~15 項高度相關的行李打包清單。',
  '涵蓋 4 大分類：',
  '  1. essentials（必備證件與金流）：目的地專屬簽證/申報表要求、當地慣用支付/現鈔建議。',
  '  2. clothing（衣物穿搭與防護）：嚴格依據季節氣溫與活動產生（如冰島冬季：防風防水連帽厚外套、保暖發熱衣物、防滑雪靴、雪地抗UV墨鏡；沖繩/東南亞夏季：泳衣/水母衣、海灘鞋、遮陽防曬薄外套；日本賞楓/春季：多層次洋蔥式穿搭）。',
  '  3. electronics（3C 與轉接設備）：目的地插座規格轉接頭、隨身行動電源、防水相機袋等。',
  '  4. toiletries（個人護理與常備藥）：氣候專屬護理（如寒冷乾燥地區的高保濕乳霜/護唇膏；熱帶地區的防蚊液/高係數防曬）與旅行常備藥。',
  '每個項目必須包含 item_name 與 notes（為什麼這趟行程需要攜帶的貼心理由與注意事項）。',
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
