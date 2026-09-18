import { FlightOfferItem } from '../types/flight';
import { CacheService } from './cache.service';

export interface PriceRefreshResponse {
  valid: boolean;
  current_price?: number;
  new_price?: number;
  deep_link?: string;
  reason?: 'PRICE_CHANGED' | 'SOLD_OUT';
  warning?: string;
}

export class DeepLinkService {
  private static AFFILIATE_TRACKING_ID = process.env.AFFILIATE_TRACKING_ID || 'atrip-affiliate-2026';

  /**
   * 注入官方聯盟合作 Tracking ID 並回傳轉址深層連結 (Deep Link Resolver)
   */
  public static resolveDeepLink(flight: FlightOfferItem): string {
    const rawUrl = flight.deep_link_url;
    if (!rawUrl) return '';

    try {
      const url = new URL(rawUrl);
      // 注入聯盟分潤與來源參數
      url.searchParams.set('atrip_track_id', this.AFFILIATE_TRACKING_ID);
      url.searchParams.set('utm_source', 'atrip_flight_service');
      url.searchParams.set('utm_medium', 'affiliate_redirect');
      
      return url.toString();
    } catch {
      // 萬一不是合規 URL，退回採用字串直接拼裝法
      const separator = rawUrl.includes('?') ? '&' : '?';
      return `${rawUrl}${separator}atrip_track_id=${this.AFFILIATE_TRACKING_ID}&utm_source=atrip_flight_service&utm_medium=affiliate_redirect`;
    }
  }

  /**
   * 二次驗價與即時可用性檢查 (Price Refresh & Availability Check)
   * 實作規格書規定之 MVP 核心邏輯：
   * - 價格浮動 <= 5%：允許通過並跳出微幅變價提示。
   * - 價差 > 5% 或 機位售罄 (Sold Out)：阻擋並提示，引導使用者重新搜尋。
   */
  public static async refreshPrice(offerId: string): Promise<PriceRefreshResponse> {
    const cacheService = CacheService.getInstance();
    const flight = cacheService.getOffer(offerId);

    if (!flight) {
      console.warn(`[DeepLinkService] 驗價失敗：快取中找不到 Offer ID ${offerId}，可能已過期或已售罄`);
      return {
        valid: false,
        reason: 'SOLD_OUT',
      };
    }

    // 模擬真實 GDS/OTA 二次驗價邏輯 (具備隨機微調測試功能，符合 MVP 測試與示範)
    const seed = Math.random();
    const originalPrice = flight.price_total_twd;

    if (seed < 0.85) {
      // 85% 機率：價格完美不變，直接放行並產生帶聯盟 ID 的 Deep Link
      const finalLink = this.resolveDeepLink(flight);
      console.log(`[DeepLinkService] 驗價成功。Offer ID: ${offerId}，價格維持: ${originalPrice} TWD`);
      return {
        valid: true,
        current_price: originalPrice,
        deep_link: finalLink,
      };
    } else if (seed < 0.95) {
      // 10% 機率：價格浮動
      const isMinor = Math.random() < 0.6; // 60% 機率是小變價 (<= 5%)，40% 機率是大變價 (> 5%)
      
      if (isMinor) {
        // 小變價：例如漲價 3% (<= 5%) -> 允許放行並回傳微幅變價提示
        const newPrice = Math.round(originalPrice * 1.03);
        const updatedFlight = { ...flight, price_total_twd: newPrice };
        const finalLink = this.resolveDeepLink(updatedFlight);
        
        console.log(`[DeepLinkService] 驗價：Offer ID ${offerId} 微幅漲價至 ${newPrice} TWD (漲幅 3%，<= 5%)。彈性放行並跳出提示`);
        return {
          valid: true,
          current_price: newPrice,
          deep_link: finalLink,
          warning: '提示：票價已有微幅上調，請儘速完成結帳。',
        };
      } else {
        // 大變價：例如漲價 8% (> 5%) -> 阻擋，提示並拒絕
        const newPrice = Math.round(originalPrice * 1.08);
        console.log(`[DeepLinkService] 驗價阻擋：Offer ID ${offerId} 價格異動至 ${newPrice} TWD (漲幅 8%，已超限 > 5%)。觸發重新搜尋`);
        return {
          valid: false,
          reason: 'PRICE_CHANGED',
          new_price: newPrice,
        };
      }
    } else {
      // 5% 機率：機位已售罄 (Sold Out)
      console.log(`[DeepLinkService] 驗價阻擋：Offer ID ${offerId} 機位已售罄`);
      return {
        valid: false,
        reason: 'SOLD_OUT',
      };
    }
  }
}
