import type { ItineraryPayload } from '@/types/itinerary';

export function applyAuthoritativePreferences(
  payload: ItineraryPayload,
  preferences?: Record<string, any>,
): ItineraryPayload {
  const pref = preferences || {};
  const startDate = pref.start_date || payload?.meta?.start_date;
  const totalDays = Number(
    pref.total_days || payload?.meta?.total_days || payload?.daily_itinerary?.length || 1,
  );
  let endDate = pref.end_date || payload?.meta?.end_date;

  if (startDate && !pref.end_date) {
    const start = new Date(`${startDate}T00:00:00`);
    if (!Number.isNaN(start.getTime())) {
      start.setDate(start.getDate() + Math.max(0, totalDays - 1));
      endDate = start.toISOString().slice(0, 10);
    }
  }

  return {
    ...payload,
    meta: {
      ...payload?.meta,
      destination: pref.destination || payload?.meta?.destination,
      total_days: totalDays,
      start_date: startDate,
      end_date: endDate,
    },
  };
}
