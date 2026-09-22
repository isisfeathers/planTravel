import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fvnxaksfcftatvxddhpx.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { data, error } = await supabase
      .from('itineraries')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: '行程不存在' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.is_archived !== undefined) updatePayload.is_archived = body.is_archived;
    if (body.itinerary_data !== undefined) updatePayload.itinerary_data = body.itinerary_data;
    if (body.preference_snapshot !== undefined) updatePayload.preference_snapshot = body.preference_snapshot;
    if (body.title !== undefined) updatePayload.title = body.title;
    if (body.flight_data !== undefined) updatePayload.flight_data = body.flight_data;

    const { data, error } = await supabase
      .from('itineraries')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('itineraries')
      .update({
        deleted_at: now,
        updated_at: now,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: '行程已移至垃圾桶' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
