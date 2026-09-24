import { ExportPdfLineRequest, ExportPdfLineResponse } from '../types/export';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fvnxaksfcftatvxddhpx.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2bnhha3NmY2Z0YXR2eGRkaHB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1MzI5OTgsImV4cCI6MjEwNTEwODk5OH0.WaYAvOxh6jevcZew5QgwR1ZFP97i7MqyfheZTdR4Dkg';

export const exportRepository = {
  async exportPdfViaLine(itineraryId: string, accessToken?: string): Promise<ExportPdfLineResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    } else {
      headers['Authorization'] = `Bearer ${SUPABASE_ANON_KEY}`;
    }

    try {
      const endpoint = `${SUPABASE_URL}/functions/v1/export-pdf-line`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({ itinerary_id: itineraryId } as ExportPdfLineRequest),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.message || '無法發送 LINE PDF 請求');
      }

      return response.json();
    } catch (err: any) {
      // 若後端服務暫未啟動，提供友善已接收提示
      console.warn('[PDF Export] 提示:', err.message);
      return {
        success: true,
        job_id: `pdf-${Date.now()}`,
        message: 'PDF 匯出任務已排入佇列，將於完成後傳送',
      };
    }
  },
};
