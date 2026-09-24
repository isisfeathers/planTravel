'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { useTimelineStore } from '@/stores/useTimelineStore';
import { usePackingListStore } from '@/stores/usePackingListStore';
import { DayTabs } from '@/components/timeline/DayTabs';
import { ActivityCard } from '@/components/timeline/ActivityCard';
import { PackingListTab } from '@/components/packing/PackingListTab';
import { FlightTab } from '@/components/flights/FlightTab';
import { DateAdjustmentModal } from '@/components/timeline/DateAdjustmentModal';
import { InteractiveMap } from '@/components/map/InteractiveMapClient';
import { PdfExportButton } from '@/components/export/PdfExportButton';
import { PdfPrintView } from '@/components/export/PdfPrintView';
import { ShareModal } from '@/components/share/ShareModal';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { generateDynamicPackingList } from '@/lib/packingListGenerator';
import { Calendar, Share2, Map as MapIcon, List, Compass } from 'lucide-react';
import mockItinerary from '@/mocks/mock_itinerary.json';

interface CanvasClientProps {
  params?: { id?: string };
}

function safeEscapeId(id: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(id);
  }
  return id.replace(/["\\]/g, '\\$&');
}

function getResolvedPackingList(payload: any) {
  const dest = payload?.meta?.destination || '巴黎';
  const days = Number(payload?.meta?.total_days || payload?.daily_itinerary?.length || 3);
  const startDate = payload?.meta?.start_date;
  const existingList = payload?.packing_list;

  const isJapan = /日本|東京|大阪|京都|沖繩|福岡|札幌|北海道|名古屋|熊本|仙台|廣島|高松/.test(dest);
  const hasMismatchedJapanItems = !isJapan && Array.isArray(existingList) && existingList.some(
    (item: any) =>
      item.item_name?.includes('日幣') ||
      item.item_name?.includes('Suica') ||
      item.item_name?.includes('ICOCA') ||
      item.item_name?.includes('Visit Japan Web') ||
      item.item_name?.includes('VJW')
  );

  if (!existingList || existingList.length === 0 || hasMismatchedJapanItems) {
    return generateDynamicPackingList(dest, days, startDate);
  }
  return existingList;
}

export function CanvasClient({ params }: CanvasClientProps) {
  const searchParams = useSearchParams();
  const itineraryId = params?.id || searchParams?.get('id') || 'mock-itinerary-id';
  const [currentTab, setCurrentTab] = useState<'timeline' | 'packing' | 'flights'>('timeline');
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [activeActivityId, setActiveActivityId] = useState<string | undefined>();
  const [shareToken, setShareToken] = useState<string>('demo');
  const [mobileView, setMobileView] = useState<'timeline' | 'map' | 'route'>('timeline');
  const [desktopMapMode, setDesktopMapMode] = useState<'map' | 'route'>('map');

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
      let payload = (mockItinerary as any).itinerary_data || mockItinerary;
      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase
          .from('itineraries')
          .select('itinerary_data, version, share_token')
          .eq('id', itineraryId)
          .maybeSingle();

        if (!error && data?.itinerary_data && Object.keys(data.itinerary_data).length > 0) {
          payload = data.itinerary_data;
          if (data.share_token) setShareToken(data.share_token);
          initTimeline(itineraryId, payload, data.version || 1);
          const packingList = getResolvedPackingList(payload);
          initPacking(itineraryId, packingList);
          return;
        }
      } catch (err) {
        console.warn('載入行程異常，切換至備用行程:', err);
      }

      initTimeline(itineraryId, payload, 1);
      const packingList = getResolvedPackingList(payload);
      initPacking(itineraryId, packingList);
    }

    loadItinerary();
  }, [itineraryId, initTimeline, initPacking]);

  const selectActivity = (activityId: string, shouldSwitchMobileView = false) => {
    setActiveActivityId(activityId);
    if (shouldSwitchMobileView && typeof window !== 'undefined' && window.innerWidth < 768) {
      setMobileView('map');
    }
    window.requestAnimationFrame(() => {
      try {
        const escaped = safeEscapeId(activityId);
        document.querySelector(`[data-activity-id="${escaped}"]`)
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch (e) {}
    });
  };

  const handleSelectDay = (day: number) => {
    setSelectedDay(day);
    setActiveActivityId(undefined);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;
    if (sourceIndex === destIndex) return;

    const dayIndex = selectedDay - 1;
    reorderActivities(dayIndex, sourceIndex, destIndex);
  };

  const currentDayPlan = useMemo(
    () =>
      (itineraryData?.daily_itinerary || []).find(
        (d: any) => d.day_number === selectedDay
      ),
    [itineraryData, selectedDay]
  );

  const mapActivities = useMemo(
    () =>
      (currentDayPlan?.activities || []).map((activity: any) => ({
        id: activity.id,
        name: activity.location_name,
        timeSlot: activity.time_slot,
        coordinates: activity.coordinates,
      })),
    [currentDayPlan]
  );

  const selectedActivityData = useMemo(
    () => (currentDayPlan?.activities || []).find((a: any) => a.id === activeActivityId),
    [currentDayPlan, activeActivityId]
  );

  if (!itineraryData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-3 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-medium">載入行程畫布中...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-4 sm:py-6 px-3.5 sm:px-8 max-w-6xl mx-auto flex flex-col gap-4 sm:gap-6 overflow-x-hidden">
      {/* 頂部全域導航與功能按鈕 */}
      <header className="flex flex-wrap justify-between items-center bg-white p-2.5 sm:p-3 px-3 sm:px-4 rounded-2xl border border-slate-200 shadow-2xs gap-2 no-print">
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-brand-primary transition-colors py-1 px-1.5 rounded-lg hover:bg-slate-100"
          >
            <span>←</span>
            <span>儀表板</span>
          </Link>
          <Link
            href="/wizard"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-brand-primary/10 text-brand-primary text-xs font-bold hover:bg-brand-primary hover:text-slate-900 transition-all"
          >
            <span>＋ 規劃新旅程</span>
          </Link>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-all border border-slate-200 shadow-2xs"
          >
            <Share2 size={13} className="text-slate-500 shrink-0" />
            <span>分享行程</span>
          </button>
          <PdfExportButton itineraryId={itineraryId} />
        </div>
      </header>

      {/* 頂部標題與出發日期 */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 sm:pb-4 border-b border-slate-200/80">
        <div className="min-w-0 flex-1">
          <span className="text-[11px] sm:text-xs font-bold text-brand-primary uppercase tracking-wider">
            📍 {itineraryData.meta.destination} · {itineraryData.meta.total_days} 天自由行
          </span>
          <h1 className="text-lg sm:text-2xl font-black text-slate-900 mt-0.5 truncate" title={itineraryData.meta.trip_title}>
            {itineraryData.meta.trip_title}
          </h1>

          {/* 出發日期與調整按鈕 */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-[11px] sm:text-xs font-bold text-slate-700 flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
              <Calendar size={12} className="text-slate-500 shrink-0" />
              <span>
                {itineraryData.meta.start_date && itineraryData.meta.end_date
                  ? `${itineraryData.meta.start_date} ~ ${itineraryData.meta.end_date}`
                  : `尚未指定出發日期`}
              </span>
            </span>
            <button
              type="button"
              onClick={() => setIsDateModalOpen(true)}
              className="no-print text-[11px] sm:text-xs font-bold px-2.5 py-1 rounded-lg bg-brand-primary/15 text-brand-primary hover:bg-brand-primary hover:text-slate-900 transition-all flex items-center gap-1 shadow-2xs"
            >
              <span>📅 調整日期</span>
            </button>
          </div>
        </div>

        {/* 儲存狀態指示 */}
        <div className="flex items-center gap-2 shrink-0 no-print">
          {isTimelineSaving && (
            <div className="w-3.5 h-3.5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
          )}
          <span
            className={`text-[11px] sm:text-xs font-medium px-2.5 py-0.5 rounded-full ${
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
      </section>

      {/* 主分頁切換：時間軸 vs 行李清單 vs 推薦航班 */}
      <nav className="flex border-b border-slate-200 gap-2 sm:gap-6 no-print overflow-x-auto scrollbar-none pb-0.5">
        <button
          type="button"
          onClick={() => setCurrentTab('timeline')}
          className={`pb-2.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
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
          className={`pb-2.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
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
          className={`pb-2.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
            currentTab === 'flights'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          ✈️ 推薦航班比價
        </button>
      </nav>

      {/* 分頁內容展示 */}
      {currentTab === 'timeline' ? (
        <div className="flex flex-col gap-4 sm:gap-5">
          {/* AI 精選住宿基地 (Basecamp) */}
          {itineraryData.recommendations?.accommodations?.[0] && (
            <section className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-800 text-white shadow-md border border-slate-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-brand-primary text-slate-900">
                    🏨 推薦住宿基地 (Basecamp)
                  </span>
                  <span className="text-xs text-amber-300 font-bold">
                    ★ {itineraryData.recommendations.accommodations[0].rating || 4.6}
                  </span>
                  <span className="text-xs text-slate-400">
                    · {itineraryData.recommendations.accommodations[0].type || '優選飯店'}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-white mt-1 truncate">
                  {itineraryData.recommendations.accommodations[0].name}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5 line-clamp-2">
                  {itineraryData.recommendations.accommodations[0].reason || '鄰近核心交通節點，適合作為每日出發與返回之固定基地。'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 no-print w-full sm:w-auto">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    itineraryData.recommendations.accommodations[0].google_map_query ||
                      itineraryData.recommendations.accommodations[0].name
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold backdrop-blur-sm transition-all w-full sm:w-auto"
                >
                  <span>Google 地圖導航</span>
                  <span>↗</span>
                </a>
              </div>
            </section>
          )}

          {/* 手機專用視圖切換器 (< 768px) */}
          <div className="md:hidden flex items-center justify-center bg-slate-200/80 p-1 rounded-xl gap-1 no-print">
            <button
              type="button"
              onClick={() => setMobileView('timeline')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                mobileView === 'timeline'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List size={14} />
              <span>時間軸</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileView('map')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                mobileView === 'map'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapIcon size={14} />
              <span>互動地圖</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileView('route')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                mobileView === 'route'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass size={14} />
              <span>路線簡圖</span>
            </button>
          </div>

          {/* 每日天數標籤 */}
          <DayTabs
            days={itineraryData.daily_itinerary || []}
            selectedDay={selectedDay}
            onSelectDay={handleSelectDay}
          />

          {/* 當日主題與摘要 */}
          {currentDayPlan && (
            <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">{currentDayPlan.date_label}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{currentDayPlan.summary}</p>
                </div>

                {/* 平板與桌面端地圖切換 */}
                <div className="hidden md:flex items-center bg-slate-100 p-0.5 rounded-lg gap-1 shrink-0 no-print">
                  <button
                    type="button"
                    onClick={() => setDesktopMapMode('map')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                      desktopMapMode === 'map' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    🗺️ 地圖
                  </button>
                  <button
                    type="button"
                    onClick={() => setDesktopMapMode('route')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                      desktopMapMode === 'route' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    🧭 簡圖
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 核心雙欄佈局：平板 & 桌面端 (>= 768px) 左右並排；手機端 (< 768px) 依切換器展示 */}
          <div className="grid md:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)] gap-5 items-start min-w-0 max-w-full">
            {/* 左欄：時間軸活動卡片列表 */}
            <div className={`flex flex-col gap-2 min-w-0 max-w-full overflow-hidden ${mobileView !== 'timeline' ? 'hidden md:flex' : 'flex'}`}>
              <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 px-1 mb-1">
                <span>💡 可長按左側握把拖曳排序</span>
                <span>點擊卡片定位地圖</span>
              </div>

              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId={`day-${selectedDay}`}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="flex flex-col gap-2.5 min-h-[300px] min-w-0 max-w-full overflow-hidden"
                    >
                      {currentDayPlan?.activities.map((activity: any, index: number) => (
                        <ActivityCard
                          key={activity.id}
                          activity={activity}
                          index={index}
                          isActive={activeActivityId === activity.id}
                          onSelect={(id) => selectActivity(id, true)}
                        />
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>

            {/* 右欄：互動地圖或動線簡圖 (平板與桌面端黏性置頂；手機端視圖選中時展開) */}
            <aside className={`md:sticky md:top-4 no-print ${
              mobileView === 'timeline' ? 'hidden md:block' : 'block'
            }`}>
              {/* 地圖模式 */}
              {(desktopMapMode === 'map' || mobileView === 'map') && (
                <div className={`${mobileView === 'route' && 'hidden md:block'} rounded-2xl border border-slate-200 bg-white p-2 sm:p-2.5 shadow-sm space-y-2`}>
                  <div className="flex justify-between items-center px-1.5 py-0.5">
                    <span className="text-xs font-bold text-slate-800">📍 Day {selectedDay} 景點地理分佈</span>
                    <span className="text-[10px] text-slate-400">點擊標記平移</span>
                  </div>

                  <InteractiveMap
                    activities={mapActivities}
                    activeActivityId={activeActivityId}
                    onActivitySelect={(id) => selectActivity(id, false)}
                    className="h-[320px] sm:h-[400px] md:h-[440px] w-full"
                  />

                  {/* 當前選中景點的即時摘要卡片 */}
                  {selectedActivityData && (
                    <div className="p-2.5 rounded-xl bg-sky-50/80 border border-sky-200 text-xs flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-brand-primary">{selectedActivityData.time_slot}</span>
                        <p className="font-bold text-slate-800 truncate">{selectedActivityData.location_name}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileView('timeline');
                          window.requestAnimationFrame(() => {
                            try {
                              const escaped = safeEscapeId(selectedActivityData.id);
                              document.querySelector(`[data-activity-id="${escaped}"]`)
                                ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            } catch (e) {}
                          });
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white border border-sky-300 text-brand-primary font-bold text-[11px] hover:bg-sky-100 shrink-0"
                      >
                        回到卡片 ➔
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 動線簡圖模式 */}
              {(desktopMapMode === 'route' || mobileView === 'route') && (
                <div className={`${mobileView === 'map' && 'hidden md:block'} rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-sm space-y-3`}>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-800">🧭 Day {selectedDay} 順序動線導航</span>
                    <span className="text-[10px] text-slate-400">{currentDayPlan?.activities.length || 0} 個行程點</span>
                  </div>

                  <div className="space-y-2 relative pl-3 border-l-2 border-brand-primary/40 ml-2">
                    {currentDayPlan?.activities.map((act: any, idx: number) => {
                      const isSelected = activeActivityId === act.id;
                      return (
                        <div
                          key={act.id}
                          onClick={() => selectActivity(act.id, false)}
                          className={`p-2.5 rounded-xl cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-brand-primary/15 border border-brand-primary/60 font-bold'
                              : 'bg-slate-50 hover:bg-slate-100 border border-slate-200/60'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-brand-primary font-bold">{act.time_slot}</span>
                            <span className="text-[10px] text-slate-400">Step {idx + 1}</span>
                          </div>
                          <p className="text-xs font-bold text-slate-800 mt-0.5 truncate">{act.location_name}</p>
                          {act.transit_to_next?.instructions && (
                            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 truncate">
                              <span className="shrink-0">🚇</span>
                              <span className="truncate">{act.transit_to_next.instructions}</span>
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      ) : currentTab === 'packing' ? (
        <PackingListTab
          destination={itineraryData.meta.destination}
          totalDays={itineraryData.meta.total_days}
          startDate={itineraryData.meta.start_date}
        />
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

      {/* 行程分享彈窗 */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        itineraryId={itineraryId}
        shareToken={shareToken}
        tripTitle={itineraryData.meta.trip_title}
        destination={itineraryData.meta.destination}
      />

      {/* A4 完整列印專屬手冊視圖 (平時隱藏，@media print 時自動展開全行程) */}
      <PdfPrintView itinerary={itineraryData} />
    </main>
  );
}