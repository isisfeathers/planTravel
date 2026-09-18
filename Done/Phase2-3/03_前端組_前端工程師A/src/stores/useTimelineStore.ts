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
    const updatedDailyItinerary = [...itineraryData.daily_itinerary];
    const targetDay = updatedDailyItinerary[dayIndex];
    if (!targetDay) return;

    const updatedActivities = Array.from(targetDay.activities);
    const [movedItem] = updatedActivities.splice(startIndex, 1);
    updatedActivities.splice(endIndex, 0, movedItem);

    updatedDailyItinerary[dayIndex] = {
      ...targetDay,
      activities: updatedActivities,
    };

    const newItineraryData: ItineraryPayload = {
      ...itineraryData,
      daily_itinerary: updatedDailyItinerary,
    };

    // 2. 樂觀更新：UI 立即反映新順序
    set({
      itineraryData: newItineraryData,
      saveStatusText: '編輯中...',
    });

    // 3. 800ms 防抖儲存機制
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
        // 4. 呼叫 Supabase PATCH，嚴格帶入樂觀鎖 version 檢核
        const { data, error } = await supabase
          .from('itineraries')
          .update({
            itinerary_data: dataToSave,
            version: currentVersion + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', targetId)
          .eq('version', currentVersion)
          .select('version');

        if (error) {
          throw error;
        }

        // 若回傳為空表示版本號不符合，發生併發衝突
        if (!data || data.length === 0) {
          throw new Error('409 Conflict: 偵測到版本衝突，此行程已被其他裝置修改，請重新整理頁面。');
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