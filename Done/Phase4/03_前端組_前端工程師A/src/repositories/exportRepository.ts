import { ExportPdfLineRequest, ExportPdfLineResponse } from '../types/export';

export const exportRepository = {
  async exportPdfViaLine(itineraryId: string, accessToken?: string): Promise<ExportPdfLineResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch('/functions/v1/export-pdf-line', {
      method: 'POST',
      headers,
      body: JSON.stringify({ itinerary_id: itineraryId } as ExportPdfLineRequest),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.message || '無法發送 LINE PDF 請求，請稍後再試');
    }

    return response.json();
  },
};