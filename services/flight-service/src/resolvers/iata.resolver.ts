/**
 * Airport Code Resolver (IATA 解析器)
 * 支援中文城市名稱至機場三字碼（IATA Code）之雙向與大都會多機場轉換
 */
export interface AirportInfo {
  city: string;
  airportCodes: string[];
  metroCode?: string; // 大都會代碼，如東京為 TYO
}

export class IataResolver {
  private static dictionary: Record<string, AirportInfo> = {
    // 台灣
    '台北': { city: 'Taipei', airportCodes: ['TPE', 'TSA'] },
    '高雄': { city: 'Kaohsiung', airportCodes: ['KHH'] },
    '台中': { city: 'Taichung', airportCodes: ['RMQ'] },

    // 日本
    '東京': { city: 'Tokyo', airportCodes: ['NRT', 'HND'], metroCode: 'TYO' },
    '大阪': { city: 'Osaka', airportCodes: ['KIX', 'ITM'], metroCode: 'OSA' },
    '京都': { city: 'Kyoto', airportCodes: ['KIX', 'ITM'], metroCode: 'OSA' },
    '沖繩': { city: 'Okinawa', airportCodes: ['OKA'] },
    '福岡': { city: 'Fukuoka', airportCodes: ['FUK'] },
    '札幌': { city: 'Sapporo', airportCodes: ['CTS'] },
    '北海道': { city: 'Hokkaido', airportCodes: ['CTS'] },
    '名古屋': { city: 'Nagoya', airportCodes: ['NGO'] },
    '熊本': { city: 'Kumamoto', airportCodes: ['KMJ'] },
    '仙台': { city: 'Sendai', airportCodes: ['SDJ'] },
    '函館': { city: 'Hakodate', airportCodes: ['HKD'] },
    '岡山': { city: 'Okayama', airportCodes: ['OKJ'] },
    '廣島': { city: 'Hiroshima', airportCodes: ['HIJ'] },
    '高松': { city: 'Takamatsu', airportCodes: ['TAK'] },

    // 韓國
    '首爾': { city: 'Seoul', airportCodes: ['ICN', 'GMP'], metroCode: 'SEL' },
    '釜山': { city: 'Busan', airportCodes: ['PUS'] },
    '濟州': { city: 'Jeju', airportCodes: ['CJU'] },

    // 東南亞 & 港澳
    '曼谷': { city: 'Bangkok', airportCodes: ['BKK', 'DMK'] },
    '清邁': { city: 'Chiang Mai', airportCodes: ['CNX'] },
    '新加坡': { city: 'Singapore', airportCodes: ['SIN'] },
    '吉隆坡': { city: 'Kuala Lumpur', airportCodes: ['KUL'] },
    '峇里島': { city: 'Bali', airportCodes: ['DPS'] },
    '峴港': { city: 'Da Nang', airportCodes: ['DAD'] },
    '胡志明': { city: 'Ho Chi Minh', airportCodes: ['SGN'] },
    '河內': { city: 'Hanoi', airportCodes: ['HAN'] },
    '香港': { city: 'Hong Kong', airportCodes: ['HKG'] },
    '澳門': { city: 'Macau', airportCodes: ['MFM'] },

    // 歐洲 & 美加 & 大洋洲
    '倫敦': { city: 'London', airportCodes: ['LHR', 'LGW', 'STN'], metroCode: 'LON' },
    '英國': { city: 'London', airportCodes: ['LHR', 'LGW', 'STN'], metroCode: 'LON' },
    '巴黎': { city: 'Paris', airportCodes: ['CDG', 'ORY'], metroCode: 'PAR' },
    '法國': { city: 'Paris', airportCodes: ['CDG', 'ORY'], metroCode: 'PAR' },
    '哥本哈根': { city: 'Copenhagen', airportCodes: ['CPH'] },
    '丹麥': { city: 'Copenhagen', airportCodes: ['CPH'] },
    '赫爾辛基': { city: 'Helsinki', airportCodes: ['HEL'] },
    '芬蘭': { city: 'Helsinki', airportCodes: ['HEL'] },
    '斯德哥爾摩': { city: 'Stockholm', airportCodes: ['ARN'] },
    '瑞典': { city: 'Stockholm', airportCodes: ['ARN'] },
    '奧斯陸': { city: 'Oslo', airportCodes: ['OSL'] },
    '挪威': { city: 'Oslo', airportCodes: ['OSL'] },
    '布拉格': { city: 'Prague', airportCodes: ['PRG'] },
    '捷克': { city: 'Prague', airportCodes: ['PRG'] },
    '巴塞隆納': { city: 'Barcelona', airportCodes: ['BCN'] },
    '馬德里': { city: 'Madrid', airportCodes: ['MAD'] },
    '西班牙': { city: 'Madrid', airportCodes: ['MAD'] },
    '慕尼黑': { city: 'Munich', airportCodes: ['MUC'] },
    '柏林': { city: 'Berlin', airportCodes: ['BER'] },
    '德國': { city: 'Frankfurt', airportCodes: ['FRA'] },
    '法蘭克福': { city: 'Frankfurt', airportCodes: ['FRA'] },
    '阿姆斯特丹': { city: 'Amsterdam', airportCodes: ['AMS'] },
    '荷蘭': { city: 'Amsterdam', airportCodes: ['AMS'] },
    '維也納': { city: 'Vienna', airportCodes: ['VIE'] },
    '奧地利': { city: 'Vienna', airportCodes: ['VIE'] },
    '布達佩斯': { city: 'Budapest', airportCodes: ['BUD'] },
    '匈牙利': { city: 'Budapest', airportCodes: ['BUD'] },
    '雅典': { city: 'Athens', airportCodes: ['ATH'] },
    '希臘': { city: 'Athens', airportCodes: ['ATH'] },
    '羅馬': { city: 'Rome', airportCodes: ['FCO'] },
    '米蘭': { city: 'Milan', airportCodes: ['MXP'] },
    '威尼斯': { city: 'Venice', airportCodes: ['VCE'] },
    '義大利': { city: 'Rome', airportCodes: ['FCO'] },
    '蘇黎世': { city: 'Zurich', airportCodes: ['ZRH'] },
    '瑞士': { city: 'Zurich', airportCodes: ['ZRH'] },
    '日內瓦': { city: 'Geneva', airportCodes: ['GVA'] },
    '冰島': { city: 'Reykjavik', airportCodes: ['KEF'] },
    '雷克雅維克': { city: 'Reykjavik', airportCodes: ['KEF'] },
    '伊斯坦堡': { city: 'Istanbul', airportCodes: ['IST'] },
    '土耳其': { city: 'Istanbul', airportCodes: ['IST'] },
    '紐約': { city: 'New York', airportCodes: ['JFK', 'EWR', 'LGA'], metroCode: 'NYC' },
    '洛杉磯': { city: 'Los Angeles', airportCodes: ['LAX'] },
    '舊金山': { city: 'San Francisco', airportCodes: ['SFO'] },
    '西雅圖': { city: 'Seattle', airportCodes: ['SEA'] },
    '芝加哥': { city: 'Chicago', airportCodes: ['ORD'] },
    '波士頓': { city: 'Boston', airportCodes: ['BOS'] },
    '溫哥華': { city: 'Vancouver', airportCodes: ['YVR'] },
    '多倫多': { city: 'Toronto', airportCodes: ['YYZ'] },
    '加拿大': { city: 'Vancouver', airportCodes: ['YVR'] },
    '雪梨': { city: 'Sydney', airportCodes: ['SYD'] },
    '墨爾本': { city: 'Melbourne', airportCodes: ['MEL'] },
    '布里斯本': { city: 'Brisbane', airportCodes: ['BNE'] },
    '澳洲': { city: 'Sydney', airportCodes: ['SYD'] },
    '奧克蘭': { city: 'Auckland', airportCodes: ['AKL'] },
    '紐西蘭': { city: 'Auckland', airportCodes: ['AKL'] },
    '杜拜': { city: 'Dubai', airportCodes: ['DXB'] },
    '開羅': { city: 'Cairo', airportCodes: ['CAI'] },
    '埃及': { city: 'Cairo', airportCodes: ['CAI'] },

    // 景點與大區門戶映射
    '普羅旺斯': { city: 'Nice', airportCodes: ['NCE', 'CDG'] },
    '南法': { city: 'Nice', airportCodes: ['NCE', 'CDG'] },
    '合掌村': { city: 'Nagoya', airportCodes: ['NGO'] },
    '白川鄉': { city: 'Nagoya', airportCodes: ['NGO'] },
    '富士山': { city: 'Tokyo', airportCodes: ['HND', 'NRT'] },
    '河口湖': { city: 'Tokyo', airportCodes: ['HND', 'NRT'] },
    '輕井澤': { city: 'Tokyo', airportCodes: ['HND', 'NRT'] },
    '聖托里尼': { city: 'Athens', airportCodes: ['ATH'] },
    '哈修塔特': { city: 'Vienna', airportCodes: ['VIE'] },
    '托斯卡尼': { city: 'Rome', airportCodes: ['FCO'] },
    '佛羅倫斯': { city: 'Rome', airportCodes: ['FCO'] },
    '羅瓦涅米': { city: 'Helsinki', airportCodes: ['HEL'] },
    '班夫': { city: 'Vancouver', airportCodes: ['YVR', 'YYC'] },
    '大峽谷': { city: 'Las Vegas', airportCodes: ['LAS'] },
    '皇后鎮': { city: 'Auckland', airportCodes: ['AKL', 'ZQN'] },
    '普吉島': { city: 'Bangkok', airportCodes: ['BKK', 'HKT'] },
  };

