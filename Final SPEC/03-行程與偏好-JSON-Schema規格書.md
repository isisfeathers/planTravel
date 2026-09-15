# 03 行程與偏好 JSON Schema 規格書 (Data Contract & Type Definitions)

* **專案代號**：Project Atrip
* **版本**：v2.0.0
* **目的**：定義前端、後端、n8n 與 LLM 結構化輸出（Structured Output）共用的唯一資料交換契約。

---

## 1. TypeScript 領域模型與型別定義 (TypeScript Definitions)

```typescript
// ==============================================================================
// 1. 基礎列舉與 Value Objects
// ==============================================================================

export type ItineraryStatus = 'draft' | 'generating' | 'completed' | 'failed';

export type ItineraryJobStatus = 
  | 'queued' 
  | 'searching_flight' 
  | 'generating_itinerary' 
  | 'validating' 
  | 'completed' 
  | 'failed';

export type PaceLevel = 'relaxed' | 'moderate' | 'packed';
export type BudgetLevel = 'budget' | 'standard' | 'luxury';
export type AccommodationStrategy = 'single_hotel' | 'switch_hotel';
export type TransitMode = 'public_transit' | 'self_drive';

export type ActivityCategory = 
  | 'sightseeing'
  | 'dining'
  | 'shopping'
  | 'transit'
  | 'relaxation'
  | 'accommodation_checkin'
  | 'sports_event';

export type TransitType = 'subway' | 'bus' | 'walking' | 'taxi' | 'train' | 'driving';

export interface Coordinates {
  lat: number;
  lng: number;
}

// ==============================================================================
// 2. 偏好快照模型 (Preference Snapshot)
// ==============================================================================

export interface PreferenceSnapshot {
  destination: string;
  total_days: number;
  start_date?: string; // YYYY-MM-DD
  end_date?: string;   // YYYY-MM-DD
  pace: PaceLevel;
  budget_level: BudgetLevel;
  accommodation_strategy: AccommodationStrategy;
  transit_mode: TransitMode;
  interests: string[]; // 對應 prompt_templates.option_key
  event_note?: string; // 賽事、演場會等時間錨點備註
  selected_bundle?: string; // 套用之一鍵套版 ID
}

// ==============================================================================
// 3. 行程主資料結構 (Itinerary Payload)
// ==============================================================================

export interface TransitStep {
  mode: TransitType;
  duration_minutes: number;
  route_name: string;   // 例如: "東京地鐵銀座線"
  instructions: string; // 例如: "澀谷方面，A3 出口步行 3 分"
}

export interface ActivityItem {
  id: string; // 唯一 UUID，供前端 @hello-pangea/dnd 作為拖曳鍵值
  time_slot: string; // 例如: "09:30 - 11:30"
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
  date_label: string; // 例如: "Day 1 - 抵達東京與下町漫遊"
  summary: string;
  activities: ActivityItem[];
}

export interface TransitRecommendation {
  from_zone: string;
  to_zone: string;
  suggested_pass: string; // 例如: "Tokyo Subway 72-Hour Ticket"
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
  packing_list: PackingItem[]; // 智能行李打包建議清單
}

// ==============================================================================
// 4. 機票資料結構 (Flight Acquisition Payload)
// ==============================================================================

export interface FlightSegment {
  airline_code: string;
  airline_name: string;
  flight_number: string;
  aircraft?: string;
  departure: {
    airport_code: string;
    airport_name: string;
    time: string; // ISO 8601
  };
  arrival: {
    airport_code: string;
    airport_name: string;
    time: string; // ISO 8601
  };
  duration_minutes: number;
}

export interface FlightOfferItem {
  id: string;
  provider: string; // 例如: "Amadeus" 或 "Skyscanner"
  outbound: {
    departure_time: string;
    arrival_time: string;
    duration: string;
    stops: number;
    segments: FlightSegment[];
  };
  inbound?: {
    departure_time: string;
    arrival_time: string;
    duration: string;
    stops: number;
    segments: FlightSegment[];
  };
  price_total_twd: number;
  baggage_included: string; // 例如: "包含 1 件 23kg 托運行李"
  deep_link_url: string;    // 授權跳轉結帳 Deep Link
  checked_at: string;       // 查詢時間戳記
  expires_at: string;       // 報價快取失效時間
}

// ==============================================================================
// 5. 資料庫實體對應型別 (Database Entity Types)
// ==============================================================================

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
  flight_data: FlightOfferItem[];
  error_message: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ItineraryJobEntity {
  id: string;
  itinerary_id: string;
  user_id: string;
  status: ItineraryJobStatus;
  attempt: number;
  idempotency_key: string;
  error_code: string | null;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}
```

---

## 2. LLM 結構化輸出強制 JSON Schema (OpenAI response_format)

