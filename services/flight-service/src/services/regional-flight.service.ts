import { FlightOfferItem, SearchParams, FlightSegment } from '../types/flight';

export type FlightRegion = 'EUROPE' | 'NORTH_AMERICA' | 'OCEANIA' | 'JAPAN_KOREA' | 'SOUTHEAST_ASIA' | 'MIDDLE_EAST' | 'OTHER';

interface FlightPreset {
  code: string;
  airline: string;
  flightNo: string;
  price: number;
  hours: number;
  stops: number;
  transitCode?: string;
  transitName?: string;
  baggage: string;
}

const REGION_MAP: Record<FlightRegion, FlightPreset[]> = {
  EUROPE: [
    { code: 'EK', airline: '阿聯酋航空 Emirates', flightNo: 'EK367', price: 32800, hours: 16.5, stops: 1, transitCode: 'DXB', transitName: '杜拜 (DXB)', baggage: '包含 1 件 23kg 托運 + 7kg 手提' },
    { code: 'SQ', airline: '新加坡航空 Singapore Airlines', flightNo: 'SQ877', price: 34500, hours: 17.5, stops: 1, transitCode: 'SIN', transitName: '新加坡樟宜 (SIN)', baggage: '包含 1 件 25kg 托運 + 7kg 手提' },
    { code: 'TK', airline: '土耳其航空 Turkish Airlines', flightNo: 'TK025', price: 29800, hours: 17.0, stops: 1, transitCode: 'IST', transitName: '伊斯坦堡 (IST)', baggage: '包含 1 件 23kg 托運 + 7kg 手提' },
  ],
  NORTH_AMERICA: [
    { code: 'JX', airline: '星宇航空 STARLUX Airlines', flightNo: 'JX002', price: 32500, hours: 11.5, stops: 0, baggage: '包含 2 件 23kg 托運 + 7kg 手提' },
    { code: 'BR', airline: '長榮航空 EVA Air', flightNo: 'BR012', price: 33800, hours: 11.5, stops: 0, baggage: '包含 2 件 23kg 托運 + 7kg 手提' },
  ],
  SOUTHEAST_ASIA: [
    { code: 'BR', airline: '長榮航空 EVA Air', flightNo: 'BR211', price: 11800, hours: 3.8, stops: 0, baggage: '包含 1 件 23kg 托運 + 7kg 手提' },
    { code: 'JX', airline: '星宇航空 STARLUX Airlines', flightNo: 'JX741', price: 12500, hours: 3.8, stops: 0, baggage: '包含 1 件 23kg 托運 + 7kg 手提' },
  ],
  OCEANIA: [
    { code: 'CI', airline: '中華航空 China Airlines', flightNo: 'CI051', price: 26800, hours: 9.5, stops: 0, baggage: '包含 1 件 23kg 托運 + 7kg 手提' },
  ],
  JAPAN_KOREA: [
    { code: 'CI', airline: '中華航空 China Airlines', flightNo: 'CI100', price: 13500, hours: 3.3, stops: 0, baggage: '包含 1 件 23kg 托運 + 7kg 手提' },
    { code: 'JX', airline: '星宇航空 STARLUX Airlines', flightNo: 'JX800', price: 15800, hours: 3.3, stops: 0, baggage: '包含 1 件 23kg 托運 + 7kg 手提' },
    { code: 'IT', airline: '台灣虎航 Tigerair', flightNo: 'IT200', price: 8500, hours: 3.2, stops: 0, baggage: '包含手提行李 7kg（可加購托運）' },
  ],
  MIDDLE_EAST: [
    { code: 'EK', airline: '阿聯酋航空 Emirates', flightNo: 'EK367', price: 31000, hours: 8.5, stops: 0, baggage: '包含 1 件 23kg 托運 + 7kg 手提' },
  ],
  OTHER: [
    { code: 'CI', airline: '中華航空 China Airlines', flightNo: 'CI008', price: 25800, hours: 8.0, stops: 0, baggage: '包含 1 件 23kg 托運 + 7kg 手提' },
  ],
};
export class RegionalFlightService {
  public static getRegion(airportCode: string): FlightRegion {
    const code = (airportCode || '').toUpperCase();
    if (['CPH', 'LHR', 'LGW', 'STN', 'CDG', 'ORY', 'FCO', 'MXP', 'VCE', 'FLR', 'AMS', 'FRA', 'MUC', 'BER', 'VIE', 'ZRH', 'GVA', 'KEF', 'PRG', 'BUD', 'ATH', 'BCN', 'MAD', 'HEL', 'ARN', 'OSL', 'IST'].includes(code)) {
      return 'EUROPE';
    }
    if (['JFK', 'EWR', 'LGA', 'LAX', 'SFO', 'SEA', 'ORD', 'BOS', 'YVR', 'YYZ'].includes(code)) return 'NORTH_AMERICA';
    if (['SYD', 'MEL', 'BNE', 'AKL', 'CHC'].includes(code)) return 'OCEANIA';
    if (['NRT', 'HND', 'KIX', 'ITM', 'OKA', 'FUK', 'CTS', 'NGO', 'KMJ', 'SDJ', 'HKD', 'OKJ', 'HIJ', 'TAK', 'ICN', 'GMP', 'PUS', 'CJU'].includes(code)) return 'JAPAN_KOREA';
    if (['BKK', 'DMK', 'CNX', 'SIN', 'KUL', 'DPS', 'DAD', 'SGN', 'HAN', 'HKG', 'MFM'].includes(code)) return 'SOUTHEAST_ASIA';
    if (['DXB', 'DOH', 'CAI', 'TAS'].includes(code)) return 'MIDDLE_EAST';
    return 'OTHER';
  }

