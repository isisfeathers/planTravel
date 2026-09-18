export type ItineraryStatus = 'draft' | 'generating' | 'completed' | 'failed';
export type PaceLevel = 'relaxed' | 'moderate' | 'packed';
export type BudgetLevel = 'budget' | 'standard' | 'luxury';
export type AccommodationStrategy = 'single_hotel' | 'switch_hotel';
export type TransitMode = 'public_transit' | 'self_drive';

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
  itinerary_data: Record<string, any>;
  flight_data: any[];
  error_message: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}