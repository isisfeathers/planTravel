'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { QrLoginGuide } from './QrLoginGuide';

interface LiffProviderProps {
  children: React.ReactNode;
}


export const LiffProvider: React.FC<LiffProviderProps> = ({ children }) => {
  const { status, initLiffAndAuth } = useAuthStore();

  useEffect(() => {
    initLiffAndAuth();
  }, [initLiffAndAuth]);

  if (status === 'initializing' || status === 'idle') {
    return <div>正在初始化... (狀態: {status})</div>;
  }

  if (status === 'error') {
    return <div>連線異常，請重新整理頁面或檢查控制台。</div>;
  }

  if (status === 'unauthenticated') {
    return <QrLoginGuide />;
  }

  if (status === 'authenticated') {
    return <>{children}</>;
  }

  return <div>未知狀態: {status}</div>;
};
