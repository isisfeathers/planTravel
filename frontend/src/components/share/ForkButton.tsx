'use client';

import { useEffect, useRef, useState } from 'react';
import { GitFork, LoaderCircle, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/stores/useAuthStore';

interface ForkButtonProps {
  shareToken: string;
  sourceTitle?: string;
  label?: string;
  className?: string;
}

const pendingForkKey = 'atrip.pending-fork-share-token';

export function ForkButton({ shareToken, label = '複製到我的行程 (Fork)', className = '' }: ForkButtonProps) {
  const router = useRouter();
  const authStatus = useAuthStore((state) => state.status);
  const authUser = useAuthStore((state) => state.user);
  const initLiffAndAuth = useAuthStore((state) => state.initLiffAndAuth);
  const [isWorking, setIsWorking] = useState(false);
  const [forkSuccess, setForkSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const forkStartedRef = useRef(false);

  const forkItinerary = async () => {
    if (forkStartedRef.current || !shareToken) return;
    forkStartedRef.current = true;
    setIsWorking(true);
    setError(null);

    try {
      // 1. 先嘗試 API route (若在伺服器端環境)
      const apiRes = await fetch(`/api/share/${shareToken}/fork`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: authUser?.id }),
      }).catch(() => null);

      if (apiRes && apiRes.ok) {
        const json = await apiRes.json();
        if (json.newItineraryId) {
          setForkSuccess(true);
          sessionStorage.removeItem(pendingForkKey);
          setTimeout(() => {
            router.push(`/canvas?id=${json.newItineraryId}`);
          }, 600);
          return;
        }
      }

      // 2. 若 API route 不可用（例如純靜態 GitHub Pages 部署模式），使用 Supabase RPC / Client
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

      setForkSuccess(true);
      sessionStorage.removeItem(pendingForkKey);
      setTimeout(() => {
        router.push(`/canvas?id=${created.new_itinerary_id}`);
      }, 600);
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
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        className={`inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-xs font-black text-slate-900 transition hover:brightness-95 disabled:cursor-wait disabled:opacity-70 shadow-sm ${className}`}
        disabled={isWorking}
        onClick={() => void forkItinerary()}
      >
        {isWorking ? (
          <LoaderCircle aria-hidden="true" size={16} className="animate-spin" />
        ) : forkSuccess ? (
          <Check aria-hidden="true" size={16} />
        ) : (
          <GitFork aria-hidden="true" size={16} />
        )}
        {isWorking ? '正在複製…' : forkSuccess ? '複製成功！前往畫布…' : label}
      </button>
      {error ? <p role="alert" className="mt-1 text-center text-xs text-rose-700">{error}</p> : null}
    </div>
  );
}

