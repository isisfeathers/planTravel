function cleanDestinationName(dest: string): string {
  if (!dest) return '旅遊目的地';
  return dest
    .replace(/[0-9]+\s*天.*$/, '')
    .replace(/自由行.*$/, '')
    .replace(/深度遊.*$/, '')
    .replace(/之旅.*$/, '')
    .replace(/度假.*$/, '')
    .trim() || dest;
}

const CITY_MAP: Record<string, { code: string; name: string; tsaCode?: string; tsaName?: string; airline: string; code2: string; price: number; hours: number }> = {
  // 日本
  '東京': { code: 'NRT', name: '東京成田 (NRT)', tsaCode: 'HND', tsaName: '東京羽田 (HND)', airline: '星宇航空 STARLUX', code2: 'JX800', price: 13500, hours: 3.5 },
  '大阪': { code: 'KIX', name: '大阪關西 (KIX)', airline: '長榮航空 EVA Air', code2: 'BR132', price: 12800, hours: 2.8 },
  '京都': { code: 'KIX', name: '大阪關西 (KIX)', airline: '長榮航空 EVA Air', code2: 'BR178', price: 12800, hours: 2.8 },
  '沖繩': { code: 'OKA', name: '沖繩那霸 (OKA)', airline: '中華航空 China Airlines', code2: 'CI120', price: 8900, hours: 1.5 },
  '福岡': { code: 'FUK', name: '福岡國際機場 (FUK)', airline: '長榮航空 EVA Air', code2: 'BR106', price: 11500, hours: 2.2 },
  '札幌': { code: 'CTS', name: '札幌新千歲 (CTS)', airline: '星宇航空 STARLUX', code2: 'JX850', price: 16500, hours: 4.0 },
  '北海道': { code: 'CTS', name: '札幌新千歲 (CTS)', airline: '星宇航空 STARLUX', code2: 'JX850', price: 16500, hours: 4.0 },
  '名古屋': { code: 'NGO', name: '名古屋中部 (NGO)', airline: '中華航空 China Airlines', code2: 'CI154', price: 12200, hours: 2.8 },
  '熊本': { code: 'KMJ', name: '熊本國際機場 (KMJ)', airline: '星宇航空 STARLUX', code2: 'JX846', price: 11800, hours: 2.3 },
  '仙台': { code: 'SDJ', name: '仙台國際機場 (SDJ)', airline: '長榮航空 EVA Air', code2: 'BR118', price: 14500, hours: 3.3 },
  '函館': { code: 'HKD', name: '函館機場 (HKD)', airline: '星宇航空 STARLUX', code2: 'JX860', price: 15800, hours: 3.8 },
  '岡山': { code: 'OKJ', name: '岡山機場 (OKJ)', airline: '台灣虎航 Tigerair', code2: 'IT214', price: 9500, hours: 2.5 },
  '廣島': { code: 'HIJ', name: '廣島機場 (HIJ)', airline: '中華航空 China Airlines', code2: 'CI112', price: 12500, hours: 2.5 },
  '高松': { code: 'TAK', name: '高松機場 (TAK)', airline: '中華航空 China Airlines', code2: 'CI178', price: 11900, hours: 2.5 },

  // 韓國
  '首爾': { code: 'ICN', name: '首爾仁川 (ICN)', tsaCode: 'GMP', tsaName: '首爾金浦 (GMP)', airline: '大韓航空 Korean Air', code2: 'KE186', price: 10500, hours: 2.5 },
  '釜山': { code: 'PUS', name: '釜山金海 (PUS)', airline: '大韓航空 Korean Air', code2: 'KE2250', price: 9800, hours: 2.3 },
  '濟州': { code: 'CJU', name: '濟州國際機場 (CJU)', airline: '台灣虎航 Tigerair', code2: 'IT654', price: 8800, hours: 2.0 },

  // 東南亞 & 港澳
  '曼谷': { code: 'BKK', name: '曼谷素萬那普 (BKK)', airline: '泰國航空 Thai Airways', code2: 'TG633', price: 11200, hours: 3.8 },
  '清邁': { code: 'CNX', name: '清邁國際機場 (CNX)', airline: '長榮航空 EVA Air', code2: 'BR257', price: 12500, hours: 4.0 },
  '新加坡': { code: 'SIN', name: '新加坡樟宜 (SIN)', airline: '新加坡航空 Singapore Airlines', code2: 'SQ877', price: 13800, hours: 4.5 },
  '吉隆坡': { code: 'KUL', name: '吉隆坡國際機場 (KUL)', airline: '長榮航空 EVA Air', code2: 'BR227', price: 10800, hours: 4.8 },
  '峇里島': { code: 'DPS', name: '峇里島登巴薩 (DPS)', airline: '長榮航空 EVA Air 直飛', code2: 'BR255', price: 18500, hours: 5.3 },
  '峴港': { code: 'DAD', name: '峴港國際機場 (DAD)', airline: '星宇航空 STARLUX', code2: 'JX701', price: 10200, hours: 2.8 },
  '胡志明': { code: 'SGN', name: '胡志明新山一 (SGN)', airline: '長榮航空 EVA Air', code2: 'BR391', price: 9800, hours: 3.5 },
  '河內': { code: 'HAN', name: '河內內排 (HAN)', airline: '長榮航空 EVA Air', code2: 'BR397', price: 9500, hours: 3.0 },
  '香港': { code: 'HKG', name: '香港國際機場 (HKG)', airline: '國泰航空 Cathay Pacific', code2: 'CX495', price: 7500, hours: 1.8 },
  '澳門': { code: 'MFM', name: '澳門國際機場 (MFM)', airline: '星宇航空 STARLUX', code2: 'JX201', price: 6800, hours: 1.8 },

  // 歐美 & 其他
  '巴黎': { code: 'CDG', name: '巴黎戴高樂 (CDG)', airline: '長榮航空 EVA Air 直飛', code2: 'BR087', price: 32800, hours: 14.5 },
  '法國': { code: 'CDG', name: '巴黎戴高樂 (CDG)', airline: '長榮航空 EVA Air 直飛', code2: 'BR087', price: 32800, hours: 14.5 },
  '倫敦': { code: 'LHR', name: '倫敦希斯洛 (LHR)', airline: '長榮航空 EVA Air 直飛', code2: 'BR067', price: 34500, hours: 15.0 },
  '英國': { code: 'LHR', name: '倫敦希斯洛 (LHR)', airline: '長榮航空 EVA Air 直飛', code2: 'BR067', price: 34500, hours: 15.0 },
  '哥本哈根': { code: 'CPH', name: '哥本哈根凱斯楚普 (CPH)', airline: '阿聯酋航空 Emirates (杜拜轉機)', code2: 'EK367', price: 32800, hours: 16.5 },
  '丹麥': { code: 'CPH', name: '哥本哈根凱斯楚普 (CPH)', airline: '阿聯酋航空 Emirates (杜拜轉機)', code2: 'EK367', price: 32800, hours: 16.5 },
  '赫爾辛基': { code: 'HEL', name: '赫爾辛基萬塔 (HEL)', airline: '芬蘭航空 Finnair (轉機)', code2: 'AY100', price: 33500, hours: 16.0 },
  '芬蘭': { code: 'HEL', name: '赫爾辛基萬塔 (HEL)', airline: '芬蘭航空 Finnair (轉機)', code2: 'AY100', price: 33500, hours: 16.0 },
  '斯德哥爾摩': { code: 'ARN', name: '斯德哥爾摩阿蘭達 (ARN)', airline: '阿聯酋航空 Emirates (杜拜轉機)', code2: 'EK367', price: 33800, hours: 16.8 },
  '瑞典': { code: 'ARN', name: '斯德哥爾摩阿蘭達 (ARN)', airline: '阿聯酋航空 Emirates (杜拜轉機)', code2: 'EK367', price: 33800, hours: 16.8 },
  '奧斯陸': { code: 'OSL', name: '奧斯陸加勒穆恩 (OSL)', airline: '卡達航空 Qatar Airways (轉機)', code2: 'QR817', price: 34200, hours: 17.0 },
  '挪威': { code: 'OSL', name: '奧斯陸加勒穆恩 (OSL)', airline: '卡達航空 Qatar Airways (轉機)', code2: 'QR817', price: 34200, hours: 17.0 },
  '布拉格': { code: 'PRG', name: '布拉格瓦茨拉夫 (PRG)', airline: '中華航空 China Airlines 直飛/轉機', code2: 'CI067', price: 32500, hours: 15.5 },
  '捷克': { code: 'PRG', name: '布拉格瓦茨拉夫 (PRG)', airline: '中華航空 China Airlines 直飛/轉機', code2: 'CI067', price: 32500, hours: 15.5 },
  '巴塞隆納': { code: 'BCN', name: '巴塞隆納埃爾普拉特 (BCN)', airline: '阿聯酋航空 Emirates (杜拜轉機)', code2: 'EK367', price: 32800, hours: 16.5 },
  '馬德里': { code: 'MAD', name: '馬德里巴拉哈斯 (MAD)', airline: '阿聯酋航空 Emirates (杜拜轉機)', code2: 'EK367', price: 32800, hours: 16.5 },
  '西班牙': { code: 'MAD', name: '馬德里巴拉哈斯 (MAD)', airline: '阿聯酋航空 Emirates (杜拜轉機)', code2: 'EK367', price: 32800, hours: 16.5 },
  '慕尼黑': { code: 'MUC', name: '慕尼黑國際機場 (MUC)', airline: '長榮航空 EVA Air 直飛', code2: 'BR071', price: 33500, hours: 14.2 },
  '柏林': { code: 'BER', name: '柏林布蘭登堡 (BER)', airline: '卡達航空 Qatar Airways (轉機)', code2: 'QR817', price: 33000, hours: 16.0 },
  '羅馬': { code: 'FCO', name: '羅馬菲烏米奇諾 (FCO)', airline: '中華航空 China Airlines 直飛', code2: 'CI075', price: 33500, hours: 14.8 },
  '米蘭': { code: 'MXP', name: '米蘭馬爾彭薩 (MXP)', airline: '長榮航空 EVA Air 直飛', code2: 'BR095', price: 32500, hours: 14.0 },
  '阿姆斯特丹': { code: 'AMS', name: '阿姆斯特丹史基浦 (AMS)', airline: '中華航空 China Airlines 直飛', code2: 'CI073', price: 31800, hours: 14.2 },
  '法蘭克福': { code: 'FRA', name: '法蘭克福機場 (FRA)', airline: '中華航空 China Airlines 直飛', code2: 'CI061', price: 33000, hours: 14.5 },
  '維也納': { code: 'VIE', name: '維也納國際機場 (VIE)', airline: '長榮航空 EVA Air 直飛', code2: 'BR061', price: 31500, hours: 13.8 },
  '蘇黎世': { code: 'ZRH', name: '蘇黎世國際機場 (ZRH)', airline: '瑞士國際航空 SWISS', code2: 'LX139', price: 36800, hours: 14.0 },
  '瑞士': { code: 'ZRH', name: '蘇黎世國際機場 (ZRH)', airline: '瑞士國際航空 SWISS', code2: 'LX139', price: 36800, hours: 14.0 },
  '冰島': { code: 'KEF', name: '冰島凱夫拉維克 (KEF)', airline: '冰島航空 Icelandair', code2: 'FI543', price: 38900, hours: 18.0 },
  '雷克雅維克': { code: 'KEF', name: '冰島凱夫拉維克 (KEF)', airline: '冰島航空 Icelandair', code2: 'FI543', price: 38900, hours: 18.0 },
  '伊斯坦堡': { code: 'IST', name: '伊斯坦堡機場 (IST)', airline: '土耳其航空 Turkish Airlines 直飛', code2: 'TK025', price: 31800, hours: 12.5 },
  '土耳其': { code: 'IST', name: '伊斯坦堡機場 (IST)', airline: '土耳其航空 Turkish Airlines 直飛', code2: 'TK025', price: 31800, hours: 12.5 },
  '紐約': { code: 'JFK', name: '紐約甘迺迪 (JFK)', airline: '長榮航空 EVA Air 直飛', code2: 'BR032', price: 38500, hours: 15.5 },
  '洛杉磯': { code: 'LAX', name: '洛杉磯國際機場 (LAX)', airline: '星宇航空 STARLUX 直飛', code2: 'JX002', price: 32500, hours: 12.0 },
  '舊金山': { code: 'SFO', name: '舊金山國際機場 (SFO)', airline: '星宇航空 STARLUX 直飛', code2: 'JX012', price: 33000, hours: 11.5 },
  '西雅圖': { code: 'SEA', name: '西雅圖塔科馬 (SEA)', airline: '星宇航空 STARLUX 直飛', code2: 'JX022', price: 31500, hours: 11.0 },
  '芝加哥': { code: 'ORD', name: '芝加哥奧黑爾 (ORD)', airline: '長榮航空 EVA Air 直飛', code2: 'BR056', price: 35500, hours: 14.0 },
  '波士頓': { code: 'BOS', name: '波士頓洛根 (BOS)', airline: '國泰航空 Cathay Pacific (轉機)', code2: 'CX812', price: 36800, hours: 17.5 },
  '溫哥華': { code: 'YVR', name: '溫哥華國際機場 (YVR)', airline: '長榮航空 EVA Air 直飛', code2: 'BR010', price: 31800, hours: 11.0 },
  '多倫多': { code: 'YYZ', name: '多倫多皮爾遜 (YYZ)', airline: '長榮航空 EVA Air 直飛', code2: 'BR036', price: 36500, hours: 14.5 },
  '加拿大': { code: 'YVR', name: '溫哥華國際機場 (YVR)', airline: '長榮航空 EVA Air 直飛', code2: 'BR010', price: 31800, hours: 11.0 },
  '雪梨': { code: 'SYD', name: '雪梨國際機場 (SYD)', airline: '中華航空 China Airlines 直飛', code2: 'CI051', price: 26800, hours: 9.0 },
  '墨爾本': { code: 'MEL', name: '墨爾本國際機場 (MEL)', airline: '中華航空 China Airlines 直飛', code2: 'CI057', price: 26800, hours: 9.2 },
  '布里斯本': { code: 'BNE', name: '布里斯本國際機場 (BNE)', airline: '長榮航空 EVA Air 直飛', code2: 'BR315', price: 25800, hours: 8.8 },
  '澳洲': { code: 'SYD', name: '雪梨國際機場 (SYD)', airline: '中華航空 China Airlines 直飛', code2: 'CI051', price: 26800, hours: 9.0 },
  '奧克蘭': { code: 'AKL', name: '奧克蘭國際機場 (AKL)', airline: '紐西蘭航空 Air New Zealand 直飛', code2: 'NZ078', price: 29800, hours: 10.8 },
  '紐西蘭': { code: 'AKL', name: '奧克蘭國際機場 (AKL)', airline: '紐西蘭航空 Air New Zealand 直飛', code2: 'NZ078', price: 29800, hours: 10.8 },
  '杜拜': { code: 'DXB', name: '杜拜國際機場 (DXB)', airline: '阿聯酋航空 Emirates 直飛', code2: 'EK367', price: 31000, hours: 8.5 },
  '開羅': { code: 'CAI', name: '開羅國際機場 (CAI)', airline: '阿聯酋航空 Emirates (杜拜轉機)', code2: 'EK367', price: 33500, hours: 15.5 },
  '埃及': { code: 'CAI', name: '開羅國際機場 (CAI)', airline: '阿聯酋航空 Emirates (杜拜轉機)', code2: 'EK367', price: 33500, hours: 15.5 },
};

