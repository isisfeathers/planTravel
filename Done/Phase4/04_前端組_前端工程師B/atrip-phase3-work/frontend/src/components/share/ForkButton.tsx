'use client';

import { useEffect, useRef, useState } from 'react';
import { CopyPlus, LoaderCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/stores/useAuthStore';

interface ForkButtonProps {
  shareToken: string;
  label?: string;
}

const pendingForkKey = 'atrip.pending-fork-share-token';

export function ForkButton({ shareToken, label = '複製到我的行程' }: ForkButtonProps) {
  const router = useRouter();
  const authStatus = useAuthStore((state) => state.status);
  const authUser = useAuthStore((state) => state.user);
  const initLiffAndAuth = useAuthStore((state) => state.initLiffAndAuth);
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const forkStartedRef = useRef(false);

  const forkItinerary = async () => {
    if (forkStartedRef.current || !shareToken) return;
    forkStartedRef.current = true;
    setIsWorking(true);
    setError(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUserId = sessionData.session?.user.id ?? authUser?.id;
      if (!currentUserId) {
        sessionStorage.setItem(pendingForkKey, shareToken);
        await initLiffAndAuth();
        forkStartedRef.current = false;
        setIsWorking(false);
        return;
      }

      const { data: source, error: sourceError } = await supabase
        .from('itineraries')
        .select('id')
        .eq('share_token', shareToken)
        .eq('is_public', true)
        .is('deleted_at', null)
        .maybeSingle<{ id: string }>();

      if (sourceError || !source) {
        throw new Error(sourceError?.message || '分享行程已不存在或已失效。');
      }

      const { data: rpcResult, error: forkError } = await supabase.rpc('fork_itinerary', {
        source_itinerary_id: source.id,
      });
      const created = (Array.isArray(rpcResult) ? rpcResult[0] : rpcResult) as
        | { new_itinerary_id?: string }
        | null;

      if (forkError || !created?.new_itinerary_id) {
        throw new Error(forkError?.message || '複製行程失敗，請稍後再試。');
      }

      sessionStorage.removeItem(pendingForkKey);
      router.push(`/canvas/${created.new_itinerary_id}`);
    } catch (caught) {
      forkStartedRef.current = false;
      setIsWorking(false);
      setError(caught instanceof Error ? caught.message : '複製行程失敗。');
    }
  };

  useEffect(() => {
    const pendingToken = sessionStorage.getItem(pendingForkKey);
    if (pendingToken === shareToken && authStatus === 'authenticated') {
      void forkItinerary();
    }
  }, [authStatus, shareToken]);

  return (
    <div>
      <button
        type="button"
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-primary px-5 py-3 text-sm font-bold text-slate-900 transition hover:brightness-95 disabled:cursor-wait disabled:opacity-70"
        disabled={isWorking}
        onClick={() => void forkItinerary()}
      >
        {isWorking ? <LoaderCircle aria-hidden="true" size={20} className="animate-spin" /> : <CopyPlus aria-hidden="true" size={20} />}
        {isWorking ? '處理中…' : label}
      </button>
      {error ? <p role="alert" className="mt-2 text-center text-xs text-rose-700">{error}</p> : null}
    </div>
  );
}
