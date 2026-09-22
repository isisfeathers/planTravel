'use client'; // 

import React from 'react';
import { useItineraries } from '@/hooks/useItineraries';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { TripSection } from '@/components/dashboard/TripSection';

export default function DashboardPage() {
  // 測試時可傳入使用者 ID，後續會由 Auth Context 統一注入
  const currentUserId = 'mock-user-id';

  const {
    activeItineraryId,
    activeAndUpcoming,
    archived,
    isLoading,
    error,
    setActiveItinerary,
    archiveItinerary,
    softDeleteItinerary,
  } = useItineraries(currentUserId);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6 sm:p-10 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">讀取行程資料中...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4 sm:px-8 max-w-6xl mx-auto flex flex-col gap-8">
      <DashboardHeader />

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      )}

      <TripSection
        title="活躍中與即將出發 (Active & Upcoming)"
        description="當前關注中的行程將作為 LINE Bot 助理優先應對的上下文"
        itineraries={activeAndUpcoming}
        activeItineraryId={activeItineraryId}
        onSetActive={setActiveItinerary}
        onArchive={archiveItinerary}
        onDelete={softDeleteItinerary}
        emptyMessage="目前沒有進行中的旅程，點擊右上角「規劃新旅程」開始吧！"
      />

      {archived.length > 0 && (
        <TripSection
          title="歷史旅程 (Archived)"
          description="過去已完成或手動封存的旅程紀錄"
          itineraries={archived}
          activeItineraryId={activeItineraryId}
          onSetActive={setActiveItinerary}
          onArchive={archiveItinerary}
          onDelete={softDeleteItinerary}
          emptyMessage="尚無已封存的行程。"
        />
      )}
    </main>
  );
}