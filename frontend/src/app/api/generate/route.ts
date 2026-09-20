import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import { buildSystemPrompt, normalizePayload } from "./promptHelper";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fvnxaksfcftatvxddhpx.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

const N8N_WEBHOOK = process.env.N8N_WEBHOOK_URL || "https://n8n-210083939307.asia-east1.run.app/webhook/generate-itinerary";
const OPENROUTER_KEY = "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";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, destination, total_days, preferenceSnapshot } = body;
    const days = total_days || 3;
    const dest = destination || "東京";

    let targetUserId = userId;
    if (!targetUserId) {
      const { data: prof } = await supabase.from("profiles").select("id").limit(1).maybeSingle();
      if (prof?.id) {
        targetUserId = prof.id;
      } else {
        const { data: newAuth } = await supabase.auth.admin.createUser({
          email: "traveler@atrip.app",
          password: "traveler-secure-pass-1234",
          email_confirm: true
        });
        targetUserId = newAuth?.user?.id || randomUUID();
        await supabase.from("profiles").upsert({
          id: targetUserId,
          line_user_id: `guest-${targetUserId.slice(0, 8)}`,
          display_name: "Atrip 自由行旅人"
        });
      }
    }

    const { data: insertData, error: insertError } = await supabase.from("itineraries").insert({
      user_id: targetUserId,
      title: `${dest} ${days} 天深度自由行`,
      destination: dest,
      status: "generating",
      is_public: true,
      preference_snapshot: preferenceSnapshot || {}
    }).select("id").single();

    if (insertError) {
      return NextResponse.json({ error: "DB Error", details: insertError }, { status: 500 });
    }

    const createdId = insertData.id;

    // 觸發雲端 n8n
    fetch(N8N_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itineraryId: createdId,
        userId: targetUserId,
        destination: dest,
        days,
        preference_snapshot: preferenceSnapshot || {}
      })
    }).then(r => console.log(`[n8n Webhook] ${r.status}`)).catch(e => console.warn(`[n8n Webhook]`, e.message));

    // 非同步 AI 旅遊管家管線 (含 4 大類行李清單)
    (async () => {
      try {
        console.log(`[Pipeline] 行程 ${createdId} (${dest}) 開始規劃與生成 4 大類行李清單...`);

        const startDate = preferenceSnapshot?.start_date;
        const endDate = preferenceSnapshot?.end_date;

        let flightData = [];
        try {
          const fRes = await fetch(`http://127.0.0.1:3002/api/v1/flights/search?origin=TPE&destination=${encodeURIComponent(dest)}&departureDate=${startDate || ''}&returnDate=${endDate || ''}`);
          if (fRes.ok) {
            const fJson = await fRes.json();
            flightData = fJson.data || [];
          }
        } catch (e) {}

        const systemPrompt = buildSystemPrompt(dest, days, startDate, endDate);
        const userPrompt = `目的地：${dest}，天數：${days} 天，出發日期：${startDate || 'AI 近期最佳推薦'}。請產生結合真實早去晚回航班時間的完整 ${days} 天真實具體景點，以及包含全部 4 大類的行李打包清單 JSON。`;

        const llmRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENROUTER_KEY}`
          },
          body: JSON.stringify({
            model: "openai/gpt-4o-mini",
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ]
          })
        });

        if (!llmRes.ok) throw new Error(`OpenRouter HTTP ${llmRes.status}`);

        const llmData = await llmRes.json();
        const rawPayload = JSON.parse(llmData.choices[0].message.content);
        const payload = normalizePayload(rawPayload, startDate, endDate);

        await supabase
          .from("itineraries")
          .update({
            status: "completed",
            itinerary_data: payload,
            flight_data: flightData,
            updated_at: new Date().toISOString()
          })
          .eq("id", createdId);

        console.log(`[Pipeline] 行程 ${createdId} (${dest}) 成功寫入 Supabase (含 4 大類行李清單)!`);

        try {
          await fetch("http://127.0.0.1:3003/api/v1/line/push", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: targetUserId,
              itineraryId: createdId,
              title: payload.meta?.trip_title || `${dest} 自由行`
            })
          });
        } catch (e) {}

      } catch (err: any) {
        console.error("[Pipeline] 執行失敗:", err.message);
        await supabase
          .from("itineraries")
          .update({
            status: "failed",
            error_message: err.message,
            updated_at: new Date().toISOString()
          })
          .eq("id", createdId);
      }
    })();

    return NextResponse.json({ success: true, id: createdId });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Error", msg: error.message }, { status: 500 });
  }
}
