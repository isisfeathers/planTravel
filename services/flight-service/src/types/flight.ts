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
  provider: string; // 例如: "Apify-GoogleFlights"
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

export interface SearchParams {
  origin: string;       // 出發地機場代碼，如 TPE
  destination: string;  // 目的地機場代碼，如 HND
  departureDate: string; // 出發日期，YYYY-MM-DD
  returnDate?: string;   // 回程日期，YYYY-MM-DD
  adults: number;       // 人數
  cabin: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST'; // 艙等
}
