'use client';

import React from 'react';
import { usePdfExportStore } from '@/stores/usePdfExportStore';
import { Printer } from 'lucide-react';

interface PdfExportButtonProps {
  itineraryId: string;
  accessToken?: string;
  className?: string;
}

export const PdfExportButton: React.FC<PdfExportButtonProps> = ({
  itineraryId,
  accessToken,
  className = '',
}) => {
  const {
    status,
    isConfirmDialogOpen,
    errorMessage,
    successMessage,
    handleExportClick,
    confirmLineExport,
    setConfirmDialogOpen,
    resetStatus,
  } = usePdfExportStore();

  const isLoading = status === 'loading';

  return (
    <>
      <button
        type="button"
        disabled={isLoading}
        onClick={() => handleExportClick(itineraryId, accessToken)}
        className={`interactive-only no-print inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all 
          bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        <Printer size={14} className="text-slate-600" />
        {isLoading ? <span>處理中...</span> : <span>匯出 / 列印 PDF</span>}
      </button>

      {isConfirmDialogOpen && (
        <div className="interactive-only no-print fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              傳送 PDF 到 LINE 聊天室
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              因 LINE 內建瀏覽器限制，系統將透過 LINE 官方帳號直接把完整的行程 PDF 檔案傳送到您的對話框中。
            </p>

            <div className="mt-6 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setConfirmDialogOpen(false)}
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => confirmLineExport(itineraryId, accessToken)}
                className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-brand-primary text-slate-900 hover:brightness-95"
              >
                確認傳送
              </button>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="interactive-only no-print fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-bold text-white shadow-lg flex items-center justify-between min-w-[300px]">
          <span>{successMessage}</span>
          <button type="button" onClick={resetStatus} className="ml-3 font-bold">
            ✕
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="interactive-only no-print fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-rose-600 px-4 py-3 text-xs font-bold text-white shadow-lg flex items-center justify-between min-w-[300px]">
          <span>{errorMessage}</span>
          <button type="button" onClick={resetStatus} className="ml-3 font-bold">
            ✕
          </button>
        </div>
      )}
    </>
  );
};
