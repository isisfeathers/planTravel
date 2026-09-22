const CITY_MAP: Record<string, { code: string; name: string; tsaCode?: string; tsaName?: string; airline: string; code2: string; price: number; hours: number }> = {
  '東京': { code: 'NRT', name: '東京成田 (NRT)', tsaCode: 'HND', tsaName: '東京羽田 (HND)', airline: '星宇航空 STARLUX', code2: 'JX800', price: 13500, hours: 3.5 },
  '大阪': { code: 'KIX', name: '大阪關西 (KIX)', airline: '長榮航空 EVA Air', code2: 'BR132', price: 12800, hours: 2.8 },
  '京都': { code: 'KIX', name: '大阪關西 (KIX)', airline: '長榮航空 EVA Air', code2: 'BR178', price: 12800, hours: 2.8 },
  '沖繩': { code: 'OKA', name: '沖繩那霸 (OKA)', airline: '中華航空 China Airlines', code2: 'CI120', price: 8900, hours: 1.5 },
  '首爾': { code: 'ICN', name: '首爾仁川 (ICN)', tsaCode: 'GMP', tsaName: '首爾金浦 (GMP)', airline: '大韓航空 Korean Air', code2: 'KE186', price: 10500, hours: 2.5 },
  '曼谷': { code: 'BKK', name: '曼谷素萬那普 (BKK)', airline: '泰國航空 Thai Airways', code2: 'TG633', price: 11200, hours: 3.8 },
  '巴黎': { code: 'CDG', name: '巴黎戴高樂 (CDG)', airline: '長榮航空 EVA Air 直飛', code2: 'BR087', price: 32800, hours: 14.5 },
  '倫敦': { code: 'LHR', name: '倫敦希斯洛 (LHR)', airline: '長榮航空 EVA Air', code2: 'BR067', price: 34500, hours: 15.0 },
  '冰島': { code: 'KEF', name: '冰島凱夫拉維克 (KEF)', airline: '冰島航空 Icelandair', code2: 'FI543', price: 38900, hours: 18.0 },
};

export function getFallbackFlights(destName: string, originCode: string, depDate: string, retDate: string) {
  const match = Object.entries(CITY_MAP).find(([k]) => destName.includes(k))?.[1] || {
    code: 'NRT', name: `${destName}國際機場`, airline: '優質國際航空', code2: 'IT101', price: 15000, hours: 4.0
  };
  const targetCode = (originCode === 'TSA' && match.tsaCode) ? match.tsaCode : match.code;
  const targetName = (originCode === 'TSA' && match.tsaName) ? match.tsaName : match.name;
  const originName = originCode === 'TPE' ? '台北桃園 (TPE)' : originCode === 'TSA' ? '台北松山 (TSA)' : '高雄小港 (KHH)';

  return [
    {
      id: `fl-best-${originCode}`,
      provider: 'Atrip 機票優選',
      tag: '🔥 評分最高 · 最佳時段',
      price_total_twd: match.price,
      baggage_included: '含托運行李 23kg × 1 件 + 手提 7kg',
      deep_link_url: `https://www.google.com/travel/flights?q=flights%20from%20${originCode}%20to%20${targetCode}%20on%20${depDate}%20through%20${retDate}`,
      outbound: {
        departure_time: `${depDate} 08:30`,
        arrival_time: `${depDate} 12:45`,
        duration: `${match.hours} 小時 直飛`,
        stops: 0,
        segments: [{
          airline_code: match.code2.slice(0, 2),
          airline_name: match.airline,
          flight_number: match.code2,
          departure: { airport_code: originCode, airport_name: originName, time: `${depDate} 08:30` },
          arrival: { airport_code: targetCode, airport_name: targetName, time: `${depDate} 12:45` },
          duration_minutes: match.hours * 60,
        }],
      },
      inbound: {
        departure_time: `${retDate} 17:15`,
        arrival_time: `${retDate} 20:30`,
        duration: `${match.hours} 小時 直飛`,
        stops: 0,
        segments: [{
          airline_code: match.code2.slice(0, 2),
          airline_name: match.airline,
          flight_number: match.code2,
          departure: { airport_code: targetCode, airport_name: targetName, time: `${retDate} 17:15` },
          arrival: { airport_code: originCode, airport_name: originName, time: `${retDate} 20:30` },
          duration_minutes: match.hours * 60,
        }],
      },
    },
    {
      id: `fl-budget-${originCode}`,
      provider: 'Atrip 機票優選',
      tag: '💰 超值推薦 · 經濟首選',
      price_total_twd: Math.round(match.price * 0.78),
      baggage_included: '含隨身手提 7kg（可加購托運）',
      deep_link_url: `https://www.google.com/travel/flights?q=flights%20from%20${originCode}%20to%20${targetCode}%20on%20${depDate}%20through%20${retDate}`,
      outbound: {
        departure_time: `${depDate} 06:40`,
        arrival_time: `${depDate} 10:55`,
        duration: `${match.hours} 小時 直飛`,
        stops: 0,
        segments: [{
          airline_code: 'IT',
          airline_name: '台灣虎航 Tigerair',
          flight_number: 'IT200',
          departure: { airport_code: originCode, airport_name: originName, time: `${depDate} 06:40` },
          arrival: { airport_code: targetCode, airport_name: targetName, time: `${depDate} 10:55` },
          duration_minutes: match.hours * 60,
        }],
      },
      inbound: {
        departure_time: `${retDate} 11:45`,
        arrival_time: `${retDate} 14:50`,
        duration: `${match.hours} 小時 直飛`,
        stops: 0,
        segments: [{
          airline_code: 'IT',
          airline_name: '台灣虎航 Tigerair',
          flight_number: 'IT201',
          departure: { airport_code: targetCode, airport_name: targetName, time: `${retDate} 11:45` },
          arrival: { airport_code: originCode, airport_name: originName, time: `${retDate} 14:50` },
          duration_minutes: match.hours * 60,
        }],
      },
    },
  ];
}
