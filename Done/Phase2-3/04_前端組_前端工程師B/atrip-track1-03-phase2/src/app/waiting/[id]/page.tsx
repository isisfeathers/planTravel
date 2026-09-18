import React from 'react';
// import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';

/**
 * TRACK1-04 動態等待畫布
 * 
 * 1. 呈現飛機航線微動畫、骨架屏效果與旅遊實用小知識（Tips）輪播
 * 2. 實作 5 秒輪詢備援機制 (Polling Fallback)
 * 3. 一旦狀態變成 completed，平滑導航至 /canvas/[id]
 */
export default function WaitingPage({ params }: { params: { id: string } }) {
  // const status = useRealtimeSubscription(params.id);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        您的專屬行程正在生成中...
      </h1>
      
      {/* 飛機航線微動畫區塊 (待實作) */}
      <div className="w-64 h-64 bg-gray-100 rounded-full flex items-center justify-center mb-8">
        <span className="text-gray-400">動畫預留區</span>
      </div>

      {/* 旅遊實用小知識（Tips）輪播 (待實作) */}
      <div className="text-center px-6">
        <p className="text-gray-600">小知識：日本地鐵可用 Suica 或 Pasmo 卡，建議綁定 Apple Pay 較為方便。</p>
      </div>
    </div>
  );
}