  /**
   * 將城市中文名解析為 IATA 機場代碼陣列
   */
  public static resolveCityToAirports(cityName: string): string[] {
    if (!cityName) return ['TPE'];
    const cleanName = cityName
      .replace(/[0-9]+\s*天.*$/, '')
      .replace(/自由行.*$/, '')
      .replace(/深度遊.*$/, '')
      .replace(/之旅.*$/, '')
      .trim();

    // 1. 精確比對
    const entry = this.dictionary[cleanName];
    if (entry) return entry.airportCodes;

    // 2. 模糊包含比對
    const matchedKey = Object.keys(this.dictionary).find((k) => cleanName.includes(k) || k.includes(cleanName));
    if (matchedKey) return this.dictionary[matchedKey].airportCodes;

    // 3. 降級處理：若本身已是大寫 3 碼 IATA code 則直接返回
    if (/^[A-Z]{3}$/.test(cleanName)) {
      return [cleanName];
    }

    return [cleanName || 'TPE'];
  }

  /**
   * 取得大都會代碼（若有），如東京為 TYO
   */
  public static resolveMetroCode(cityName: string): string | null {
    if (!cityName) return null;
    const cleanName = cityName.trim();
    const entry = this.dictionary[cleanName];
    return entry?.metroCode || null;
  }
}
