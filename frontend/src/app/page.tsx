'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function HomeRouter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token') || searchParams.get('share_token');
    const itineraryId = searchParams.get('itinerary_id') || searchParams.get('id');

    if (token) {
      router.replace(`/share?token=${token}`);
      return;
    }

    if (itineraryId) {
      router.replace(`/canvas?id=${itineraryId}`);
      return;
    }

    router.replace('/dashboard');
  }, [router, searchParams]);

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



