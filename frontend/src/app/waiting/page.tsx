'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { WaitingCanvas } from '@/components/waiting/WaitingCanvas';

function WaitingContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || 'demo';

  return <WaitingCanvas itineraryId={id} />;
}

export default function WaitingPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500 text-sm">載入中...</div>}>
      <WaitingContent />
    </Suspense>
  );
}
