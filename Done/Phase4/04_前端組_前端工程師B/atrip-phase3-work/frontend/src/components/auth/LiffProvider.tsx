'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { QrLoginGuide } from './QrLoginGuide';

interface LiffProviderProps {
  children: React.ReactNode;
}

export const LiffProvider: React.FC<LiffProviderProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { status, error, initLiffAndAuth } = useAuthStore();

  useEffect(() => {
    initLiffAndAuth();
  }, [initLiffAndAuth]);

  useEffect(() => {
    if (status === 'authenticated') {
      const hasItineraryParam = searchParams?.has('itinerary_id');
      const isPublicShareRoute = pathname?.startsWith('/share');

      if (pathname === '/' && !hasItineraryParam && !isPublicShareRoute) {
        router.replace('/dashboard');
      }
    }
  }, [status, pathname, searchParams, router]);

  if (status === 'initializing' || status === 'exchanging_token') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-background text-brand-text">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-brand-text-muted">
            {status === 'initializing' ? '正在載入 LINE 環境...' : '正在同步旅遊帳號...'}
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-background p-card-padding">
        <div className="w-full max-w-sm rounded-brand-card p-modal-padding bg-brand-surface border border-brand-danger-border text-center space-y-4">
          <h3 className="text-lg font-bold text-brand-danger">連線異常</h3>
          <p className="text-sm text-brand-text-muted">{error?.message || '認證過程發生錯誤'}</p>
          <button
            onClick={() => initLiffAndAuth()}
            className="w-full py-2 px-4 rounded-brand-button bg-brand-primary text-brand-primary-foreground text-sm font-medium hover:bg-brand-primary-hover"
          >
            重新嘗試
          </button>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return <QrLoginGuide />;
  }

  return <>{children}</>;
};
