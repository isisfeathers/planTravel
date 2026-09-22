'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { QrLoginGuide } from './QrLoginGuide';
import { Loader2 } from 'lucide-react';

interface LiffProviderProps {
  children: React.ReactNode;
}

export const LiffProvider: React.FC<LiffProviderProps> = ({ children }) => {
  const { status, initLiffAndAuth, mockLogin } = useAuthStore();
  const [showBypass, setShowBypass] = useState(false);

  useEffect(() => {
    initLiffAndAuth();

    // 若 800ms 內尚未完成初始化，自動啟用 Demo 模式跳過等待
    const timer = setTimeout(() => {
      setShowBypass(true);
      if (status === 'initializing' || status === 'idle') {
        mockLogin();
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [initLiffAndAuth, mockLogin, status]);

  if (status === 'authenticated') {
    return <>{children}</>;
  }

  if (status === 'unauthenticated') {
    return <QrLoginGuide />;
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50 text-slate-800">
        <div className="w-full max-w-sm rounded-2xl p-6 bg-white border border-slate-200 shadow-md text-center space-y-4">
          <p className="text-sm font-bold text-slate-800">連線初始化提示</p>
          <p className="text-xs text-slate-500">外部瀏覽器未偵測到 LINE 環境，您可以直接以 Demo 模式進入體驗。</p>
          <button
            type="button"
            onClick={mockLogin}
            className="w-full py-2.5 px-4 rounded-xl font-bold bg-brand-primary text-slate-900 hover:brightness-95 transition-all text-xs"
          >
            🚀 立即進入 Demo 體驗
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50 text-slate-800">
      <div className="w-full max-w-sm rounded-2xl p-6 bg-white border border-slate-200 shadow-md text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary mx-auto" />
        <p className="text-sm font-bold text-slate-700">正在準備 Atrip 旅遊助理環境...</p>
        {showBypass && (
          <button
            type="button"
            onClick={mockLogin}
            className="w-full py-2 px-4 rounded-xl font-bold bg-brand-primary text-slate-900 hover:brightness-95 transition-all text-xs"
          >
            點此立即進入體驗 ➔
          </button>
        )}
      </div>
    </div>
  );
};