  public static generateRegionalFlights(params: SearchParams, providerName: string = 'Apify-GoogleFlights'): FlightOfferItem[] {
    const checkedAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 20 * 60 * 1000).toISOString();
    const depDate = params.departureDate;
    const retDate = params.returnDate;
    const region = this.getRegion(params.destination);
    const presets = REGION_MAP[region] || REGION_MAP.OTHER;
    const googleDeepLink = `https://www.google.com/travel/flights?q=flights%20from%20${params.origin}%20to%20${params.destination}%20on%20${depDate}${retDate ? `%20returning%20${retDate}` : ''}`;

    return presets.map((p, idx) => {
      const durationHours = Math.floor(p.hours);
      const durationMins = Math.round((p.hours % 1) * 60);

      const outboundSegments: FlightSegment[] = p.stops > 0 && p.transitCode ? [
        {
          airline_code: p.code,
          airline_name: p.airline,
          flight_number: p.flightNo,
          departure: { airport_code: params.origin, airport_name: `${params.origin} Airport`, time: `${depDate}T21:40:00+08:00` },
          arrival: { airport_code: p.transitCode, airport_name: p.transitName || p.transitCode, time: `${depDate}T04:40:00+03:00` },
          duration_minutes: Math.round(p.hours * 35),
        },
        {
          airline_code: p.code,
          airline_name: p.airline,
          flight_number: `${p.code}${100 + idx * 50}`,
          departure: { airport_code: p.transitCode, airport_name: p.transitName || p.transitCode, time: `${depDate}T07:20:00+03:00` },
          arrival: { airport_code: params.destination, airport_name: `${params.destination} Airport`, time: `${depDate}T12:30:00+01:00` },
          duration_minutes: Math.round(p.hours * 25),
        }
      ] : [
        {
          airline_code: p.code,
          airline_name: p.airline,
          flight_number: p.flightNo,
          departure: { airport_code: params.origin, airport_name: `${params.origin} Airport`, time: `${depDate}T09:00:00+08:00` },
          arrival: { airport_code: params.destination, airport_name: `${params.destination} Airport`, time: `${depDate}T13:30:00+09:00` },
          duration_minutes: Math.round(p.hours * 60),
        }
      ];

      const inboundSegments: FlightSegment[] | undefined = retDate ? (p.stops > 0 && p.transitCode ? [
        {
          airline_code: p.code,
          airline_name: p.airline,
          flight_number: `${p.code}${101 + idx * 50}`,
          departure: { airport_code: params.destination, airport_name: `${params.destination} Airport`, time: `${retDate}T15:30:00+01:00` },
          arrival: { airport_code: p.transitCode, airport_name: p.transitName || p.transitCode, time: `${retDate}T23:45:00+04:00` },
          duration_minutes: Math.round(p.hours * 25),
        },
        {
          airline_code: p.code,
          airline_name: p.airline,
          flight_number: `${p.code}366`,
          departure: { airport_code: p.transitCode, airport_name: p.transitName || p.transitCode, time: `${retDate}T03:40:00+04:00` },
          arrival: { airport_code: params.origin, airport_name: `${params.origin} Airport`, time: `${retDate}T16:15:00+08:00` },
          duration_minutes: Math.round(p.hours * 35),
        }
      ] : [
        {
          airline_code: p.code,
          airline_name: p.airline,
          flight_number: `${p.flightNo.slice(0, 2)}${parseInt(p.flightNo.slice(2) || '100', 10) + 1}`,
          departure: { airport_code: params.destination, airport_name: `${params.destination} Airport`, time: `${retDate}T15:00:00+09:00` },
          arrival: { airport_code: params.origin, airport_name: `${params.origin} Airport`, time: `${retDate}T18:30:00+08:00` },
          duration_minutes: Math.round(p.hours * 60),
        }
      ]) : undefined;

      return {
        id: `flight-mock-${p.code.toLowerCase()}-${params.origin}-${params.destination}-${idx + 1}`,
        provider: providerName,
        outbound: {
          departure_time: outboundSegments[0].departure.time,
          arrival_time: outboundSegments[outboundSegments.length - 1].arrival.time,
          duration: `${durationHours}h ${durationMins}m`,
          stops: p.stops,
          segments: outboundSegments,
        },
        inbound: inboundSegments ? {
          departure_time: inboundSegments[0].departure.time,
          arrival_time: inboundSegments[inboundSegments.length - 1].arrival.time,
          duration: `${durationHours}h ${durationMins}m`,
          stops: p.stops,
          segments: inboundSegments,
        } : undefined,
        price_total_twd: p.price,
        baggage_included: p.baggage,
        deep_link_url: googleDeepLink,
        checked_at: checkedAt,
        expires_at: expiresAt,
      };
    });
  }
}