此 Schema 用於呼叫 OpenAI API `response_format: { type: "json_schema", json_schema: ... }`，確保產出之 JSON 格式 100% 嚴格合規：

```json
{
  "name": "atrip_itinerary_schema",
  "strict": true,
  "schema": {
    "type": "object",
    "required": [
      "meta",
      "daily_itinerary",
      "transit_overview",
      "recommendations",
      "packing_list"
    ],
    "additionalProperties": false,
    "properties": {
      "meta": {
        "type": "object",
        "required": ["trip_title", "destination", "total_days", "currency", "budget_level", "pace"],
        "additionalProperties": false,
        "properties": {
          "trip_title": { "type": "string" },
          "destination": { "type": "string" },
          "total_days": { "type": "integer" },
          "currency": { "type": "string" },
          "budget_level": { "type": "string", "enum": ["budget", "standard", "luxury"] },
          "pace": { "type": "string", "enum": ["relaxed", "moderate", "packed"] }
        }
      },
      "daily_itinerary": {
        "type": "array",
        "items": {
          "type": "object",
          "required": ["day_number", "date_label", "summary", "activities"],
          "additionalProperties": false,
          "properties": {
            "day_number": { "type": "integer" },
            "date_label": { "type": "string" },
            "summary": { "type": "string" },
            "activities": {
              "type": "array",
              "items": {
                "type": "object",
                "required": [
                  "id",
                  "time_slot",
                  "location_name",
                  "category",
                  "duration_minutes",
                  "description",
                  "coordinates",
                  "cost_estimate",
                  "tips",
                  "transit_to_next"
                ],
                "additionalProperties": false,
                "properties": {
                  "id": { "type": "string" },
                  "time_slot": { "type": "string" },
                  "location_name": { "type": "string" },
                  "category": {
                    "type": "string",
                    "enum": [
                      "sightseeing",
                      "dining",
                      "shopping",
                      "transit",
                      "relaxation",
                      "accommodation_checkin",
                      "sports_event"
                    ]
                  },
                  "duration_minutes": { "type": "integer" },
                  "description": { "type": "string" },
                  "coordinates": {
                    "type": "object",
                    "required": ["lat", "lng"],
                    "additionalProperties": false,
                    "properties": {
                      "lat": { "type": "number" },
                      "lng": { "type": "number" }
                    }
                  },
                  "cost_estimate": { "type": "number" },
                  "tips": { "type": "string" },
                  "transit_to_next": {
                    "type": "object",
                    "required": ["mode", "duration_minutes", "route_name", "instructions"],
                    "additionalProperties": false,
                    "properties": {
                      "mode": {
                        "type": "string",
                        "enum": ["subway", "bus", "walking", "taxi", "train", "driving"]
                      },
                      "duration_minutes": { "type": "integer" },
                      "route_name": { "type": "string" },
                      "instructions": { "type": "string" }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "transit_overview": {
        "type": "array",
        "items": {
          "type": "object",
          "required": ["from_zone", "to_zone", "suggested_pass", "estimated_cost", "notes"],
          "additionalProperties": false,
          "properties": {
            "from_zone": { "type": "string" },
            "to_zone": { "type": "string" },
            "suggested_pass": { "type": "string" },
            "estimated_cost": { "type": "number" },
            "notes": { "type": "string" }
          }
        }
      },
      "recommendations": {
        "type": "object",
        "required": ["dining", "accommodations"],
        "additionalProperties": false,
        "properties": {
          "dining": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["name", "type", "rating", "approx_cost", "address", "reason", "google_map_query"],
              "additionalProperties": false,
              "properties": {
                "name": { "type": "string" },
                "type": { "type": "string" },
                "rating": { "type": "number" },
                "approx_cost": { "type": "string" },
                "address": { "type": "string" },
                "reason": { "type": "string" },
                "google_map_query": { "type": "string" }
              }
            }
          },
          "accommodations": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["name", "type", "rating", "approx_cost", "address", "reason", "google_map_query"],
              "additionalProperties": false,
              "properties": {
                "name": { "type": "string" },
                "type": { "type": "string" },
                "rating": { "type": "number" },
                "approx_cost": { "type": "string" },
                "address": { "type": "string" },
                "reason": { "type": "string" },
                "google_map_query": { "type": "string" }
              }
            }
          }
        }
      },
      "packing_list": {
        "type": "array",
        "items": {
          "type": "object",
          "required": ["id", "category", "item_name", "is_checked", "notes"],
          "additionalProperties": false,
          "properties": {
            "id": { "type": "string" },
            "category": { "type": "string", "enum": ["essentials", "clothing", "electronics", "toiletries"] },
            "item_name": { "type": "string" },
            "is_checked": { "type": "boolean" },
            "notes": { "type": "string" }
          }
        }
      }
    }
  }
}
```
