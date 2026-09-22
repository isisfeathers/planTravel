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
  updateTripDates: (newStartDate: string) => Promise<void>;
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

// 核心演算法：行程重排後重新推算當日活動的時間區間與交通銜接（重置回當日 AI 推薦出發時間）
function recalculateDayTimeSlots(activities: ActivityItem[], dayNumber: number = 1, hotelName?: string): ActivityItem[] {
  if (!activities || activities.length === 0) return [];

  // 當日行程基準起始時間：
  // Day 1 預設配合抵達班機與 Check-in 為 13:00 (780 分鐘) 或 10:00 (600 分鐘)
  // Day 2 起固定重置為 AI 推薦的黃金出發時間 09:30 (570 分鐘)
  let currentStartMinutes = dayNumber === 1 ? 780 : 570;

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

    const dayNumber = targetDay.day_number || dayIndex + 1;
    const hotelName = itineraryData.recommendations?.accommodations?.[0]?.name;
    // 2. 重新動態推算時間軸順序與時間區間 (time_slot)，自動重置為當日標準出發時間
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

    // 2. 根據新月份智慧調整季節打包建議
    const month = baseDate.getMonth() + 1; // 1 ~ 12
    let seasonalNote = '舒適排汗衣物與防滑好走健步鞋';
    if ([12, 1, 2].includes(month)) {
      seasonalNote = '冬季保暖防風厚外套、發熱衣褲與手套毛帽';
    } else if ([6, 7, 8].includes(month)) {
      seasonalNote = '夏季透氣排汗短袖、遮陽帽與高係數防曬乳';
    } else {
      seasonalNote = '春秋多層次洋蔥式穿搭與防風防雨薄外套';
    }

    const updatedPackingList = (itineraryData.packing_list || []).map((item) => {
      if (item.category === 'clothing') {
        return {
          ...item,
          notes: `${seasonalNote}（配合 ${month} 月出遊氣候）`,
        };
      }
      return item;
    });

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

    // 4. 即時寫入 Supabase 資料庫
    try {
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