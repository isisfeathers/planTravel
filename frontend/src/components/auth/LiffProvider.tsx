'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { QrLoginGuide } from './QrLoginGuide';
import { Plane, RotateCcw, Sparkles } from 'lucide-react';

const loadingMessages = [
  '正在準備 Atrip 旅遊助理環境…',
  '正在確認 LINE 登入狀態…',
  '正在整理你的旅程資料…',
] as const;

interface LiffProviderProps {
  children: React.ReactNode;
}

export const LiffProvider: React.FC<LiffProviderProps> = ({ children }) => {
  const { status, initLiffAndAuth, mockLogin } = useAuthStore();
  const pathname = usePathname();
  const [hasMounted, setHasMounted] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [isTakingLonger, setIsTakingLonger] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    initLiffAndAuth();
  }, [initLiffAndAuth]);

  useEffect(() => {
    if (status !== 'idle' && status !== 'initializing' && status !== 'exchanging_token') {
      setLoadingStage(0);
      setIsTakingLonger(false);
      return;
    }

    const stageTwoTimer = window.setTimeout(() => setLoadingStage(1), 1200);
    const stageThreeTimer = window.setTimeout(() => setLoadingStage(2), 3200);
    const fallbackTimer = window.setTimeout(() => setIsTakingLonger(true), 7000);

    return () => {
      window.clearTimeout(stageTwoTimer);
      window.clearTimeout(stageThreeTimer);
      window.clearTimeout(fallbackTimer);
    };
  }, [status]);

  const retryAuthentication = () => {
    setLoadingStage(0);
    setIsTakingLonger(false);
    void initLiffAndAuth(true);
  };

  // 公開分享頁面 (去識別化分享) 允許匿名訪客直接瀏覽
  const isPublicShareRoute = pathname?.includes('/share');
  if (hasMounted && isPublicShareRoute) {
    return <>{children}</>;
  }

  if (hasMounted && status === 'authenticated') {
    return <>{children}</>;
  }

  if (hasMounted && status === 'unauthenticated') {
    return <QrLoginGuide />;
  }

  if (hasMounted && status === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50 text-slate-800">
        <div className="w-full max-w-sm rounded-2xl p-6 bg-white border border-slate-200 shadow-md text-center space-y-4">
          <p className="text-sm font-bold text-slate-800">LINE 連線提示</p>
          <p className="text-xs text-slate-500">外部瀏覽器未偵測到 LINE 環境，您可以直接登入或使用訪客身分體驗。</p>
          <button
            type="button"
            onClick={mockLogin}
            className="w-full py-2.5 px-4 rounded-xl font-bold bg-brand-primary text-slate-900 hover:brightness-95 transition-all text-xs"
          >
            🚀 以臨時訪客身分體驗
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50 text-slate-800">
      <div className="atrip-motion-reveal w-full max-w-sm overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-md">
        <div className="atrip-loading-orbit mx-auto" aria-hidden="true">
          <Plane className="h-7 w-7 -rotate-12 text-atrip-brand-logo-ai" />
        </div>
        <div key={loadingStage} className="atrip-loading-stage mt-6 min-h-12">
          <p className="text-sm font-bold text-slate-800">{loadingMessages[loadingStage]}</p>
          <p className="mt-1 text-xs text-slate-500">稍等一下，美好的旅程正在展開。</p>
        </div>

        <div className="mt-5 flex justify-center gap-2" aria-hidden="true">
          {loadingMessages.map((_, index) => (
            <span
              key={index}
              className={`h-1.5 rounded-full transition-[width,background-color] duration-200 motion-reduce:transition-none ${
                index === loadingStage ? 'w-6 bg-brand-primary' : 'w-1.5 bg-slate-200'
              }`}
            />
          ))}
        </div>

        {isTakingLonger ? (
          <div className="atrip-motion-reveal mt-6 border-t border-slate-100 pt-5">
            <p className="text-xs leading-5 text-slate-500">
              連線比預期久，你可以重新嘗試或先以訪客身分瀏覽。
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={retryAuthentication}
                className="atrip-focus atrip-choice-button inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                <RotateCcw size={14} aria-hidden="true" />
                重新嘗試
              </button>
              <button
                type="button"
                onClick={mockLogin}
                className="atrip-focus atrip-choice-button inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-brand-primary px-3 text-xs font-bold text-slate-900 hover:brightness-95"
              >
                <Sparkles size={14} aria-hidden="true" />
                訪客體驗
              </button>
            </div>
          </div>
        ) : null}

        <p className="sr-only" role="status" aria-live="polite">
          {loadingMessages[loadingStage]}
        </p>
      </div>
    </div>
  );
};
