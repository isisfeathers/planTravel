'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { useTimelineStore } from '@/stores/useTimelineStore';
import { usePackingListStore } from '@/stores/usePackingListStore';
import { DayTabs } from '@/components/timeline/DayTabs';
import { ActivityCard } from '@/components/timeline/ActivityCard';
import { PackingListTab } from '@/components/packing/PackingListTab';
import { InteractiveMap } from '@/components/map/InteractiveMapClient';
import type { ActivityItem, ItineraryPayload } from '@/types/itinerary';
import mockItinerary from '../../../../mocks/mock_itinerary.json';

interface CanvasPageProps {
  params: { id: string };
}

export default function CanvasPage({ params }: CanvasPageProps) {
  const itineraryId = params?.id || 'mock-itinerary-id';
  const [currentTab, setCurrentTab] = useState<'timeline' | 'packing'>('timeline');
  const [activeActivityId, setActiveActivityId] = useState<string | undefined>();

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
    const payload = mockItinerary as unknown as ItineraryPayload;
    initTimeline(itineraryId, payload, 1);
    if (payload?.packing_list) initPacking(itineraryId, payload.packing_list);
  }, [itineraryId, initTimeline, initPacking]);

  const currentDayPlan = itineraryData?.daily_itinerary.find((day) => day.day_number === selectedDay);
  const mapActivities = useMemo(
    () => (currentDayPlan?.activities ?? []).map((activity: ActivityItem) => ({
      id: activity.id,
      name: activity.location_name,
      timeSlot: activity.time_slot,
      coordinates: activity.coordinates,
    })),
    [currentDayPlan],
  );

  const selectActivity = (activityId: string) => {
    setActiveActivityId(activityId);
    window.requestAnimationFrame(() => {
      document.querySelector(`[data-activity-id="${CSS.escape(activityId)}"]`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  const selectDay = (day: number) => {
    setSelectedDay(day);
    setActiveActivityId(undefined);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;
    reorderActivities(selectedDay - 1, result.source.index, result.destination.index);
  };

  if (!itineraryData) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><p className="text-slate-500 text-sm">載入行程畫布中...</p></div>;
  }

  return (
    <main className="min-h-screen bg-slate-50 py-6 px-4 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-200">
          <div>
            <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">{itineraryData.meta.destination} · {itineraryData.meta.total_days} 天行程</span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{itineraryData.meta.trip_title}</h1>
          </div>
          <div className="flex items-center gap-2">
            {isTimelineSaving && <div className="w-3.5 h-3.5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />}
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${saveError ? 'bg-rose-100 text-rose-700' : isTimelineSaving ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
              {saveError || saveStatusText} (v{version})
            </span>
          </div>
        </div>

        <div className="flex border-b border-slate-200 gap-4">
          <button type="button" onClick={() => setCurrentTab('timeline')} className={`pb-3 text-sm font-bold border-b-2 transition-all ${currentTab === 'timeline' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>🗓️ 每日時間軸</button>
          <button type="button" onClick={() => setCurrentTab('packing')} className={`pb-3 text-sm font-bold border-b-2 transition-all ${currentTab === 'packing' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>🎒 行李清單</button>
        </div>

        {currentTab === 'timeline' ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)] lg:items-start">
            <div className="flex flex-col gap-6">
              <DayTabs days={itineraryData.daily_itinerary} selectedDay={selectedDay} onSelectDay={selectDay} />
              {currentDayPlan && <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><h3 className="text-sm font-bold text-slate-800">{currentDayPlan.date_label}</h3><p className="mt-1 text-xs text-slate-500">{currentDayPlan.summary}</p></div>}
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId={`day-${selectedDay}`}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="flex min-h-[300px] flex-col gap-2">
                      {currentDayPlan?.activities.map((activity, index) => <ActivityCard key={activity.id} activity={activity} index={index} isActive={activeActivityId === activity.id} onSelect={selectActivity} />)}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
            <aside className="sticky top-4 order-first lg:order-last">
              <InteractiveMap activities={mapActivities} activeActivityId={activeActivityId} onActivitySelect={selectActivity} className="h-[300px] w-full sm:h-[420px]" />
            </aside>
          </div>
        ) : <PackingListTab />}
      </div>
    </main>
  );
}
