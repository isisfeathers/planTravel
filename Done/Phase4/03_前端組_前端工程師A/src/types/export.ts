export type ExportStatus = 'idle' | 'loading' | 'success' | 'error';

export interface ExportPdfLineRequest {
  itinerary_id: string;
}

export interface ExportPdfLineResponse {
  success: boolean;
  message?: string;
  job_id?: string;
}