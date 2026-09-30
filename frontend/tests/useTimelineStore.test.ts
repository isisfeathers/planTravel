import { beforeEach, describe, expect, it } from 'vitest';

import { usePackingListStore } from '@/stores/usePackingListStore';
import { useTimelineStore } from '@/stores/useTimelineStore';

const itinerary = {
  meta: {
    destination: '東京',
    total_days: 2,
    start_date: '2026-10-17',
    end_date: '2026-10-18',
  },
  daily_itinerary: [
    { day_number: 1, date_label: 'Day 1 · 抵達東京', summary: '抵達東京', activities: [] },
    { day_number: 2, date_label: 'Day 2 · 城市散步', summary: '城市散步', activities: [] },
  ],
  packing_list: [],
};

beforeEach(() => {
  useTimelineStore.getState().initialize('demo', itinerary, 1);
  usePackingListStore.getState().initialize('demo', []);
});

describe('useTimelineStore.updateTripDates', () => {
  it('同步更新跨年份行程日期、星期與季節行李', async () => {
    await useTimelineStore.getState().updateTripDates('2027-01-15');

    const timeline = useTimelineStore.getState();
    const packing = usePackingListStore.getState();

    expect(timeline.itineraryData?.meta.start_date).toBe('2027-01-15');
    expect(timeline.itineraryData?.meta.end_date).toBe('2027-01-16');
    expect(timeline.itineraryData?.daily_itinerary?.[0].date_label).toContain('2027-01-15 (週五)');
    expect(timeline.itineraryData?.daily_itinerary?.[1].date_label).toContain('2027-01-16 (週六)');
    expect(timeline.itineraryData?.packing_list).toEqual(packing.items);
    expect(packing.items.some((item) => item.item_name.includes('保暖'))).toBe(true);
    expect(timeline.saveStatusText).toBe('所有變更已儲存');
    expect(timeline.saveError).toBeNull();
  });
});
