import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fvnxaksfcftatvxddhpx.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function GET(req: Request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    let activeId: string | null = null;
    let itineraries: any[] = [];

    if (userId) {
      try {
        const { data: pData } = await supabase
          .from('profiles')
          .select('active_itinerary_id')
          .eq('id', userId)
          .maybeSingle();
        if (pData?.active_itinerary_id) {
          activeId = pData.active_itinerary_id;
        }
      } catch (e) {
        console.warn('API profiles 讀取跳過:', e);
      }

      try {
        const { data: iData, error: iErr } = await supabase
          .from('itineraries')
          .select('*')
          .eq('user_id', userId)
          .is('deleted_at', null)
          .order('created_at', { ascending: false });

        if (!iErr && iData && iData.length > 0) {
          itineraries = iData;
        }
      } catch (e) {
        console.warn('API itineraries 依 userId 讀取跳過:', e);
      }
    }

    // 若依特定 userId 未找到或尚未綁定，抓取最近所有未被刪除的行程
    if (itineraries.length === 0) {
      try {
        const { data: allData, error: allErr } = await supabase
          .from('itineraries')
          .select('*')
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(30);

        if (!allErr && allData) {
          itineraries = allData;
        }
      } catch (e) {
        console.warn('API fallback 行程讀取跳過:', e);
      }
    }

    return NextResponse.json({
      success: true,
      data: itineraries,
      activeItineraryId: activeId,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
