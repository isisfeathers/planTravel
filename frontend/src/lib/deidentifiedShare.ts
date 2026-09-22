import type { ItineraryPayload } from '@/types/itinerary';

export interface PublicItineraryRow {
  id: string;
  share_token: string;
  title: string;
  destination: string;
  status: string;
  preference_snapshot: Record<string, unknown>;
  itinerary_data: ItineraryPayload;
  flight_data: unknown[];
}

export interface DeidentifiedItinerary {
  id: string;
  share_token: string;
  title: string;
  destination: string;
  status: string;
  itinerary_data: ItineraryPayload;
}

function withoutBudget<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => withoutBudget(item)) as T;
  }

  if (value && typeof value === 'object') {
    const output: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      if (
        key === 'budget_level' ||
        key === 'cost_estimate' ||
        key === 'estimated_cost' ||
        key === 'approx_cost' ||
        key === 'budget' ||
        key === 'price'
      ) {
        continue;
      }
      output[key] = withoutBudget(nested);
    }
    return output as T;
  }

  return value;
}

export function toDeidentifiedItinerary(row: PublicItineraryRow): DeidentifiedItinerary {
  return {
    id: row.id,
    share_token: row.share_token,
    title: row.title,
    destination: row.destination,
    status: row.status,
    itinerary_data: withoutBudget(row.itinerary_data),
  };
}
