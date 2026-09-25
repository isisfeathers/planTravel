import { create } from 'zustand';
import { supabase } from '@/lib/supabaseClient';
import { ItineraryPayload, ActivityItem } from '@/types/itinerary';
import { generateDynamicPackingList } from '@/lib/packingListGenerator';
import { usePackingListStore } from '@/stores/usePackingListStore';

interface TimelineState {
  itineraryId: string | null;
  itineraryData: ItineraryPayload | null;
  version: number;
  selectedDay: number;
  isSaving: boolean;
  saveError: string | null;
  saveStatusText: string;

  // Actions
  initialize: (id: string, initialData: ItineraryPayload, initialVersion: number) => void;
  setSelectedDay: (day: number) => void;
  reorderActivities: (dayIndex: number, startIndex: number, endIndex: number) => void;
  updateTripDates: (newStartDate: string) => Promise<void>;
}

// 800ms 防抖計時器參照
let debounceTimer: NodeJS.Timeout | null = null;

// 輔助函式：時間字串轉分鐘數 (例 "09:30" 或 "09:30 - 11:00" -> 570)
function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 570;
  const match = timeStr.match(/(\d{1,2}):(\d{2})/);
  if (!match) return 570;
  return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
}

// 輔助函式：分鐘數轉時間字串 (例 570 -> "09:30")
function formatMinutesToTime(totalMinutes: number): string {
  const normalized = Math.max(0, totalMinutes);
  const h = Math.floor(normalized / 60) % 24;
  const m = normalized % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// 核心演算法：行程重排後重新推算當日活動的時間區間與交通銜接
function recalculateDayTimeSlots(
  activities: ActivityItem[],
  dayNumber: number = 1,
  hotelName?: string
): ActivityItem[] {
  if (!activities || activities.length === 0) return [];

  // 1. 取得當日行程基準出發時間（若原本已有起始時間則保留，否則 Day 1 預設 13:00 / 10:00，Day 2+ 預設 09:30）
  let baseStart = dayNumber === 1 ? 780 : 570;
  const firstSlot = activities[0]?.time_slot;
  if (firstSlot) {
    const parsed = parseTimeToMinutes(firstSlot);
    if (parsed >= 360 && parsed <= 1260) {
      baseStart = parsed;
    }
  }

  let currentStartMinutes = baseStart;

  return activities.map((act, idx) => {
    const duration = Math.max(Number(act.duration_minutes) || 90, 30);
    const endMinutes = currentStartMinutes + duration;
    const newTimeSlot = `${formatMinutesToTime(currentStartMinutes)} - ${formatMinutesToTime(endMinutes)}`;

    const transitDuration = Math.max(Number(act.transit_to_next?.duration_minutes) || 20, 10);
    currentStartMinutes = endMinutes + transitDuration;

    const nextAct = activities[idx + 1];
    let updatedTransit = act.transit_to_next;

    if (nextAct) {
      updatedTransit = {
        mode: act.transit_to_next?.mode || 'subway',
        duration_minutes: transitDuration,
        route_name: act.transit_to_next?.route_name || '市區大眾捷運',
        instructions: `前往 ${nextAct.location_name}`
      };
    } else {
      const returnTarget = hotelName || '推薦住宿飯店';
      updatedTransit = {
        mode: 'subway',
        duration_minutes: 25,
        route_name: `返回 ${returnTarget}`,
        instructions: `結束本日行程，搭乘大眾運輸返回「${returnTarget}」休息放鬆`
      };
    }

    return {
      ...act,
      time_slot: newTimeSlot,
      transit_to_next: updatedTransit
    };
  });
}

function applyDatesToItinerary(itinerary: ItineraryPayload, customStartDate?: string): ItineraryPayload {
  if (!itinerary) return itinerary;

  let baseDate: Date;
  if (customStartDate) {
    baseDate = new Date(customStartDate);
  } else if (itinerary.meta?.start_date) {
    baseDate = new Date(itinerary.meta.start_date);
  } else {
    // 預設為 2 週後的星期六出發
    const now = new Date();
    const target = new Date(now.getTime() + 14 * 24 * 3600 * 1000);
    const dayOfWeek = target.getDay();
    const daysToSaturday = (6 - dayOfWeek + 7) % 7;
    target.setDate(target.getDate() + daysToSaturday);
    baseDate = target;
  }

  if (isNaN(baseDate.getTime())) {
    baseDate = new Date();
  }

  const startStr = baseDate.toISOString().slice(0, 10);
  const totalDays = Number(itinerary.meta?.total_days || itinerary.daily_itinerary?.length || 1);
  const endObj = new Date(baseDate.getTime() + (totalDays - 1) * 24 * 3600 * 1000);
  const endStr = endObj.toISOString().slice(0, 10);

  const updatedDailyItinerary = (itinerary.daily_itinerary || []).map((day, dIdx) => {
    const dNum = day.day_number || dIdx + 1;
    const thisDay = new Date(baseDate.getTime() + (dNum - 1) * 24 * 3600 * 1000);
    const yyyymmdd = thisDay.toISOString().slice(0, 10);
    const dayOfWeek = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'][thisDay.getDay()];
    const cleanLabel = (day.date_label || '').replace(/^(第\s*\d+\s*天|\d{4}-\d{2}-\d{2}[^·]*)\s*·?\s*/, '');

    return {
      ...day,
      date_label: `${yyyymmdd} (${dayOfWeek}) · Day ${dNum} · ${cleanLabel || day.summary || '深度探索'}`,
    };
  });

  return {
    ...itinerary,
    meta: {
      ...itinerary.meta,
      start_date: startStr,
      end_date: endStr,
      total_days: totalDays,
    },
    daily_itinerary: updatedDailyItinerary,
  };
}

export const useTimelineStore = create<TimelineState>((set, get) => ({
  itineraryId: null,
  itineraryData: null,
  version: 1,
  selectedDay: 1,
  isSaving: false,
  saveError: null,
  saveStatusText: '所有變更已儲存',

  initialize: (id, initialData, initialVersion) => {
    const formattedData = applyDatesToItinerary(initialData);
    set({
      itineraryId: id,
      itineraryData: formattedData,
      version: initialVersion,
      selectedDay: 1,
      saveError: null,
      saveStatusText: '所有變更已儲存',
    });
  },

  setSelectedDay: (day) => set({ selectedDay: day }),

  reorderActivities: (dayIndex, startIndex, endIndex) => {
    const { itineraryData, itineraryId, version } = get();
    if (!itineraryData || !itineraryId) return;

    // 1. 純陣列重排演算法
    const updatedDailyItinerary = JSON.parse(JSON.stringify(itineraryData.daily_itinerary || []));
    const targetDay = updatedDailyItinerary[dayIndex];
    if (!targetDay || !Array.isArray(targetDay.activities)) return;

    const reorderedList = Array.from(targetDay.activities) as ActivityItem[];
    const [movedItem] = reorderedList.splice(startIndex, 1);
    reorderedList.splice(endIndex, 0, movedItem);

    const dayNumber = targetDay.day_number || dayIndex + 1;
    const hotelName = itineraryData.recommendations?.accommodations?.[0]?.name;
    // 2. 重新動態推算時間軸順序與時間區間 (time_slot)，自動依序排定
    const timeCalculatedActivities = recalculateDayTimeSlots(reorderedList, dayNumber, hotelName);

    updatedDailyItinerary[dayIndex] = {
      ...targetDay,
      activities: timeCalculatedActivities,
    };

    const newItineraryData: ItineraryPayload = {
      ...itineraryData,
      daily_itinerary: updatedDailyItinerary,
    };

    // 3. 樂觀更新：UI 立即反映新順序與新時間
    set({
      itineraryData: newItineraryData,
      saveStatusText: '編輯中...',
    });

    // 4. 800ms 防抖儲存機制
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(async () => {
      const currentVersion = get().version;
      const dataToSave = get().itineraryData;
      const targetId = get().itineraryId;

      if (!dataToSave || !targetId) return;

      set({ isSaving: true, saveStatusText: '自動儲存中...' });

      try {
        // 呼叫 Supabase 更新
        const { error } = await supabase
          .from('itineraries')
          .update({
            itinerary_data: dataToSave,
            version: currentVersion + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', targetId);

        if (error) {
          throw error;
        }

        // 儲存成功：版本號自增 1
        set({
          version: currentVersion + 1,
          isSaving: false,
          saveError: null,
          saveStatusText: '所有變更已儲存',
        });
      } catch (err: any) {
        set({
          isSaving: false,
          saveError: err.message || '儲存失敗',
          saveStatusText: '儲存失敗，請重試',
        });
      }
    }, 800);
  },

  updateTripDates: async (newStartDate: string) => {
    const { itineraryData, itineraryId, version } = get();
    if (!itineraryData || !itineraryId) return;

    const baseDate = new Date(newStartDate);
    if (isNaN(baseDate.getTime())) return;

    const totalDays = Number(itineraryData.meta?.total_days || itineraryData.daily_itinerary?.length || 1);
    const endObj = new Date(baseDate.getTime() + (totalDays - 1) * 24 * 3600 * 1000);
    const newEndDate = endObj.toISOString().slice(0, 10);

    // 1. 動態重算每日行程標籤 (日期 + 星期)
    const updatedDailyItinerary = (itineraryData.daily_itinerary || []).map((day, dIdx) => {
      const dNum = day.day_number || dIdx + 1;
      const thisDay = new Date(baseDate.getTime() + (dNum - 1) * 24 * 3600 * 1000);
      const yyyymmdd = thisDay.toISOString().slice(0, 10);
      const dayOfWeek = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'][thisDay.getDay()];
      const cleanLabel = (day.date_label || '').replace(/^(第\s*\d+\s*天|\d{4}-\d{2}-\d{2}[^·]*)\s*·?\s*/, '');

      return {
        ...day,
        date_label: `${yyyymmdd} (${dayOfWeek}) · Day ${dNum} · ${cleanLabel || day.summary || '深度探索'}`,
      };
    });

    // 2. 根據新目的地、新月份與天數智慧更新打包清單
    const updatedPackingList = generateDynamicPackingList(
      itineraryData.meta.destination || '旅遊目的地',
      totalDays,
      newStartDate
    );

    // 同步更新 PackingListStore
    usePackingListStore.getState().initialize(itineraryId, updatedPackingList);

    const newItineraryData: ItineraryPayload = {
      ...itineraryData,
      meta: {
        ...itineraryData.meta,
        start_date: newStartDate,
        end_date: newEndDate,
      },
      daily_itinerary: updatedDailyItinerary,
      packing_list: updatedPackingList,
    };

    // 3. 立即更新 UI 狀態
    set({
      itineraryData: newItineraryData,
      isSaving: true,
      saveStatusText: '正在更新所有日期與航班聯動...',
    });

    // 4. 即時寫入 Supabase 資料庫 (若是 mock-id 或 mock 模式則安全更新本地狀態)
    try {
      const isMock = !itineraryId || itineraryId === 'mock-itinerary-id' || itineraryId.startsWith('mock-');
      if (!isMock) {
        const { error: updateErr } = await supabase
          .from('itineraries')
          .update({
            itinerary_data: newItineraryData,
            preference_snapshot: {
              destination: newItineraryData.meta.destination,
              total_days: totalDays,
              start_date: newStartDate,
              end_date: newEndDate,
            },
            version: version + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', itineraryId);

        if (updateErr) throw updateErr;
      }

      set({
        version: version + 1,
        isSaving: false,
        saveError: null,
        saveStatusText: '新出發日期已全數同步！',
      });
    } catch (e: any) {
      set({
        isSaving: false,
        saveError: e.message || '更新日期失敗',
        saveStatusText: '日期更新失敗，請重試',
      });
    }
  },
}));