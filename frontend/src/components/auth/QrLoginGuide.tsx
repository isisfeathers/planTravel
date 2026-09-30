'use client';

import React from 'react';
import { useAuthStore } from '@/stores/useAuthStore';

export const QrLoginGuide: React.FC = () => {
  const { login, mockLogin } = useAuthStore();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-atrip-surface-page px-atrip-gutter py-atrip-8 text-atrip-text-primary max-[359px]:px-atrip-gutter-narrow">
      <div className="w-full max-w-md space-y-atrip-6 rounded-atrip-xl border border-atrip-border-subtle bg-atrip-surface-card p-atrip-6 text-center shadow-atrip-elevated">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-atrip-xl bg-atrip-brand-logo-trp text-atrip-action-primary">
          <span className="text-3xl font-black">A</span>
        </div>

        <div className="space-y-2">
          <h2 className="text-atrip-title font-bold tracking-tight text-atrip-text-primary">
            歡迎使用 Atrip 自由行旅遊助理
          </h2>
          <p className="text-atrip-body leading-relaxed text-atrip-text-secondary">
            請使用 LINE 帳號登入，系統將為您建立專屬的旅遊行程資料庫。
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => void login()}
            className="atrip-focus flex min-h-atrip-primary-button w-full cursor-pointer items-center justify-center gap-atrip-2 rounded-atrip-md bg-[#06C755] px-atrip-4 text-atrip-body font-bold text-white shadow-atrip-soft transition-colors motion-reduce:transition-none"
          >
            <span>💬 使用 LINE 帳號一鍵登入</span>
          </button>

          <button
            onClick={mockLogin}
            className="atrip-compact-secondary min-h-atrip-control w-full rounded-atrip-md"
          >
            <span>以臨時訪客身分體驗 ➔</span>
          </button>
        </div>

        <div className="border-t border-atrip-border-subtle pt-atrip-3 text-atrip-caption text-atrip-text-secondary">
          安全加密 · 支援 LINE 免密無感登入
        </div>
      </div>
    </main>
  );
};
