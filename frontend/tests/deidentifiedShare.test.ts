import { describe, expect, it } from 'vitest';

import { toDeidentifiedItinerary, type PublicItineraryRow } from '../src/lib/deidentifiedShare';

const source = {
  id: 'source-id',
  share_token: 'share-token',
  title: '東京行程',
  destination: '東京',
  status: 'completed',
  user_id: 'private-user-id',
  display_name: '不應出現的作者',
  avatar_url: 'https://example.invalid/avatar.png',
  preference_snapshot: { destination: '東京', budget_level: 'luxury' },
  itinerary_data: {
    meta: { trip_title: '東京行程', destination: '東京', total_days: 1, currency: 'TWD', budget_level: 'luxury', pace: 'relaxed' },
    daily_itinerary: [{
      day_number: 1,
      date_label: 'Day 1',
      summary: '散策',
      activities: [{
        id: 'activity-1',
        time_slot: '10:00',
        location_name: '淺草',
        category: 'sightseeing',
        duration_minutes: 60,
        description: '散步',
        coordinates: { lat: 35.7, lng: 139.7 },
        cost_estimate: 500,
      }],
    }],
    transit_overview: [],
    recommendations: { dining: [], accommodations: [] },
    packing_list: [],
  },
  flight_data: [],
} as unknown as PublicItineraryRow;

describe('toDeidentifiedItinerary', () => {
  it('removes author and budget fields from the public view model', () => {
    const publicItinerary = toDeidentifiedItinerary(source);
    const serialized = JSON.stringify(publicItinerary);

    expect(publicItinerary).not.toHaveProperty('user_id');
    expect(publicItinerary).not.toHaveProperty('display_name');
    expect(publicItinerary).not.toHaveProperty('avatar_url');
    expect(serialized).not.toContain('private-user-id');
    expect(serialized).not.toContain('不應出現的作者');
    expect(serialized).not.toContain('luxury');
    expect(serialized).not.toContain('500');
    expect(publicItinerary.itinerary_data.daily_itinerary?.[0]?.activities?.[0]).not.toHaveProperty('cost_estimate');
  });
});
