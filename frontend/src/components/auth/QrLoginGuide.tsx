'use client';

import React from 'react';
import { useAuthStore } from '@/stores/useAuthStore';

export const QrLoginGuide: React.FC = () => {
  const { login, mockLogin } = useAuthStore();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50 text-slate-800">
      <div className="w-full max-w-md rounded-2xl p-8 shadow-lg bg-white border border-slate-200 text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#06C755]/10 text-[#06C755]">
          <span className="text-3xl font-black">A</span>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            歡迎使用 Atrip 自由行旅遊助理
          </h2>
          <p className="text-sm text-slate-500">
            請使用 LINE 帳號登入，系統將為您建立專屬的旅遊行程資料庫。
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => void login()}
            className="w-full py-3.5 px-4 rounded-xl font-bold bg-[#06C755] text-white hover:bg-[#05b34c] active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2 text-base cursor-pointer"
          >
            <span>💬 使用 LINE 帳號一鍵登入</span>
          </button>

          <button
            onClick={mockLogin}
            className="w-full py-2.5 px-4 rounded-xl font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all text-xs"
          >
            <span>以臨時訪客身分體驗 ➔</span>
          </button>
        </div>

        <div className="pt-2 border-t border-slate-100 text-xs text-slate-400">
          安全加密 · 支援 LINE 免密無感登入
        </div>
      </div>
    </div>
  );
};

