import { useEffect, useState } from 'react';
// import { supabase } from '@/lib/supabase/client';
// import { useRouter } from 'next/navigation';

/**
 * TRACK1-04: Supabase Realtime WebSocket 訂閱 Hook
 * 包含 5 秒輪詢備援機制 (Fallback Polling)
 */
export function useRealtimeSubscription(itineraryId: string) {
  const [status, setStatus] = useState<'generating' | 'completed' | 'failed'>('generating');
  // const router = useRouter();

  useEffect(() => {
    // TODO: 1. 實作 Supabase Realtime 監聽 public.itineraries
    // TODO: 2. 實作 setInterval 5 秒輪詢備援機制
    // TODO: 3. 狀態為 completed 時自動 router.push(`/canvas/${itineraryId}`)
  }, [itineraryId]);

  return status;
}
