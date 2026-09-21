'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { useTimelineStore } from '@/stores/useTimelineStore';
import { usePackingListStore } from '@/stores/usePackingListStore';
import { DayTabs } from '@/components/timeline/DayTabs';
import { ActivityCard } from '@/components/timeline/ActivityCard';
import { PackingListTab } from '@/components/packing/PackingListTab';
import { FlightTab } from '@/components/flights/FlightTab';
import { DateAdjustmentModal } from '@/components/timeline/DateAdjustmentModal';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { Calendar } from 'lucide-react';
import mockItinerary from '@/mocks/mock_itinerary.json';

interface CanvasPageProps {
  params: { id: string };
}

export default function CanvasPage({ params }: CanvasPageProps) {
  const itineraryId = params?.id || 'mock-itinerary-id';
  const [currentTab, setCurrentTab] = useState<'timeline' | 'packing' | 'flights'>('timeline');
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);

  const {
    itineraryData,
    version,
    selectedDay,
    isSaving: isTimelineSaving,
    saveError,
    saveStatusText,
    initialize: initTimeline,
    setSelectedDay,
    reorderActivities,
    updateTripDates,
  } = useTimelineStore();

  const { initialize: initPacking } = usePackingListStore();

  useEffect(() => {
    async function loadItinerary() {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase
          .from('itineraries')
          .select('itinerary_data, version')
          .eq('id', itineraryId)
          .maybeSingle();

        if (!error && data?.itinerary_data && Object.keys(data.itinerary_data).length > 0) {
          const payload = data.itinerary_data;
          initTimeline(itineraryId, payload, data.version || 1);
          if (payload?.packing_list) {
            initPacking(itineraryId, payload.packing_list);
          }
          return;
        }
      } catch (err) {
        console.warn('載入行程異常，切換至備用行程:', err);
      }

      const payload = (mockItinerary as any).itinerary_data;
      initTimeline(itineraryId, payload, 1);
      if (payload?.packing_list) {
        initPacking(itineraryId, payload.packing_list);
      }
    }

    loadItinerary();
  }, [itineraryId, initTimeline, initPacking]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;
    if (sourceIndex === destIndex) return;

    const dayIndex = selectedDay - 1;
    reorderActivities(dayIndex, sourceIndex, destIndex);
  };

  if (!itineraryData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 text-sm">載入行程畫布中...</p>
      </div>
    );
  }

      const currentDayPlan = (itineraryData.daily_itinerary || []).find(
    (d: any) => d.day_number === selectedDay
  );

  return (
    <main className="min-h-screen bg-slate-50 py-6 px-4 sm:px-8 max-w-4xl mx-auto flex flex-col gap-6">
      {/* 頂部全域導航 */}
      <div className="flex justify-between items-center bg-white p-3 px-4 rounded-2xl border border-slate-200 shadow-sm">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-brand-primary transition-colors"
        >
          <span>←</span>
          <span>我的行程儀表板</span>
        </Link>
        <Link
          href="/wizard"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-primary/10 text-brand-primary text-xs font-bold hover:bg-brand-primary hover:text-slate-900 transition-all"
        >
          <span>＋ 規劃新旅程</span>
        </Link>
      </div>

      {/* 頂部標題與狀態 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">
            {itineraryData.meta.destination} · {itineraryData.meta.total_days} 天行程
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
            {itineraryData.meta.trip_title}
          </h1>

          {/* 出發日期與調整按鈕 */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
              <Calendar size={13} className="text-slate-500" />
              <span>
                {itineraryData.meta.start_date && itineraryData.meta.end_date
                  ? `${itineraryData.meta.start_date} ~ ${itineraryData.meta.end_date}`
                  : `尚未指定出發日期`}
              </span>
            </span>
            <button
              type="button"
              onClick={() => setIsDateModalOpen(true)}
              className="text-xs font-bold px-3 py-1 rounded-lg bg-brand-primary/15 text-brand-primary hover:bg-brand-primary hover:text-slate-900 transition-all flex items-center gap-1 shadow-2xs"
            >
              <span>📅 調整出發日期</span>
            </button>
          </div>
        </div>

        {/* 狀態指示 */}
        <div className="flex items-center gap-2">
          {isTimelineSaving && (
            <div className="w-3.5 h-3.5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
          )}
          <span
            className={`text-xs font-medium px-3 py-1 rounded-full ${
              saveError
                ? 'bg-rose-100 text-rose-700'
                : isTimelineSaving
                ? 'bg-amber-100 text-amber-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {saveError ? saveError : saveStatusText} (v{version})
          </span>
        </div>
      </div>

      {/* 主分頁切換：時間軸 vs 行李清單 vs 推薦航班 */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          type="button"
          onClick={() => setCurrentTab('timeline')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            currentTab === 'timeline'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          🗓️ 每日時間軸
        </button>
        <button
          type="button"
          onClick={() => setCurrentTab('packing')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            currentTab === 'packing'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          🎒 行李清單
        </button>
        <button
          type="button"
          onClick={() => setCurrentTab('flights')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            currentTab === 'flights'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          ✈️ 推薦航班比價
        </button>
      </div>

      {/* 分頁內容展示 */}
      {currentTab === 'timeline' ? (
        <div className="flex flex-col gap-5">
          {/* AI 精選住宿基地 (Basecamp) */}
          {itineraryData.recommendations?.accommodations?.[0] && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-800 text-white shadow-md border border-slate-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-brand-primary text-slate-900">
                    🏨 AI 推薦住宿基地 (Basecamp)
                  </span>
                  <span className="text-xs text-amber-300 font-bold">
                    ★ {itineraryData.recommendations.accommodations[0].rating || 4.6}
                  </span>
                  <span className="text-xs text-slate-400">
                    · {itineraryData.recommendations.accommodations[0].type || '設計型景觀飯店'}
                  </span>
                </div>
                <h3 className="text-base font-black text-white mt-1">
                  {itineraryData.recommendations.accommodations[0].name}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  {itineraryData.recommendations.accommodations[0].reason || '鄰近交通大站，適合作為每日出發與返回之固定基地。'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    itineraryData.recommendations.accommodations[0].google_map_query ||
                      itineraryData.recommendations.accommodations[0].name
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold backdrop-blur-sm transition-all"
                >
                  <span>地圖導航</span>
                  <span>↗</span>
                </a>
              </div>
            </div>
          )}

          <DayTabs
            days={itineraryData.daily_itinerary || []}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
          />

          {currentDayPlan && (
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800">{currentDayPlan.date_label}</h3>
              <p className="text-xs text-slate-500 mt-1">{currentDayPlan.summary}</p>
            </div>
          )}

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId={`day-${selectedDay}`}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex flex-col gap-2 min-h-[300px]"
                >
                  {currentDayPlan?.activities.map((activity: any, index: number) => (
                    <ActivityCard key={activity.id} activity={activity} index={index} />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      ) : currentTab === 'packing' ? (
        <PackingListTab />
      ) : (
        <FlightTab
          destination={itineraryData.meta.destination}
          startDate={itineraryData.meta.start_date}
          endDate={itineraryData.meta.end_date}
        />
      )}

      {/* 日期調整彈窗 */}
      <DateAdjustmentModal
        isOpen={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
        currentStartDate={itineraryData.meta.start_date}
        totalDays={itineraryData.meta.total_days || 1}
        destination={itineraryData.meta.destination || '旅遊目的地'}
        onConfirm={async (newStartDate) => {
          await updateTripDates(newStartDate);
        }}
      />
    </main>
  );
}