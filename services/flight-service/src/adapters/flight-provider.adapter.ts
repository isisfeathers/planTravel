import { FlightOfferItem, SearchParams } from '../types/flight';

export interface FlightProviderAdapter {
  providerName: string;
  /**
   * 搜尋航班的主要介面，支援單一搜尋或批次搜尋組合
   * @param params 搜尋參數（單一或陣列）
   * @param timeoutMs 此 Adapter 獲配的執行時間限制 (毫秒)
   */
  search(params: SearchParams | SearchParams[], timeoutMs: number): Promise<FlightOfferItem[]>;

  /**
   * 產生高品質的模擬航班資料以進行優雅降級 (Fallback)
   */
  generateMockFlights(params: SearchParams | SearchParams[]): FlightOfferItem[];
}
