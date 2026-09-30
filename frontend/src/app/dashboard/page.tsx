'use client';

import { AlertCircle } from 'lucide-react';

import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { TripSection } from '@/components/dashboard/TripSection';
import { useItineraries } from '@/hooks/useItineraries';
import { useAuthStore } from '@/stores/useAuthStore';

function DashboardSkeleton() {
  return (
    <main className="min-h-screen bg-atrip-surface-page">
      <div className="mx-auto w-full max-w-5xl px-atrip-gutter py-atrip-5 max-[359px]:px-atrip-gutter-narrow sm:py-atrip-8">
        <div className="animate-pulse space-y-atrip-5 motion-reduce:animate-none" aria-hidden="true">
          <div className="flex items-center gap-atrip-3">
            <div className="h-11 w-11 rounded-atrip-full bg-atrip-surface-subtle" />
            <div className="space-y-atrip-2">
              <div className="h-3 w-24 rounded-atrip-full bg-atrip-surface-subtle" />
              <div className="h-5 w-32 rounded-atrip-full bg-atrip-surface-subtle" />
            </div>
          </div>
          <div className="h-52 rounded-atrip-xl bg-atrip-surface-subtle" />
          <div className="space-y-atrip-3">
            <div className="h-6 w-36 rounded-atrip-full bg-atrip-surface-subtle" />
            <div className="h-64 rounded-atrip-xl bg-atrip-surface-subtle" />
          </div>
        </div>
        <p className="sr-only" role="status">正在讀取旅程資料</p>
      </div>
    </main>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const {
    activeItineraryId,
    activeAndUpcoming,
    archived,
    isLoading,
    error,
    setActiveItinerary,
    archiveItinerary,
    softDeleteItinerary,
  } = useItineraries(user?.id);

  if (isLoading) return <DashboardSkeleton />;

  return (
    <main className="min-h-screen bg-atrip-surface-page pb-[calc(2rem+env(safe-area-inset-bottom))]">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-atrip-8 px-atrip-gutter py-atrip-5 max-[359px]:px-atrip-gutter-narrow sm:py-atrip-8">
        <DashboardHeader />

        {error ? (
          <div className="flex gap-atrip-3 rounded-atrip-lg border border-atrip-border-subtle bg-atrip-surface-subtle p-atrip-4 text-atrip-body text-atrip-text-primary" role="alert">
            <AlertCircle className="mt-0.5 shrink-0 text-atrip-brand-logo-ai" size={20} aria-hidden="true" />
            <div>
              <p className="font-semibold">旅程資料暫時無法完整載入</p>
              <p className="mt-atrip-1 text-atrip-caption text-atrip-text-secondary">{error}</p>
            </div>
          </div>
        ) : null}

        <TripSection
          title="接下來的旅程"
          description="打開旅程，繼續安排每日路線與出發前準備。"
          itineraries={activeAndUpcoming}
          activeItineraryId={activeItineraryId}
          onSetActive={setActiveItinerary}
          onArchive={archiveItinerary}
          onDelete={softDeleteItinerary}
          emptyMessage="選一座城市，讓 AI 幫你展開第一條旅行路線。"
          featuredFirst
        />

        {archived.length > 0 ? (
          <TripSection
            title="旅行回憶"
            description="走過的城市與收藏過的旅程都留在這裡"
            itineraries={archived}
            activeItineraryId={activeItineraryId}
            onSetActive={setActiveItinerary}
            onArchive={archiveItinerary}
            onDelete={softDeleteItinerary}
            emptyMessage="目前還沒有封存的旅程。"
          />
        ) : null}
      </div>
    </main>
  );
}
