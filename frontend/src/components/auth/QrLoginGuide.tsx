'use client';

import React from 'react';
import { useAuthStore } from '@/stores/useAuthStore';

export const QrLoginGuide: React.FC = () => {
  const { login, mockLogin } = useAuthStore();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50 text-slate-800">
      <div className="w-full max-w-md rounded-2xl p-8 shadow-lg bg-white border border-slate-200 text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-primary/10 text-[#347FA3]">
          <span className="text-2xl font-black">A</span>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            歡迎使用 Atrip 自由行旅遊助理
          </h2>
          <p className="text-sm text-slate-500">
            在一般電腦瀏覽器測試時，您可以直接點擊「免登入直接體驗」進入儀表板，或使用 LINE 帳號授權登入。
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={mockLogin}
            className="w-full py-3.5 px-4 rounded-xl font-bold bg-[#347FA3] text-white hover:bg-[#2A6683] active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2 text-base"
          >
            <span>🚀 免登入直接體驗 (Demo 模式)</span>
          </button>

          <button
            onClick={login}
            className="w-full py-3 px-4 rounded-xl font-semibold border border-[#06C755] bg-[#06C755] text-white hover:bg-[#05b34c] active:scale-[0.99] transition-all shadow-sm flex items-center justify-center gap-2 text-sm"
          >
            <span>使用 LINE 帳號登入</span>
          </button>
        </div>

        <div className="pt-2 border-t border-slate-100 text-xs text-slate-400">
          測試環境 · 支援 Supabase Realtime 與 LIFF 雙通道
        </div>
      </div>
    </div>
  );
};

