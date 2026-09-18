'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { useTimelineStore } from '@/stores/useTimelineStore';
import { usePackingListStore } from '@/stores/usePackingListStore';
import { DayTabs } from '@/components/timeline/DayTabs';
import { ActivityCard } from '@/components/timeline/ActivityCard';
import { PackingListTab } from '@/components/packing/PackingListTab';
import mockItinerary from '@/mocks/mock_itinerary.json';

interface CanvasPageProps {
  params: { id: string };
}

export default function CanvasPage({ params }: CanvasPageProps) {
  const itineraryId = params?.id || 'mock-itinerary-id';
  const [currentTab, setCurrentTab] = useState<'timeline' | 'packing'>('timeline');

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
  } = useTimelineStore();

  const { initialize: initPacking } = usePackingListStore();

  useEffect(() => {
    const payload = (mockItinerary as any).itinerary_data;
    initTimeline(itineraryId, payload, 1);
    if (payload?.packing_list) {
      initPacking(itineraryId, payload.packing_list);
    }
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
      {/* 頂部標題與狀態 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">
            {itineraryData.meta.destination} · {itineraryData.meta.total_days} 天行程
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
            {itineraryData.meta.trip_title}
          </h1>
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

      {/* 主分頁切換：時間軸 vs 行李清單 */}
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
      </div>

      {/* 分頁內容展示 */}
      {currentTab === 'timeline' ? (
        <div className="flex flex-col gap-6">
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
      ) : (
        <PackingListTab />
      )}
    </main>
  );
}