export function getFallbackFlights(destName: string, originCode: string, depDate: string, retDate: string) {
  const cleanDest = cleanDestinationName(destName);
  const matchEntry = Object.entries(CITY_MAP).find(([k]) =>
    cleanDest.includes(k) || k.includes(cleanDest) || destName.includes(k)
  );

  const match = matchEntry ? matchEntry[1] : {
    code: cleanDest,
    name: `${cleanDest}國際機場`,
    airline: '優質國際航空',
    code2: 'IT101',
    price: 15800,
    hours: 4.0,
  };

  const targetCode = (originCode === 'TSA' && match.tsaCode) ? match.tsaCode : match.code;
  const targetName = (originCode === 'TSA' && match.tsaName) ? match.tsaName : match.name;
  const originName = originCode === 'TPE' ? '台北桃園 (TPE)' : originCode === 'TSA' ? '台北松山 (TSA)' : '高雄小港 (KHH)';

  // 構建精準 Google Flights 比價深層連結：有機場代碼帶代碼，無代碼帶目的地真實城市名稱
  const searchDestQuery = matchEntry ? targetCode : cleanDest;
  const googleDeepLink = `https://www.google.com/travel/flights?q=flights%20from%20${originCode}%20to%20${encodeURIComponent(searchDestQuery)}%20on%20${depDate}%20through%20${retDate}`;

  const isLongHaul = match.hours >= 8;
  const secondAirlineCode = isLongHaul ? 'SQ' : 'IT';
  const secondAirlineName = isLongHaul ? '新加坡航空 Singapore Airlines (轉機)' : '台灣虎航 Tigerair';
  const secondFlightNo = isLongHaul ? 'SQ877' : 'IT200';
  const secondFlightNoRet = isLongHaul ? 'SQ878' : 'IT201';
  const secondDurationText = isLongHaul ? `${(match.hours + 1.5).toFixed(1)} 小時 (轉機 1 次)` : `${match.hours} 小時 直飛`;
  const secondStops = isLongHaul ? 1 : 0;
  const secondBaggage = isLongHaul ? '包含 1 件 25kg 托運行李 + 7kg 手提' : '含隨身手提 7kg（可加購托運）';
  const secondPrice = isLongHaul ? Math.round(match.price * 1.05) : Math.round(match.price * 0.78);
  const secondTag = isLongHaul ? '✨ 五星航空 · 優質服務' : '💰 超值推薦 · 經濟首選';

  return [
    {
      id: `fl-best-${originCode}`,
      provider: 'Atrip 機票優選',
      tag: '🔥 評分最高 · 最佳時段',
      price_total_twd: match.price,
      baggage_included: '含托運行李 23kg × 1 件 + 手提 7kg',
      deep_link_url: googleDeepLink,
      outbound: {
        departure_time: `${depDate} 08:30`,
        arrival_time: `${depDate} 12:45`,
        duration: isLongHaul ? `${match.hours} 小時 航程` : `${match.hours} 小時 直飛`,
        stops: isLongHaul ? 1 : 0,
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
        duration: isLongHaul ? `${match.hours} 小時 航程` : `${match.hours} 小時 直飛`,
        stops: isLongHaul ? 1 : 0,
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
      tag: secondTag,
      price_total_twd: secondPrice,
      baggage_included: secondBaggage,
      deep_link_url: googleDeepLink,
      outbound: {
        departure_time: `${depDate} 06:40`,
        arrival_time: `${depDate} 10:55`,
        duration: secondDurationText,
        stops: secondStops,
        segments: [{
          airline_code: secondAirlineCode,
          airline_name: secondAirlineName,
          flight_number: secondFlightNo,
          departure: { airport_code: originCode, airport_name: originName, time: `${depDate} 06:40` },
          arrival: { airport_code: targetCode, airport_name: targetName, time: `${depDate} 10:55` },
          duration_minutes: (isLongHaul ? match.hours + 1.5 : match.hours) * 60,
        }],
      },
      inbound: {
        departure_time: `${retDate} 11:45`,
        arrival_time: `${retDate} 14:50`,
        duration: secondDurationText,
        stops: secondStops,
        segments: [{
          airline_code: secondAirlineCode,
          airline_name: secondAirlineName,
          flight_number: secondFlightNoRet,
          departure: { airport_code: targetCode, airport_name: targetName, time: `${retDate} 11:45` },
          arrival: { airport_code: originCode, airport_name: originName, time: `${retDate} 14:50` },
          duration_minutes: (isLongHaul ? match.hours + 1.5 : match.hours) * 60,
        }],
      },
    },
  ];
}
