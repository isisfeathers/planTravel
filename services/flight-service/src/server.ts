import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { SearchOrchestrator } from './orchestrator';
import { DeepLinkService } from './services/deeplink.service';

// 載入環境變數
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// 初始化 AFS 搜尋調度中樞
const orchestrator = new SearchOrchestrator();

/**
 * 系統健康度檢查 (Health Check)
 */
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    service: 'Atrip Flight Service (AFS)',
    timestamp: new Date().toISOString(),
    apifyMode: process.env.APIFY_API_TOKEN && process.env.APIFY_API_TOKEN.toLowerCase() !== 'mock' ? 'production' : 'mock'
  });
});

/**
 * 規格書規定端點：GET /api/v1/flights/search
 * 查詢參數說明：
 * - origin: 出發地城市中文或機場碼（預設：台北）
 * - destination: 目的地城市中文或機場碼（預設：東京）
 * - departure_date / departureDate: 出發日期 YYYY-MM-DD
 * - return_date / returnDate: 回程日期 YYYY-MM-DD（選填）
 * - adults: 旅客人數（預設：1）
 * - cabin: 艙等 ECONOMY | PREMIUM_ECONOMY | BUSINESS | FIRST（預設：ECONOMY）
 * - timeout: 硬性超時預算（毫秒，預設：4500）
 */
app.get('/api/v1/flights/search', async (req: Request, res: Response) => {
  try {
    // 智慧預設時間計算（方便開發人員一鍵直接用瀏覽器測試）
    const today = new Date();
    const futureDate = (days: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() + days);
      return d.toISOString().split('T')[0];
    };

    const origin = (req.query.origin as string) || '台北';
    const destination = (req.query.destination as string) || '東京';
    
    // 支援 snake_case 與 camelCase 參數
    const departureDate = (req.query.departure_date as string) || (req.query.departureDate as string) || futureDate(14);
    
    // 智慧單程與來回推斷
    let returnDate: string | undefined = undefined;
    if (req.query.return_date !== undefined) {
      returnDate = req.query.return_date ? (req.query.return_date as string) : undefined;
    } else if (req.query.returnDate !== undefined) {
      returnDate = req.query.returnDate ? (req.query.returnDate as string) : undefined;
    } else {
      // 預設測試模式：若完全沒帶主要參數，為方便瀏覽器開發測試，預設給來回
      const isDefaultTest = !req.query.origin && !req.query.destination && !req.query.departure_date && !req.query.departureDate;
      if (isDefaultTest) {
        returnDate = futureDate(21);
      }
    }

    const adults = parseInt((req.query.adults as string) || '1') || 1;
    const cabin = (((req.query.cabin as string) || 'ECONOMY').toUpperCase() as any);
    const clientTimeout = parseInt(req.query.timeout as string) || 4500;

    console.log(`\n[API] 收到機票查詢請求: ${origin} -> ${destination} (${departureDate} 至 ${returnDate || '單程'}), 人數: ${adults}, 艙等: ${cabin}, 限制超時: ${clientTimeout}ms`);

    const flights = await orchestrator.searchAll(
      origin,
      destination,
      departureDate,
      returnDate,
      adults,
      cabin,
      clientTimeout
    );

    res.status(200).json({
      success: true,
      query: {
        origin,
        destination,
        departure_date: departureDate,
        return_date: returnDate,
        adults,
        cabin,
        timeout: clientTimeout,
      },
      flights_count: flights.length,
      flights,
    });
  } catch (error: any) {
    console.error('[API] AFS 查詢失敗異常:', error);
    res.status(500).json({
      success: false,
      error_code: 'FLIGHT_SEARCH_ERROR',
      error_message: error.message || '查詢航班時發生未預期系統錯誤。',
    });
  }
});

/**
 * 規格書規定端點：POST /api/v1/flights/refresh
 * 二次驗價與即時可用性檢查 (Price Refresh & Availability Check)
 * 請求 Payload 格式：
 * {
 *   "offer_id": "flight-mock-ci-TPE-HND"
 * }
 */
app.post('/api/v1/flights/refresh', async (req: Request, res: Response) => {
  try {
    const { offer_id } = req.body;

    if (!offer_id) {
      return res.status(400).json({
        success: false,
        error_code: 'BAD_REQUEST',
        error_message: '請提供必要欄位 offer_id',
      });
    }

    console.log(`\n[API] 收到二次驗價請求。Offer ID: ${offer_id}`);

    const result = await DeepLinkService.refreshPrice(offer_id);

    if (result.valid) {
      return res.status(200).json({
        valid: true,
        current_price: result.current_price,
        deep_link: result.deep_link,
        ...(result.warning ? { warning: result.warning } : {}),
      });
    } else {
      return res.status(200).json({
        valid: false,
        reason: result.reason || 'SOLD_OUT',
        ...(result.new_price ? { new_price: result.new_price } : {}),
      });
    }
  } catch (error: any) {
    console.error('[API] AFS 驗價失敗異常:', error);
    res.status(500).json({
      success: false,
      error_code: 'FLIGHT_REFRESH_ERROR',
      error_message: error.message || '驗價時發生未預期系統錯誤。',
    });
  }
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`===========================================================`);
  console.log(`🚀 Atrip Flight Service (AFS) 成功在埠口 ${PORT} 啟動！`);
  console.log(`👉 測試健康度: http://localhost:${PORT}/health`);
  console.log(`👉 測試預設機票查詢: http://localhost:${PORT}/api/v1/flights/search`);
  console.log(`===========================================================`);
});
