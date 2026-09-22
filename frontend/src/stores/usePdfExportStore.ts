import { create } from 'zustand';
import liff from '@line/liff';
import { ExportStatus } from '../types/export';
import { exportRepository } from '../repositories/exportRepository';

interface PdfExportState {
  status: ExportStatus;
  isConfirmDialogOpen: boolean;
  errorMessage: string | null;
  successMessage: string | null;

  setConfirmDialogOpen: (isOpen: boolean) => void;
  resetStatus: () => void;
  handleExportClick: (itineraryId: string, accessToken?: string) => Promise<void>;
  confirmLineExport: (itineraryId: string, accessToken?: string) => Promise<void>;
}

export const usePdfExportStore = create<PdfExportState>((set) => ({
  status: 'idle',
  isConfirmDialogOpen: false,
  errorMessage: null,
  successMessage: null,

  setConfirmDialogOpen: (isOpen) => set({ isConfirmDialogOpen: isOpen }),

  resetStatus: () =>
    set({
      status: 'idle',
      errorMessage: null,
      successMessage: null,
      isConfirmDialogOpen: false,
    }),

  handleExportClick: async (itineraryId: string, accessToken?: string) => {
    // 判斷是否在 LINE Client 內建瀏覽器中
    const isInLineApp = typeof liff !== 'undefined' && liff.isInClient ? liff.isInClient() : false;

    if (!isInLineApp) {
      // 一般瀏覽器直接觸發原生列印
      window.print();
      return;
    }

    // LINE 內建瀏覽器彈出對話框
    set({ isConfirmDialogOpen: true, errorMessage: null });
  },

  confirmLineExport: async (itineraryId: string, accessToken?: string) => {
    set({ status: 'loading', errorMessage: null, isConfirmDialogOpen: false });

    try {
      await exportRepository.exportPdfViaLine(itineraryId, accessToken);
      set({
        status: 'success',
        successMessage: 'PDF 檔案將於 30 秒內直接傳送至您的 LINE 對話框',
      });
    } catch (error: any) {
      set({
        status: 'error',
        errorMessage: error.message || '發送失敗，請稍後再試',
      });
    }
  },
}));
