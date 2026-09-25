import * as crypto from 'crypto';
import { FlightOfferItem } from '../types/flight';

export class ScoringService {
  /**
   * 正規化去重演算法：
   * 鍵值算法：MD5(outbound_airline_code + outbound_flight_no + departure_time + arrival_time)
   * 規則：若有多個重複航班，優先保留價格最便宜、包含免費托運行李者
   */
  public static deduplicate(flights: FlightOfferItem[]): FlightOfferItem[] {
    const flightMap = new Map<string, FlightOfferItem>();

    for (const flight of flights) {
      const segment = flight.outbound.segments[0];
      if (!segment) continue;

      const airline = segment.airline_code;
      const flightNo = segment.flight_number;
      const depTime = flight.outbound.departure_time;
      const arrTime = flight.outbound.arrival_time;

      const inSegment = flight.inbound?.segments?.[0];
      const inFlightNo = inSegment?.flight_number || '';
      const inDepTime = flight.inbound?.departure_time || '';
      const inArrTime = flight.inbound?.arrival_time || '';

      // 生成 MD5 去重唯一主鍵（同時考量去程與回程航班）
      const rawKey = `${airline}_${flightNo}_${depTime}_${arrTime}_${inFlightNo}_${inDepTime}_${inArrTime}`;
      const hashKey = crypto.createHash('md5').update(rawKey).digest('hex');

      const existing = flightMap.get(hashKey);
      if (!existing) {
        flightMap.set(hashKey, flight);
      } else {
        // 重複航班之抉擇逻辑：
        const existingHasBaggage = !existing.baggage_included.includes('無');
        const currentHasBaggage = !flight.baggage_included.includes('無');

        if (flight.price_total_twd < existing.price_total_twd) {
          flightMap.set(hashKey, flight);
        } else if (flight.price_total_twd === existing.price_total_twd) {
          if (currentHasBaggage && !existingHasBaggage) {
            flightMap.set(hashKey, flight);
          }
        }
      }
    }

    return Array.from(flightMap.values());
  }

  /**
   * 航班加權評分與推薦排序演算法
   * Score = 100 - (PriceNorm * 40) - (DurationNorm * 35) - (Stops * 15) + (BaggageBonus * 10)
   */
  public static scoreFlights(flights: FlightOfferItem[]): FlightOfferItem[] {
    if (flights.length === 0) return [];

    // 1. 取得價格的極值
    const prices = flights.map(f => f.price_total_twd);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // 2. 取得航程總耗時（去程＋回程，以分鐘計）的極值
    const getFlightTotalDuration = (flight: FlightOfferItem): number => {
      const outboundDuration = flight.outbound.segments.reduce((acc, seg) => acc + seg.duration_minutes, 0);
      const inboundDuration = flight.inbound?.segments.reduce((acc, seg) => acc + seg.duration_minutes, 0) || 0;
      return outboundDuration + inboundDuration;
    };

    const durations = flights.map(getFlightTotalDuration);
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);

    // 3. 計算每一組航班的綜合分數
    const scoredFlights = flights.map(flight => {
      const price = flight.price_total_twd;
      const duration = getFlightTotalDuration(flight);
      const stops = flight.outbound.stops + (flight.inbound?.stops || 0);
      const hasBaggage = !flight.baggage_included.includes('無');

      // 正規化價格 (PriceNorm) 與 航程時間 (DurationNorm)，預防分母為零之邊界
      const priceNorm = maxPrice === minPrice ? 0 : (price - minPrice) / (maxPrice - minPrice);
      const durationNorm = maxDuration === minDuration ? 0 : (duration - minDuration) / (maxDuration - minDuration);

      // 加權比重運算
      const pricePenalty = priceNorm * 40;
      const durationPenalty = durationNorm * 35;
      const stopsPenalty = stops * 15;
      const baggageBonus = hasBaggage ? 10 : 0;

      const rawScore = 100 - pricePenalty - durationPenalty - stopsPenalty + baggageBonus;
      // 限制分數邊界在 0 到 100 分之間
      const finalScore = Math.max(0, Math.min(100, rawScore));

      return {
        flight,
        score: finalScore,
      };
    });

    // 4. 依評分由高到低（100 -> 0）進行排序，回傳最高前 5 名
    return scoredFlights
      .sort((a, b) => b.score - a.score)
      .map(item => item.flight);
  }
}
