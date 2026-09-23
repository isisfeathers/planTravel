'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SharePageClient from './[token]/SharePageClient';

function ShareQueryWrapper() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || 'demo';
  return <SharePageClient params={{ token }} />;
}

export default function ShareStaticPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500 text-sm">載入分享行程中...</div>}>
      <ShareQueryWrapper />
    </Suspense>
  );
}
