import { FlightOfferItem } from '../types/flight';

interface CacheValue {
  flights: FlightOfferItem[];
  checkedAt: string;
  expiresAt: string;
}

export class CacheService {
  private static instance: CacheService;
  
  // 雙軌設計：記憶體快取 (Memory Cache)
  private memoryCache = new Map<string, { value: CacheValue; expiryTime: number }>();
  
  // O(1) 航班報價快取：用於 /api/v1/flights/refresh 二次驗價快速查找
  private offerStore = new Map<string, { value: FlightOfferItem; expiryTime: number }>();

  private constructor() {
    // 每分鐘自動清除過期快取的背景計時器，防範記憶體溢位 (Memory Leak)
    setInterval(() => this.cleanupExpired(), 60000).unref();
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * 產出機票快取 Key 命名規格: flight:cache:{origin}:{destination}:{date}:{passengers}:{cabin}
   */
  public getCacheKey(
    origin: string,
    destination: string,
    departureDate: string,
    returnDate: string | undefined,
    passengers: number,
    cabin: string
  ): string {
    const datePart = returnDate ? `${departureDate}_${returnDate}` : departureDate;
    return `flight:cache:${origin.toUpperCase()}:${destination.toUpperCase()}:${datePart}:${passengers}:${cabin.toUpperCase()}`;
  }

  /**
   * 讀取搜尋快取
   */
  public async get(key: string): Promise<FlightOfferItem[] | null> {
    const entry = this.memoryCache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.expiryTime) {
      this.memoryCache.delete(key);
      return null;
    }

    console.log(`[CacheService] ⚡️ 快取命中！Key: ${key}，時間花費近乎 0ms`);
    return entry.value.flights;
  }

  /**
   * 寫入搜尋快取與實作 20 分鐘過期時間 (1200 秒)
   */
  public async set(key: string, flights: FlightOfferItem[], ttlSeconds = 1200): Promise<void> {
    const now = Date.now();
    const expiryTime = now + ttlSeconds * 1000;
    
    const checkedAt = new Date(now).toISOString();
    const expiresAt = new Date(expiryTime).toISOString();

    const cacheValue: CacheValue = {
      flights,
      checkedAt,
      expiresAt
    };

    this.memoryCache.set(key, { value: cacheValue, expiryTime });
    console.log(`[CacheService] 📥 已成功快取搜尋結果。Key: ${key}，TTL: ${ttlSeconds}s`);

    // 順便寫入 offerStore 供二次驗價快速查找
    for (const flight of flights) {
      this.offerStore.set(flight.id, { value: flight, expiryTime });
    }
  }

  /**
   * 透過 offer_id 快速取得航班詳情 (O(1) 複雜度)
   */
  public getOffer(offerId: string): FlightOfferItem | null {
    const entry = this.offerStore.get(offerId);
    if (!entry) return null;

    if (Date.now() > entry.expiryTime) {
      this.offerStore.delete(offerId);
      return null;
    }

    return entry.value;
  }

  /**
   * 清除過期快取
   */
  private cleanupExpired(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now > entry.expiryTime) {
        this.memoryCache.delete(key);
      }
    }

    for (const [id, entry] of this.offerStore.entries()) {
      if (now > entry.expiryTime) {
        this.offerStore.delete(id);
      }
    }
  }
}
