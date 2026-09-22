import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fvnxaksfcftatvxddhpx.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(
  req: Request,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    const body = await req.json().catch(() => ({}));
    let targetUserId = body.userId;

    // 1. 查詢原行程資料
    const { data: sourceTrip, error: sourceError } = await supabase
      .from('itineraries')
      .select('*')
      .or(`share_token.eq.${token},id.eq.${token}`)
      .is('deleted_at', null)
      .maybeSingle();

    if (sourceError || !sourceTrip) {
      return NextResponse.json({ error: '找不到來源行程或連結已失效' }, { status: 404 });
    }

    // 2. 確保有合法的 targetUserId (若無傳入則取現有 profile 或建立 guest)
    if (!targetUserId) {
      const { data: prof } = await supabase.from('profiles').select('id').limit(1).maybeSingle();
      if (prof?.id) {
        targetUserId = prof.id;
      } else {
        const { data: newAuth } = await supabase.auth.admin.createUser({
          email: `fork-traveler-${Date.now()}@atrip.app`,
          password: 'fork-secure-pass-1234',
          email_confirm: true,
        });
        targetUserId = newAuth?.user?.id || randomUUID();
        await supabase.from('profiles').upsert({
          id: targetUserId,
          line_user_id: `guest-${targetUserId.slice(0, 8)}`,
          display_name: 'Atrip 旅人 (Fork 副本)',
        });
      }
    }

    // 3. 執行 Fork 複製交易
    const forkedTitle = sourceTrip.title.includes('副本')
      ? sourceTrip.title
      : `${sourceTrip.title} (我的副本)`;

    const newShareToken = randomUUID();

    const { data: forkedTrip, error: insertError } = await supabase
      .from('itineraries')
      .insert({
        user_id: targetUserId,
        forked_from_id: sourceTrip.id,
        share_token: newShareToken,
        title: forkedTitle,
        destination: sourceTrip.destination,
        status: 'completed',
        is_public: true,
        preference_snapshot: sourceTrip.preference_snapshot || {},
        itinerary_data: sourceTrip.itinerary_data || {},
        flight_data: sourceTrip.flight_data || [],
      })
      .select('id')
      .single();

    if (insertError || !forkedTrip) {
      return NextResponse.json({ error: 'Fork 複製行程失敗', details: insertError }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      newItineraryId: forkedTrip.id,
      message: '成功複製行程至個人名下！',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
