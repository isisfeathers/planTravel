import { create } from 'zustand';
import { supabase } from '@/lib/supabaseClient';
import { ItineraryPayload, ActivityItem } from '@/types/itinerary';

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
}

// 800ms 防抖計時器參照
let debounceTimer: NodeJS.Timeout | null = null;

// 輔助函式：時間字串轉分鐘數 (例 "09:30" -> 570)
function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 570;
  const parts = timeStr.split(':').map(Number);
  return (parts[0] || 9) * 60 + (parts[1] || 0);
}

// 輔助函式：分鐘數轉時間字串 (例 570 -> "09:30")
function formatMinutesToTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// 核心演算法：行程重排後重新推算當日活動的時間區間與交通銜接
function recalculateDayTimeSlots(activities: ActivityItem[]): ActivityItem[] {
  if (!activities || activities.length === 0) return [];

  // 抓取當天最早的第一個活動起始時間（若無預設 09:30）
  let currentStartMinutes = 570; // 09:30
  const firstSlot = activities[0]?.time_slot;
  if (firstSlot && firstSlot.includes('-')) {
    const rawStart = firstSlot.split('-')[0].trim();
    if (/^\d{1,2}:\d{2}$/.test(rawStart)) {
      currentStartMinutes = parseTimeToMinutes(rawStart);
    }
  }

  return activities.map((act, idx) => {
    const duration = Number(act.duration_minutes) || 90;
    const endMinutes = currentStartMinutes + duration;
    const newTimeSlot = `${formatMinutesToTime(currentStartMinutes)} - ${formatMinutesToTime(endMinutes)}`;

    const transitDuration = Number(act.transit_to_next?.duration_minutes) || 20;
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
      updatedTransit = {
        mode: 'subway',
        duration_minutes: 30,
        route_name: '返回飯店',
        instructions: '結束本日行程，返回飯店休息'
      };
    }

    return {
      ...act,
      time_slot: newTimeSlot,
      transit_to_next: updatedTransit
    };
  });
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
    set({
      itineraryId: id,
      itineraryData: initialData,
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
    const updatedDailyItinerary = [...(itineraryData.daily_itinerary || [])];
    const targetDay = updatedDailyItinerary[dayIndex];
    if (!targetDay) return;

    const reorderedList = Array.from(targetDay.activities) as ActivityItem[];
    const [movedItem] = reorderedList.splice(startIndex, 1);
    reorderedList.splice(endIndex, 0, movedItem);

    // 2. 重新動態推算時間軸順序與時間區間 (time_slot)
    const timeCalculatedActivities = recalculateDayTimeSlots(reorderedList);

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
}));