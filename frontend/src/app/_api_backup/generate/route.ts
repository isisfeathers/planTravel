import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fvnxaksfcftatvxddhpx.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

const N8N_WEBHOOK = process.env.N8N_WEBHOOK_URL || "https://n8n-210083939307.asia-east1.run.app/webhook/generate-itinerary";

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

    // 1. 在 Supabase 建立 pending 行程紀錄 (初始狀態 generating，itinerary_data 為空)
    const { data: insertData, error: insertError } = await supabase.from("itineraries").insert({
      user_id: targetUserId,
      title: `${dest} ${days} 天深度自由行`,
      destination: dest,
      status: "generating",
      is_public: true,
      itinerary_data: {},
      preference_snapshot: preferenceSnapshot || {}
    }).select("id").single();

    if (insertError) {
      console.error("[API Generate] Supabase 建立失敗:", insertError);
      return NextResponse.json({ error: "DB Error", details: insertError }, { status: 500 });
    }

    const createdId = insertData.id;
    console.log(`[API Generate] 已在 Supabase 建立任務 (ID: ${createdId})，正在派發至 n8n...`);

    // 2. 100% 委由 n8n 工作流非同步處理（LLM 生成 ➔ 資料清洗 ➔ 寫回 Supabase）
    try {
      const n8nRes = await fetch(N8N_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itineraryId: createdId,
          userId: targetUserId,
          destination: dest,
          days: days,
          preference_snapshot: preferenceSnapshot || {}
        })
      });

      const n8nData = await n8nRes.json().catch(() => ({}));
      console.log(`[API Generate] n8n Webhook 呼叫狀態: ${n8nRes.status}`, n8nData);
    } catch (n8nErr: any) {
      console.warn(`[API Generate] 呼叫 n8n Webhook 警告:`, n8nErr.message);
    }

    return NextResponse.json({ 
      success: true, 
      id: createdId,
      status: "generating",
      engine: "n8n"
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Error", msg: error.message }, { status: 500 });
  }
}

