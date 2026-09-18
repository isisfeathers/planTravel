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
    '台北': { city: 'Taipei', airportCodes: ['TPE', 'TSA'] },
    '東京': { city: 'Tokyo', airportCodes: ['NRT', 'HND'], metroCode: 'TYO' },
    '大阪': { city: 'Osaka', airportCodes: ['KIX', 'ITM'], metroCode: 'OSA' },
    '首爾': { city: 'Seoul', airportCodes: ['ICN', 'GMP'], metroCode: 'SEL' },
    '曼谷': { city: 'Bangkok', airportCodes: ['BKK', 'DMK'] },
    '新加坡': { city: 'Singapore', airportCodes: ['SIN'] },
    '倫敦': { city: 'London', airportCodes: ['LHR', 'LGW', 'STN'], metroCode: 'LON' },
    '巴黎': { city: 'Paris', airportCodes: ['CDG', 'ORY'], metroCode: 'PAR' },
    '香港': { city: 'Hong Kong', airportCodes: ['HKG'] },
    '紐約': { city: 'New York', airportCodes: ['JFK', 'EWR', 'LGA'], metroCode: 'NYC' },
  };

  /**
   * 將城市中文名解析為 IATA 機場代碼陣列
   */
  public static resolveCityToAirports(cityName: string): string[] {
    if (!cityName) return ['TPE'];
    const cleanName = cityName.trim();
    const entry = this.dictionary[cleanName];
    if (entry) {
      // 優先返回所有關聯機場，使 Orchestrator 可以進行更全面的查詢
      return entry.airportCodes;
    }

    // 降級處理：若本身已是大寫 3 碼 IATA code 則直接返回
    if (/^[A-Z]{3}$/.test(cleanName)) {
      return [cleanName];
    }

    // 預設出發地
    return ['TPE'];
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
