const apiKey = "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";

async function testCity(dest, days) {
  const systemPrompt = `你是 Atrip 平台的頂級 AI 自由行旅遊管家。你擅長為世界各地規劃真實可行、具備地理精確度、深度在地化且邏輯嚴密的自由行行程。

【核心原則】
1. 嚴格輸出純 JSON 格式，不得包含 markdown 或註解。
2. 所有 location_name 必須是真實世界具體的景點、歷史地標、知名餐廳或商圈全名（嚴禁使用「著名景點」等泛稱）。
3. 提供精確真實的經緯度 coordinates (lat/lng)。
4. transit_to_next 提供具體路線名稱（如「東京地鐵銀座線」、「巴黎地鐵4號線」）與出口轉乘指引。
5. 每日活動按照地理相鄰分區規劃（避免折返跑）。`;

  const userPrompt = `目的地：${dest}，天數：${days} 天。請產生完整 ${days} 天每天 3~4 個豐富活動的 JSON 行程。`;

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPromp             { role: "user", content: userPrompt }
      ]
    })
  });

  const data = await res.json();
  const parsed = JSON.parse(data.choices[0].message.content);
  console.log(`\n=== 目的地: ${dest} (${days}天) ===`);
  console.log("行程標題:", parsed.meta?.trip_title || parsed.trip_title);
  (parsed.daily_itinerary || []).forEach(day => {
    console.log(`[Day ${day.day_number}] ${day.date_label || day.summary}`);
    (day.activities || []).forEach(act => {
      console.log(`  - ${act      console.log(`  - ${act      console.log(`  - ${act      console.log(`  - o_next?.instructions || act.transit_to_next?.route_name || '無'}`);
    });
  });
}

async function run() {
  await testCity("巴黎", 3);
  await testCity("曼谷", 2);
}

run();
