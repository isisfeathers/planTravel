import { create } from 'zustand';
import { supabase } from '@/lib/supabaseClient';
import { ItineraryPayload, ActivityItem, PackingItem } from '@/types/itinerary';

interface ItineraryState {
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
  togglePackingItem: (id: string) => void;
  addPackingItem: (category: PackingItem['category'], itemName: string, notes?: string) => void;
  deletePackingItem: (id: string) => void;
}

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
function recalculateDayTimeSlots(activities: ActivityItem[], dayNumber: number = 1): ActivityItem[] {
  if (!activities || activities.length === 0) return [];

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

let debounceTimer: NodeJS.Timeout | null = null;

export const useItineraryStore = create<ItineraryState>((set, get) => ({
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

  // 時間軸 DnD 拖曳與 800ms 防抖
  reorderActivities: (dayIndex, startIndex, endIndex) => {
    const { itineraryData, itineraryId, version } = get();
    if (!itineraryData || !itineraryId) return;

    const updatedDaily = [...(itineraryData.daily_itinerary || [])];
    const targetDay = updatedDaily[dayIndex];
    if (!targetDay) return;

    const reorderedList = Array.from(targetDay.activities) as ActivityItem[];
    const [movedItem] = reorderedList.splice(startIndex, 1);
    reorderedList.splice(endIndex, 0, movedItem);

    const dayNumber = targetDay.day_number || dayIndex + 1;
    // 重新推算時間軸與交通指引
    const timeCalculatedActivities = recalculateDayTimeSlots(reorderedList, dayNumber);

    updatedDaily[dayIndex] = { ...targetDay, activities: timeCalculatedActivities };
    const newItineraryData: ItineraryPayload = { ...itineraryData, daily_itinerary: updatedDaily };

    set({ itineraryData: newItineraryData, saveStatusText: '編輯中...' });

    if (debounceTimer) clearTimeout(debounceTimer);

    debounceTimer = setTimeout(async () => {
      const currentVersion = get().version;
      const dataToSave = get().itineraryData;
      const targetId = get().itineraryId;

      if (!dataToSave || !targetId) return;

      set({ isSaving: true, saveStatusText: '自動儲存中...' });

      try {
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

        if (error || !data || data.length === 0) {
          throw new Error('409 Conflict: 版本衝突，已被其他裝置修改。');
        }

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

  // 行李清單打包勾選
  togglePackingItem: (id) => {
    const { itineraryData, itineraryId } = get();
    if (!itineraryData) return;

    const currentList = itineraryData.packing_list || [];
    const updatedList = currentList.map((item) =>
      item.id === id ? { ...item, is_checked: !item.is_checked } : item
    );

    const newItineraryData = { ...itineraryData, packing_list: updatedList };
    set({ itineraryData: newItineraryData, saveStatusText: '儲存中...' });

    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      if (!itineraryId) return;
      set({ isSaving: true });
      try {
        await supabase
          .from('itineraries')
          .update({
            itinerary_data: get().itineraryData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', itineraryId);
        set({ isSaving: false, saveStatusText: '所有變更已儲存' });
      } catch (e) {
        set({ isSaving: false, saveStatusText: '儲存失敗' });
      }
    }, 500);
  },

  addPackingItem: (category, itemName, notes) => {
    const { itineraryData, itineraryId } = get();
    if (!itineraryData || !itemName.trim()) return;

    const newItem: PackingItem = {
      id: `pack-custom-${Date.now()}`,
      category,
      item_name: itemName.trim(),
      is_checked: false,
      notes: notes || '自訂項目',
    };

    const newItineraryData = {
      ...itineraryData,
      packing_list: [...(itineraryData.packing_list || []), newItem],
    };
    set({ itineraryData: newItineraryData, saveStatusText: '儲存中...' });

    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      if (!itineraryId) return;
      set({ isSaving: true });
      try {
        await supabase
          .from('itineraries')
          .update({
            itinerary_data: get().itineraryData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', itineraryId);
        set({ isSaving: false, saveStatusText: '所有變更已儲存' });
      } catch (e) {
        set({ isSaving: false, saveStatusText: '儲存失敗' });
      }
    }, 500);
  },

  deletePackingItem: (id) => {
    const { itineraryData, itineraryId } = get();
    if (!itineraryData) return;

    const newItineraryData = {
      ...itineraryData,
      packing_list: (itineraryData.packing_list || []).filter((i) => i.id !== id),
    };
    set({ itineraryData: newItineraryData, saveStatusText: '儲存中...' });

    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      if (!itineraryId) return;
      set({ isSaving: true });
      try {
        await supabase
          .from('itineraries')
          .update({
            itinerary_data: get().itineraryData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', itineraryId);
        set({ isSaving: false, saveStatusText: '所有變更已儲存' });
      } catch (e) {
        set({ isSaving: false, saveStatusText: '儲存失敗' });
      }
    }, 500);
  },
}));