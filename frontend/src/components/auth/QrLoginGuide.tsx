'use client';

import React from 'react';
import { useAuthStore } from '@/stores/useAuthStore';

export const QrLoginGuide: React.FC = () => {
  const { login } = useAuthStore();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-card-padding bg-brand-surface text-brand-text">
      <div className="w-full max-w-md rounded-brand-card p-modal-padding shadow-brand-elevation bg-brand-background border border-brand-border text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-primary-light text-brand-primary">
          <span className="text-2xl font-bold">A</span>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-brand-heading">
            歡迎使用 Atrip 自由行旅遊助理
          </h2>
          <p className="text-sm text-brand-text-muted">
            為了獲得最佳的行程同步體驗，請使用 LINE 掃描或直接登入。
          </p>
        </div>

        <button
          onClick={login}
          className="w-full py-3 px-4 rounded-brand-button font-medium bg-brand-primary text-brand-primary-foreground hover:bg-brand-primary-hover active:bg-brand-primary-active transition-colors shadow-brand-button"
        >
          使用 LINE 帳號登入
        </button>
      </div>
    </div>
  );
};
