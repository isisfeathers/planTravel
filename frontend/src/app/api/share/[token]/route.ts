import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fvnxaksfcftatvxddhpx.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(
  req: Request,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    // 支援以 share_token (UUID) 或 id 查詢
    const { data, error } = await supabase
      .from('itineraries')
      .select('id, title, destination, status, share_token, is_public, itinerary_data, flight_data, preference_snapshot, created_at')
      .or(`share_token.eq.${token},id.eq.${token}`)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: '找不到該分享行程或連結已失效' }, { status: 404 });
    }

    // 嚴格去識別化處理 (De-identification)
    const sanitizedPreference = { ...(data.preference_snapshot || {}) };
    delete sanitizedPreference.budget_level; // 遮蔽預算

    const sanitizedData = { ...(data.itinerary_data || {}) };
    if (sanitizedData.meta) {
      delete sanitizedData.meta.budget_level;
    }

    const deidentifiedPayload = {
      id: data.id,
      title: data.title,
      destination: data.destination,
      status: data.status,
      share_token: data.share_token,
      itinerary_data: sanitizedData,
      flight_data: data.flight_data || [],
      preference_snapshot: sanitizedPreference,
      created_at: data.created_at,
    };

    return NextResponse.json({ success: true, data: deidentifiedPayload });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
