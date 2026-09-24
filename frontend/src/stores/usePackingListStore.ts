import { create } from 'zustand';
import { supabase } from '@/lib/supabaseClient';
import { PackingItem, ItineraryPayload } from '@/types/itinerary';
import { generateDynamicPackingList } from '@/lib/packingListGenerator';

interface PackingListState {
  itineraryId: string | null;
  items: PackingItem[];
  isSaving: boolean;
  saveStatusText: string;

  // Actions
  initialize: (itineraryId: string, initialItems: PackingItem[]) => void;
  toggleItem: (id: string) => void;
  addItem: (category: PackingItem['category'], itemName: string, notes?: string) => void;
  deleteItem: (id: string) => void;
  regenerateForDestination: (destination: string, totalDays: number, startDate?: string) => void;
}

let packingDebounceTimer: NodeJS.Timeout | null = null;

export const usePackingListStore = create<PackingListState>((set, get) => ({
  itineraryId: null,
  items: [],
  isSaving: false,
  saveStatusText: '所有變更已儲存',

  initialize: (itineraryId, initialItems) => {
    set({
      itineraryId,
      items: initialItems || [],
      saveStatusText: '所有變更已儲存',
    });
  },

  regenerateForDestination: (destination, totalDays, startDate) => {
    const { itineraryId } = get();
    const newItems = generateDynamicPackingList(destination, totalDays, startDate);
    set({ items: newItems, saveStatusText: '已更新為目的地專屬清單' });

    if (packingDebounceTimer) clearTimeout(packingDebounceTimer);
    packingDebounceTimer = setTimeout(async () => {
      if (!itineraryId || itineraryId === 'mock-itinerary-id' || itineraryId.startsWith('mock-')) return;
      set({ isSaving: true });
      try {
        const { data: currentData } = await supabase
          .from('itineraries')
          .select('itinerary_data')
          .eq('id', itineraryId)
          .maybeSingle();

        const currentPayload = (currentData?.itinerary_data || {}) as ItineraryPayload;
        await supabase
          .from('itineraries')
          .update({
            itinerary_data: { ...currentPayload, packing_list: newItems },
            updated_at: new Date().toISOString(),
          })
          .eq('id', itineraryId);

        set({ isSaving: false, saveStatusText: '所有變更已儲存' });
      } catch (e) {
        set({ isSaving: false, saveStatusText: '儲存失敗' });
      }
    }, 500);
  },

  toggleItem: (id) => {
    const { items, itineraryId } = get();
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, is_checked: !item.is_checked } : item
    );

    // 樂觀更新：立即變更打勾與刪除線
    set({ items: updatedItems, saveStatusText: '儲存中...' });

    // 防抖 500ms 寫回 Supabase
    if (packingDebounceTimer) clearTimeout(packingDebounceTimer);

    packingDebounceTimer = setTimeout(async () => {
      if (!itineraryId || itineraryId === 'mock-itinerary-id' || itineraryId.startsWith('mock-')) return;
      set({ isSaving: true });

      try {
        // 先讀取當前完整 itinerary_data，再整包替換 packing_list
        const { data: currentData, error: fetchError } = await supabase
          .from('itineraries')
          .select('itinerary_data')
          .eq('id', itineraryId)
          .maybeSingle();

        if (fetchError) throw fetchError;

        const currentPayload = (currentData?.itinerary_data || {}) as ItineraryPayload;
        const newPayload: ItineraryPayload = {
          ...currentPayload,
          packing_list: get().items,
        };

        const { error: updateError } = await supabase
          .from('itineraries')
          .update({
            itinerary_data: newPayload,
            updated_at: new Date().toISOString(),
          })
          .eq('id', itineraryId);

        if (updateError) throw updateError;

        set({ isSaving: false, saveStatusText: '所有變更已儲存' });
      } catch (err: any) {
        set({ isSaving: false, saveStatusText: '儲存失敗，請重試' });
      }
    }, 500);
  },

  addItem: (category, itemName, notes) => {
    if (!itemName.trim()) return;
    const { items, itineraryId } = get();
    const newItem: PackingItem = {
      id: `pack-custom-${Date.now()}`,
      category,
      item_name: itemName.trim(),
      is_checked: false,
      notes: notes || '自訂項目',
    };

    const updatedItems = [...items, newItem];
    set({ items: updatedItems, saveStatusText: '儲存中...' });

    if (packingDebounceTimer) clearTimeout(packingDebounceTimer);
    packingDebounceTimer = setTimeout(async () => {
      if (!itineraryId || itineraryId === 'mock-itinerary-id' || itineraryId.startsWith('mock-')) return;
      set({ isSaving: true });
      try {
        const { data: currentData } = await supabase
          .from('itineraries')
          .select('itinerary_data')
          .eq('id', itineraryId)
          .maybeSingle();

        const currentPayload = (currentData?.itinerary_data || {}) as ItineraryPayload;
        await supabase
          .from('itineraries')
          .update({
            itinerary_data: { ...currentPayload, packing_list: get().items },
            updated_at: new Date().toISOString(),
          })
          .eq('id', itineraryId);

        set({ isSaving: false, saveStatusText: '所有變更已儲存' });
      } catch (e) {
        set({ isSaving: false, saveStatusText: '儲存失敗' });
      }
    }, 500);
  },

  deleteItem: (id) => {
    const { items, itineraryId } = get();
    const updatedItems = items.filter((item) => item.id !== id);
    set({ items: updatedItems, saveStatusText: '儲存中...' });

    if (packingDebounceTimer) clearTimeout(packingDebounceTimer);
    packingDebounceTimer = setTimeout(async () => {
      if (!itineraryId || itineraryId === 'mock-itinerary-id' || itineraryId.startsWith('mock-')) return;
      set({ isSaving: true });
      try {
        const { data: currentData } = await supabase
          .from('itineraries')
          .select('itinerary_data')
          .eq('id', itineraryId)
          .maybeSingle();

        const currentPayload = (currentData?.itinerary_data || {}) as ItineraryPayload;
        await supabase
          .from('itineraries')
          .update({
            itinerary_data: { ...currentPayload, packing_list: get().items },
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