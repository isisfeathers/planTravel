'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, LogIn, Sparkles, Plus } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';

export const DashboardHeader: React.FC = () => {
  const router = useRouter();
  const { user, logout, login } = useAuthStore();

  const isGuest =
    !user?.line_user_id ||
    user.line_user_id.startsWith('guest-') ||
    user.display_name?.includes('訪客');

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header className="flex flex-col gap-3 pb-6 border-b border-slate-200">
      {/* 訪客模式提示橫幅 */}
      {isGuest && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs shadow-2xs">
          <div className="flex items-center gap-2 font-bold">
            <Sparkles size={16} className="text-amber-600 shrink-0" />
            <span>目前為「訪客體驗模式」，建立之行程保存在此裝置。</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={async () => {
                await login();
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold inline-flex items-center gap-1 transition-all cursor-pointer shadow-xs"
            >
              <LogIn size={13} />
              <span>使用 LINE 登入</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-800 hover:bg-amber-100 font-bold inline-flex items-center gap-1 transition-all"
            >
              <LogOut size={13} />
              <span>返回首頁</span>
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            {user?.avatar_url && (
              <img
                src={user.avatar_url}
                alt={user.display_name || '用戶頭像'}
                className="w-8 h-8 rounded-full border border-slate-200 object-cover"
              />
            )}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {isGuest
                ? '訪客旅人的行程'
                : (user?.display_name ? `${user.display_name.replace(/\s*\(Demo\)/g, '')} 的行程` : '我的行程儀表板')}
            </h1>
            {!isGuest && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                LINE 已連線
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            管理你的 AI 自由行計畫、關注當前旅程與歷史封存
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          {!isGuest && (
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold text-xs shadow-2xs hover:bg-slate-50 hover:text-rose-600 active:scale-98 transition-all"
              title="登出目前帳號並返回登入頁"
            >
              <LogOut size={14} />
              <span>登出帳號</span>
            </button>
          )}

          <Link
            href="/wizard"
            className="inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl bg-brand-primary text-white font-bold text-xs sm:text-sm shadow-sm hover:opacity-95 active:scale-98 transition-all"
          >
            <Plus size={16} />
            <span>規劃新旅程</span>
          </Link>
        </div>
      </div>
    </header>
  );
};