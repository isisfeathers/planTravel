export type ItineraryStatus = 'draft' | 'generating' | 'completed' | 'failed';
export type ItineraryJobStatus = 'queued' | 'searching_flight' | 'generating_itinerary' | 'validating' | 'completed' | 'failed';
export type PaceLevel = 'relaxed' | 'moderate' | 'packed';
export type BudgetLevel = 'budget' | 'standard' | 'luxury';
export type AccommodationStrategy = 'single_hotel' | 'switch_hotel';
export type TransitMode = 'public_transit' | 'self_drive';
export type ActivityCategory = 'sightseeing' | 'dining' | 'shopping' | 'transit' | 'relaxation' | 'accommodation_checkin' | 'sports_event';
export type TransitType = 'subway' | 'bus' | 'walking' | 'taxi' | 'train' | 'driving';

export interface Coordinates { lat: number; lng: number; }

export interface PreferenceSnapshot {
  destination: string;
  total_days: number;
  start_date?: string;
  end_date?: string;
  pace: PaceLevel;
  budget_level: BudgetLevel;
  accommodation_strategy: AccommodationStrategy;
  transit_mode: TransitMode;
  interests: string[];
  event_note?: string;
  selected_bundle?: string;
}

export interface TransitStep {
  mode: TransitType;
  duration_minutes: number;
  route_name: string;
  instructions: string;
}

export interface ActivityItem {
  id: string;
  time_slot: string;
  location_name: string;
  category: ActivityCategory;
  duration_minutes: number;
  description: string;
  coordinates: Coordinates;
  cost_estimate: number;
  tips?: string;
  transit_to_next?: TransitStep;
}

export interface DayPlan {
  day_number: number;
  date_label: string;
  summary: string;
  activities: ActivityItem[];
}

export interface TransitRecommendation {
  from_zone: string;
  to_zone: string;
  suggested_pass: string;
  estimated_cost: number;
  notes: string;
}

export interface PlaceRecommendation {
  name: string;
  type: string;
  rating: number;
  approx_cost: string;
  address: string;
  reason: string;
  google_map_query: string;
}

export interface PackingItem {
  id: string;
  category: 'essentials' | 'clothing' | 'electronics' | 'toiletries';
  item_name: string;
  is_checked: boolean;
  notes?: string;
}

export interface ItineraryPayload {
  meta: {
    trip_title: string;
    destination: string;
    total_days: number;
    currency: string;
    budget_level: BudgetLevel;
    pace: PaceLevel;
  };
  daily_itinerary: DayPlan[];
  transit_overview: TransitRecommendation[];
  recommendations: {
    dining: PlaceRecommendation[];
    accommodations: PlaceRecommendation[];
  };
  packing_list: PackingItem[];
}

export interface ProfileEntity {
  id: string;
  line_user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  active_itinerary_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ItineraryEntity {
  id: string;
  user_id: string;
  forked_from_id: string | null;
  share_token: string;
  title: string;
  destination: string;
  status: ItineraryStatus;
  is_archived: boolean;
  version: number;
  is_public: boolean;
  preference_snapshot: PreferenceSnapshot;
  itinerary_data: ItineraryPayload;
  flight_data: any[];
  error_message: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export * from './auth';
