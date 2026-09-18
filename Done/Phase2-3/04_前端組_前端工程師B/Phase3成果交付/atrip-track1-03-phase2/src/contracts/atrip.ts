export type ItineraryStatus =
  | "draft"
  | "generating"
  | "completed"
  | "failed";

export type PaceLevel = "relaxed" | "moderate" | "packed";
export type BudgetLevel = "budget" | "standard" | "luxury";
export type AccommodationStrategy = "single_hotel" | "switch_hotel";
export type TransitMode = "public_transit" | "self_drive";

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

export interface CreateItineraryPayload {
  title: string;
  destination: string;
  status: "generating";
  preference_snapshot: PreferenceSnapshot;
}

export interface CreatedItinerary {
  id: string;
  share_token: string;
}
