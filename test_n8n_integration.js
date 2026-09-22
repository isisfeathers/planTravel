const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fvnxaksfcftatvxddhpx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2bnhha3NmY2Z0YXR2eGRkaHB4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTUzMjk5OCwiZXhwIjoyMTA1MTA4OTk4fQ.a2n_6uHAugC5IeddlGG3wIHoZn4l5Z_lskV-IUrRzQk';
const n8nWebhookUrl = 'https://n8n-210083939307.asia-east1.run.app/webhook/generate-itinerary';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTest() {
  console.log('=== 開始測試 n8n 端到端真實串接 (不使用任何 Next.js 內建生成器) ===\n');

  // 1. 在 Supabase 建立一筆 status = 'generating' 的初始行程
  const targetUserId = '4d910483-4a11-4d1b-afac-7f13d95bba66';
  const destination = '京都';
  const days = 3;

  const { data: newItin, error: insertErr } = await supabase
    .from('itineraries')
    .insert({
      user_id: targetUserId,
      title: `【n8n專屬測試】${destination} ${days} 天自由行`,
      destination: destination,
      status: 'generating',
      is_public: true,
      itinerary_data: {},
      preference_snapshot: {
        destination,
        total_days: days,
        pace: 'relaxed',
        budget_level: 'standard',
        accommodation_strategy: 'single_hotel',
        transit_mode: 'public_transit',
        interests: ['cultural', 'gourmet'],
      },
    })
    .select('id, status, title')
    .single();

  if (insertErr) {
    console.error('❌ Supabase 建立初始行程失敗:', insertErr.message);
    return;
  }

  const itineraryId = newItin.id;
  console.log(`✅ 1. Supabase 建立行程成功: ID = ${itineraryId}`);
  console.log(`   狀態: ${newItin.status} (itinerary_data 為 null)\n`);

  // 2. 呼叫 n8n Webhook
  console.log(`🚀 2. 發送 Webhook 請求至 n8n (${n8nWebhookUrl})...`);
  const n8nPayload = {
    itineraryId: itineraryId,
    userId: targetUserId,
    destination: destination,
    days: days,
    preference_snapshot: {
      destination,
      total_days: days,
      pace: 'relaxed',
      budget_level: 'standard',
      accommodation_strategy: 'single_hotel',
      transit_mode: 'public_transit',
      interests: ['cultural', 'gourmet'],
    },
  };

  const webhookRes = await fetch(n8nWebhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(n8nPayload),
  });

  const webhookJson = await webhookRes.json();
  console.log(`   n8n 回應 HTTP 狀態: ${webhookRes.status}`, webhookJson);
  console.log('   n8n 工作流已在雲端非同步啟動 (LLM 生成 ➔ 資料清洗 ➔ 寫回 Supabase)...\n');

  // 3. 輪詢 Supabase 檢查 n8n 是否完成生成並更新了 status = 'completed'
  console.log('⏳ 3. 開始輪詢 Supabase 資料庫，等待 n8n 寫入行程...');
  const maxWaitSeconds = 60;
  const interval = 3000;
  let elapsed = 0;
  let isDone = false;

  while (elapsed < maxWaitSeconds * 1000) {
    await new Promise((resolve) => setTimeout(resolve, interval));
    elapsed += interval;

    const { data: checkData, error: checkErr } = await supabase
      .from('itineraries')
      .select('id, status, itinerary_data, updated_at')
      .eq('id', itineraryId)
      .single();

    if (checkErr) {
      console.warn(`   [${elapsed / 1000}s] 讀取異常:`, checkErr.message);
      continue;
    }

    const hasData = checkData.itinerary_data && Object.keys(checkData.itinerary_data).length > 0;
    console.log(
      `   [${elapsed / 1000}s] 當前狀態: ${checkData.status} | 資料寫入: ${
        hasData ? `已收到！(${checkData.itinerary_data?.meta?.trip_title || '有資料'})` : '尚未寫入'
      }`
    );

    if (checkData.status === 'completed' && hasData) {
      isDone = true;
      console.log('\n======================================================');
      console.log('🎉 驗證成功！n8n 已完全獨立完成生成管線並成功寫入 Supabase！');
      console.log(`   行程標題: ${checkData.itinerary_data.meta?.trip_title}`);
      console.log(`   總天數: ${checkData.itinerary_data.meta?.total_days}`);
      console.log(`   每日行程數: ${checkData.itinerary_data.daily_itinerary?.length} 天`);
      console.log(`   行李清單項數: ${checkData.itinerary_data.packing_list?.length} 項`);
      if (checkData.itinerary_data.recommendations?.accommodations?.length > 0) {
        console.log(`   推薦住宿 (Basecamp): ${checkData.itinerary_data.recommendations.accommodations[0].name}`);
      }
      console.log('======================================================\n');
      break;
    }
  }

  if (!isDone) {
    console.error(`\n❌ 等待超過 ${maxWaitSeconds} 秒，n8n 尚未完成寫入，請檢查 n8n Execution Logs。`);
  }
}

runTest();
