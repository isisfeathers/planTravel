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
import { getDestinationCoverImage } from '@/lib/destinationImages';
import { ArrowLeft, Backpack, Calendar, Compass, List, Map as MapIcon, Plane, Plus, Share2 } from 'lucide-react';
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
          .select('itinerary_data, version, share_token, destination, title, preference_snapshot')
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

        if (data?.destination || data?.title) {
          const pref = (data.preference_snapshot as any) || {};
          payload = {
            ...payload,
            meta: {
              ...payload.meta,
              destination: data.destination || pref.destination || payload.meta.destination,
              trip_title: data.title || `${data.destination || pref.destination} ${pref.total_days || payload.meta.total_days} 天行程`,
              total_days: pref.total_days || payload.meta.total_days,
              start_date: pref.start_date || payload.meta.start_date,
              end_date: pref.end_date || payload.meta.end_date,
            },
          };
          if (data.share_token) setShareToken(data.share_token);
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

  const coverImage = useMemo(
    () => getDestinationCoverImage(itineraryData?.meta?.destination, itineraryId),
    [itineraryData?.meta?.destination, itineraryId],
  );

  if (!itineraryData) {
    return (
      <div className="min-h-screen bg-atrip-surface-page p-atrip-gutter">
        <div className="mx-auto max-w-5xl animate-pulse space-y-atrip-4 pt-atrip-4 motion-reduce:animate-none" aria-hidden="true">
          <div className="h-11 w-40 rounded-atrip-full bg-atrip-surface-subtle" />
          <div className="h-64 rounded-atrip-xl bg-atrip-surface-subtle" />
          <div className="h-14 rounded-atrip-lg bg-atrip-surface-subtle" />
          <div className="h-72 rounded-atrip-xl bg-atrip-surface-subtle" />
        </div>
        <p className="sr-only" role="status">正在載入行程畫布</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-atrip-surface-page pb-[calc(2rem+env(safe-area-inset-bottom))]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-atrip-5 px-atrip-gutter py-atrip-4 max-[359px]:px-atrip-gutter-narrow sm:py-atrip-6">
      {/* 頂部全域導航與功能按鈕 */}
      <header className="flex items-center justify-between gap-atrip-2 no-print">
        <div className="flex min-w-0 items-center gap-atrip-1">
          <Link
            href="/dashboard"
            className="atrip-icon-button border border-atrip-border-subtle bg-atrip-surface-card"
            aria-label="返回你的旅程"
          >
            <ArrowLeft size={20} aria-hidden="true" />
          </Link>
          <span className="truncate px-atrip-2 text-atrip-body font-semibold text-atrip-text-primary">行程畫布</span>
          <Link
            href="/wizard"
            className="atrip-icon-button bg-atrip-selection-background text-atrip-selection-foreground"
            aria-label="規劃新旅程"
          >
            <Plus size={20} aria-hidden="true" />
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-atrip-1">
          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="atrip-icon-button border border-atrip-border-subtle bg-atrip-surface-card"
            aria-label="分享行程"
          >
            <Share2 size={20} aria-hidden="true" />
          </button>
          <PdfExportButton itineraryId={itineraryId} />
        </div>
      </header>

      {/* 頂部標題與出發日期 */}
      <section className="relative min-h-64 overflow-hidden rounded-atrip-xl bg-atrip-brand-logo-trp sm:min-h-72">
        <img src={coverImage} alt={`${itineraryData.meta.destination}旅程封面`} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-atrip-brand-logo-trp via-atrip-brand-logo-trp/55 to-atrip-brand-logo-trp/10" />
        <div className="relative z-10 flex min-h-64 flex-col justify-between p-atrip-5 text-white sm:min-h-72 sm:p-atrip-6">
          <div className="flex items-start justify-between gap-atrip-3">
            <span className="rounded-atrip-full bg-atrip-action-primary px-atrip-3 py-atrip-1 text-atrip-caption font-semibold text-atrip-action-on-primary">
              {itineraryData.meta.total_days} 天自由行
            </span>
            <div className="flex items-center gap-atrip-2 rounded-atrip-full bg-atrip-brand-logo-trp/70 px-atrip-3 py-atrip-1 backdrop-blur-sm no-print">
          {isTimelineSaving && (
                <div className="atrip-loading-icon h-3.5 w-3.5 animate-spin rounded-full border-2 border-atrip-action-primary border-t-transparent" />
          )}
              <span className="text-atrip-caption text-white">{saveError ? '同步失敗' : saveStatusText} · v{version}</span>
            </div>
          </div>

          <div>
            <p className="text-atrip-caption font-semibold text-atrip-action-primary">📍 {itineraryData.meta.destination}</p>
            <h1 className="mt-atrip-1 text-2xl font-bold leading-9 sm:text-3xl" title={itineraryData.meta.trip_title}>{itineraryData.meta.trip_title}</h1>
            <div className="mt-atrip-3 flex flex-wrap items-center gap-atrip-2">
              <span className="inline-flex items-center gap-atrip-1 rounded-atrip-sm bg-atrip-surface-card px-atrip-2 py-atrip-1 text-atrip-caption font-semibold text-atrip-text-primary">
                <Calendar size={14} aria-hidden="true" />
                {itineraryData.meta.start_date && itineraryData.meta.end_date
                  ? `${itineraryData.meta.start_date} — ${itineraryData.meta.end_date}`
                  : '日期由 AI 協助安排'}
              </span>
              <button type="button" onClick={() => setIsDateModalOpen(true)} className="atrip-focus min-h-atrip-icon-button rounded-atrip-md border border-white/50 bg-atrip-brand-logo-trp/60 px-atrip-3 text-atrip-caption font-semibold text-white backdrop-blur-sm no-print">
                調整日期
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 主分頁切換：時間軸 vs 行李清單 vs 推薦航班 */}
      <nav className="grid grid-cols-3 gap-atrip-1 rounded-atrip-lg bg-atrip-surface-subtle p-atrip-1 no-print" aria-label="行程內容">
        <button
          type="button"
          onClick={() => setCurrentTab('timeline')}
          className={`atrip-canvas-tab ${
            currentTab === 'timeline'
              ? 'bg-atrip-surface-card text-atrip-text-primary shadow-atrip-soft'
              : 'text-atrip-text-secondary'
          }`}
        >
          <List size={18} aria-hidden="true" />
          <span>每日行程</span>
        </button>
        <button
          type="button"
          onClick={() => setCurrentTab('packing')}
          className={`atrip-canvas-tab ${
            currentTab === 'packing'
              ? 'bg-atrip-surface-card text-atrip-text-primary shadow-atrip-soft'
              : 'text-atrip-text-secondary'
          }`}
        >
          <Backpack size={18} aria-hidden="true" />
          <span>行李</span>
        </button>
        <button
          type="button"
          onClick={() => setCurrentTab('flights')}
          className={`atrip-canvas-tab ${
            currentTab === 'flights'
              ? 'bg-atrip-surface-card text-atrip-text-primary shadow-atrip-soft'
              : 'text-atrip-text-secondary'
          }`}
        >
          <Plane size={18} aria-hidden="true" />
          <span>機票</span>
        </button>
      </nav>

      {/* 分頁內容展示 */}
      {currentTab === 'timeline' ? (
        <div className="flex flex-col gap-4 sm:gap-5">
          {/* AI 精選住宿基地 (Basecamp) */}
          {itineraryData.recommendations?.accommodations?.[0] && (
            <section className="flex flex-col items-start justify-between gap-atrip-3 rounded-atrip-xl bg-atrip-brand-logo-trp p-atrip-4 text-white sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="rounded-atrip-full bg-atrip-action-primary px-atrip-2 py-atrip-1 text-atrip-micro font-bold text-atrip-action-on-primary">
                    🏨 推薦住宿基地 (Basecamp)
                  </span>
                  <span className="text-atrip-caption font-semibold text-atrip-action-primary">
                    ★ {itineraryData.recommendations.accommodations[0].rating || 4.6}
                  </span>
                  <span className="text-atrip-caption text-white">
                    · {itineraryData.recommendations.accommodations[0].type || '優選飯店'}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-white mt-1 truncate">
                  {itineraryData.recommendations.accommodations[0].name}
                </h3>
                <p className="mt-atrip-1 line-clamp-2 text-atrip-caption text-white">
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
                  className="atrip-focus inline-flex min-h-11 w-full items-center justify-center gap-atrip-1 rounded-atrip-full border border-white/50 bg-atrip-brand-logo-trp px-atrip-3 text-atrip-caption font-semibold text-white sm:w-auto"
                >
                  <span>Google 地圖導航</span>
                  <span>↗</span>
                </a>
              </div>
            </section>
          )}

          {/* 手機專用視圖切換器 (< 768px) */}
          <div className="flex items-center justify-center gap-atrip-1 rounded-atrip-lg bg-atrip-surface-subtle p-atrip-1 md:hidden no-print">
            <button
              type="button"
              onClick={() => setMobileView('timeline')}
              className={`atrip-canvas-tab ${
                mobileView === 'timeline'
                  ? 'bg-atrip-surface-card text-atrip-text-primary shadow-atrip-soft'
                  : 'text-atrip-text-secondary'
              }`}
            >
              <List size={14} />
              <span>時間軸</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileView('map')}
              className={`atrip-canvas-tab ${
                mobileView === 'map'
                  ? 'bg-atrip-surface-card text-atrip-text-primary shadow-atrip-soft'
                  : 'text-atrip-text-secondary'
              }`}
            >
              <MapIcon size={14} />
              <span>互動地圖</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileView('route')}
              className={`atrip-canvas-tab ${
                mobileView === 'route'
                  ? 'bg-atrip-surface-card text-atrip-text-primary shadow-atrip-soft'
                  : 'text-atrip-text-secondary'
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
            <div className="rounded-atrip-lg border border-atrip-border-subtle bg-atrip-surface-card p-atrip-4 shadow-atrip-soft">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="text-atrip-body font-bold text-atrip-text-primary">{currentDayPlan.date_label}</h3>
                  <p className="mt-atrip-1 text-atrip-caption text-atrip-text-secondary">{currentDayPlan.summary}</p>
                </div>

                {/* 平板與桌面端地圖切換 */}
                <div className="hidden shrink-0 items-center gap-atrip-1 rounded-atrip-md bg-atrip-surface-subtle p-atrip-1 md:flex no-print">
                  <button
                    type="button"
                    onClick={() => setDesktopMapMode('map')}
                    className={`atrip-canvas-tab ${
                      desktopMapMode === 'map' ? 'bg-atrip-surface-card text-atrip-text-primary shadow-atrip-soft' : 'text-atrip-text-secondary'
                    }`}
                  >
                    🗺️ 地圖
                  </button>
                  <button
                    type="button"
                    onClick={() => setDesktopMapMode('route')}
                    className={`atrip-canvas-tab ${
                      desktopMapMode === 'route' ? 'bg-atrip-surface-card text-atrip-text-primary shadow-atrip-soft' : 'text-atrip-text-secondary'
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
              <div className="mb-atrip-1 flex items-center justify-between px-atrip-1 text-atrip-micro font-medium text-atrip-text-secondary">
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
                <div className={`${mobileView === 'route' && 'hidden md:block'} space-y-atrip-2 rounded-atrip-xl border border-atrip-border-subtle bg-atrip-surface-card p-atrip-2 shadow-atrip-soft`}>
                  <div className="flex justify-between items-center px-1.5 py-0.5">
                    <span className="text-atrip-caption font-bold text-atrip-text-primary">📍 Day {selectedDay} 景點地理分佈</span>
                    <span className="text-atrip-micro text-atrip-text-secondary">點擊標記平移</span>
                  </div>

                  <InteractiveMap
                    activities={mapActivities}
                    activeActivityId={activeActivityId}
                    onActivitySelect={(id) => selectActivity(id, false)}
                    className="h-[320px] sm:h-[400px] md:h-[440px] w-full"
                  />

                  {/* 當前選中景點的即時摘要卡片 */}
                  {selectedActivityData && (
                    <div className="flex items-center justify-between gap-atrip-2 rounded-atrip-lg bg-atrip-selection-background p-atrip-3 text-atrip-caption">
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-atrip-selection-foreground">{selectedActivityData.time_slot}</span>
                        <p className="truncate font-bold text-atrip-text-primary">{selectedActivityData.location_name}</p>
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
                        className="atrip-compact-secondary min-h-atrip-icon-button shrink-0 rounded-atrip-md"
                      >
                        回到卡片 ➔
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 動線簡圖模式 */}
              {(desktopMapMode === 'route' || mobileView === 'route') && (
                <div className={`${mobileView === 'map' && 'hidden md:block'} space-y-atrip-3 rounded-atrip-xl border border-atrip-border-subtle bg-atrip-surface-card p-atrip-4 shadow-atrip-soft`}>
                  <div className="flex items-center justify-between border-b border-atrip-border-subtle pb-atrip-2">
                    <span className="text-atrip-caption font-bold text-atrip-text-primary">🧭 Day {selectedDay} 順序動線導航</span>
                    <span className="text-atrip-micro text-atrip-text-secondary">{currentDayPlan?.activities.length || 0} 個行程點</span>
                  </div>

                  <div className="relative ml-atrip-2 space-y-atrip-2 border-l-2 border-atrip-action-primary pl-atrip-3">
                    {currentDayPlan?.activities.map((act: any, idx: number) => {
                      const isSelected = activeActivityId === act.id;
                      return (
                        <div
                          key={act.id}
                          onClick={() => selectActivity(act.id, false)}
                          className={`p-2.5 rounded-xl cursor-pointer transition-all ${
                            isSelected
                              ? 'border border-atrip-selection-foreground bg-atrip-selection-background font-bold'
                              : 'border border-atrip-border-subtle bg-atrip-surface-subtle'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-atrip-brand-logo-ai">{act.time_slot}</span>
                            <span className="text-atrip-micro text-atrip-text-secondary">Step {idx + 1}</span>
                          </div>
                          <p className="mt-0.5 truncate text-atrip-caption font-bold text-atrip-text-primary">{act.location_name}</p>
                          {act.transit_to_next?.instructions && (
                            <p className="mt-atrip-1 flex items-center gap-atrip-1 truncate text-atrip-caption text-atrip-text-secondary">
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
      </div>
    </main>
  );
}
