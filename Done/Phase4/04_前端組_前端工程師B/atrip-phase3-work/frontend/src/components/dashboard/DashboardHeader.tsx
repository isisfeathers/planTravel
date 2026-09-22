import React from 'react';
import Link from 'next/link';

export const DashboardHeader: React.FC = () => {
  return (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          我的行程儀表板
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          管理你的 AI 自由行計畫、關注當前旅程與歷史封存
        </p>
      </div>

      <Link
        href="/wizard"
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary text-white font-semibold text-sm shadow-sm hover:opacity-95 active:scale-98 transition-all"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        </svg>
        <span>規劃新旅程</span>
      </Link>
    </header>
  );
};
