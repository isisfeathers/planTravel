'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';

function HomeRouter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status, user } = useAuthStore();

  useEffect(() => {
    // 1. 優先檢查 SearchParams
    const token = searchParams.get('token') || searchParams.get('share_token');
    const itineraryId = searchParams.get('itinerary_id') || searchParams.get('id');

    if (token) {
      router.replace(`/share?token=${encodeURIComponent(token)}`);
      return;
    }

    if (itineraryId) {
      router.replace(`/canvas?id=${encodeURIComponent(itineraryId)}`);
      return;
    }

    // 2. 靜態伺服器 404 回退路徑檢查
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      const shareMatch = pathname.match(/\/share\/([^\/]+)/);
      if (shareMatch && shareMatch[1] && shareMatch[1] !== 'index.html') {
        router.replace(`/share?token=${encodeURIComponent(shareMatch[1])}`);
        return;
      }

      const canvasMatch = pathname.match(/\/canvas\/([^\/]+)/);
      if (canvasMatch && canvasMatch[1] && canvasMatch[1] !== 'index.html') {
        router.replace(`/canvas?id=${encodeURIComponent(canvasMatch[1])}`);
        return;
      }
    }

    // 3. 已登入時自動前往 Dashboard，未登入時保留在首頁登入引導
    if (status === 'authenticated' && user) {
      router.replace('/dashboard');
    }
  }, [router, searchParams, status, user]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500 text-sm">
      正在前往 Atrip 旅遊助理...
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500 text-sm">載入中...</div>}>
      <HomeRouter />
    </Suspense>
  );
}



