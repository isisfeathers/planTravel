'use client';

import { Suspense } from 'react';
import { CanvasClient } from './[id]/CanvasClient';

export default function CanvasStaticPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500 text-sm">載入行程畫布中...</div>}>
      <CanvasClient />
    </Suspense>
  );
}
