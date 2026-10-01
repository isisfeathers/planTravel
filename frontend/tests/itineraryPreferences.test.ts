import { describe, expect, it } from 'vitest';

import { applyAuthoritativePreferences } from '@/lib/itineraryPreferences';
import { useTimelineStore } from '@/stores/useTimelineStore';

describe('applyAuthoritativePreferences', () => {
  it('以用戶指定日期覆蓋生成內容的預設日期並同步每日日期', () => {
    const generated = {
      meta: {
        destination: '大阪',
        total_days: 3,
        start_date: '2026-10-17',
        end_date: '2026-10-19',
      },
      daily_itinerary: [
        { day_number: 1, date_label: '2026-10-17 · 抵達', summary: '抵達', activities: [] },
        { day_number: 2, date_label: '2026-10-18 · 探索', summary: '探索', activities: [] },
        { day_number: 3, date_label: '2026-10-19 · 回程', summary: '回程', activities: [] },
      ],
      packing_list: [],
    };

    const corrected = applyAuthoritativePreferences(generated, {
      destination: '大阪',
      total_days: 3,
      start_date: '2027-03-05',
      end_date: '2027-03-07',
    });

    useTimelineStore.getState().initialize('specified-date-trip', corrected, 1);
    const result = useTimelineStore.getState().itineraryData;

    expect(result?.meta.start_date).toBe('2027-03-05');
    expect(result?.meta.end_date).toBe('2027-03-07');
    expect(result?.daily_itinerary?.[0].date_label).toContain('2027-03-05 (週五)');
    expect(result?.daily_itinerary?.[2].date_label).toContain('2027-03-07 (週日)');
  });
});
