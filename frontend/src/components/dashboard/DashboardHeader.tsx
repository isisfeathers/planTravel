'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn, LogOut, Plus, Sparkles } from 'lucide-react';

import { useAuthStore } from '@/stores/useAuthStore';

export function DashboardHeader() {
  const router = useRouter();
  const { user, logout, login } = useAuthStore();

  const isGuest =
    !user?.line_user_id ||
    user.line_user_id.startsWith('guest-') ||
    user.display_name?.includes('訪客');
  const displayName = user?.display_name?.replace(/\s*\(Demo\)/g, '') || '旅人';

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header className="space-y-atrip-4">
      <div className="flex items-center justify-between gap-atrip-3">
        <div className="flex min-w-0 items-center gap-atrip-3">
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={`${displayName}的頭像`}
              className="h-11 w-11 shrink-0 rounded-atrip-full border border-atrip-border-subtle object-cover"
            />
          ) : (
            <span
              aria-hidden="true"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-atrip-full bg-atrip-selection-background text-atrip-brand-logo-ai"
            >
              <Sparkles size={20} />
            </span>
          )}

          <div className="min-w-0">
            <p className="text-atrip-caption text-atrip-text-secondary">你好，{displayName}</p>
            <h1 className="truncate text-atrip-h1 text-atrip-text-primary">你的旅程</h1>
          </div>
        </div>

        {!isGuest ? (
          <div className="flex shrink-0 items-center gap-atrip-2">
            <span className="rounded-atrip-full bg-atrip-selection-background px-atrip-3 py-atrip-1 text-atrip-caption font-semibold text-atrip-selection-foreground">
              LINE 已連線
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="atrip-icon-button border border-atrip-border-subtle bg-atrip-surface-card"
              aria-label="登出帳號"
              title="登出目前帳號"
            >
              <LogOut size={20} />
            </button>
          </div>
        ) : null}
      </div>

      {isGuest ? (
        <div className="rounded-atrip-lg border border-atrip-border-subtle bg-atrip-surface-subtle p-atrip-4">
          <div className="flex gap-atrip-3">
            <span
              aria-hidden="true"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-atrip-full bg-atrip-selection-background text-atrip-selection-foreground"
            >
              <Sparkles size={17} />
            </span>
            <div>
              <p className="text-atrip-body font-semibold text-atrip-text-primary">目前是訪客體驗模式</p>
              <p className="mt-atrip-1 text-atrip-caption text-atrip-text-secondary">
                使用 LINE 登入，即可在 LINE OA 延續旅程與接收通知。
              </p>
            </div>
          </div>
          <div className="mt-atrip-3 grid grid-cols-2 gap-atrip-2">
            <button
              type="button"
              onClick={() => void login()}
              className="atrip-compact-primary"
            >
              <LogIn size={18} aria-hidden="true" />
              使用 LINE 登入
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="atrip-compact-secondary"
            >
              返回登入
            </button>
          </div>
        </div>
      ) : null}

      <div className="relative overflow-hidden rounded-atrip-xl bg-atrip-brand-logo-trp p-atrip-5 text-white sm:flex sm:items-end sm:justify-between sm:gap-atrip-6 sm:p-atrip-6">
        <div className="atrip-dashboard-route" aria-hidden="true">
          <span className="atrip-dashboard-route-dot" />
        </div>
        <div className="relative z-10 max-w-lg">
          <p className="text-atrip-caption font-semibold text-atrip-action-primary">ATRIP × LINE</p>
          <h2 className="mt-atrip-1 text-atrip-display">下一站，想去哪裡？</h2>
          <p className="mt-atrip-2 text-atrip-body text-white">
            告訴 AI 你的旅行方式，從靈感到每日路線一次準備好。
          </p>
        </div>
        <Link
          href="/wizard"
          className="atrip-cta-glint atrip-primary-button relative z-10 mt-atrip-5 sm:mt-0 sm:w-auto sm:min-w-44"
        >
          <Plus size={20} aria-hidden="true" />
          規劃新旅程
        </Link>
      </div>
    </header>
  );
}
