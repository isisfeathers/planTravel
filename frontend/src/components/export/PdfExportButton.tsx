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
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              選擇 PDF 匯出方式
            </h3>
            <p className="text-xs leading-relaxed text-slate-600">
              您可以直接使用裝置的原生列印（儲存為完整手冊 PDF），或透過 LINE 官方帳號接收排版檔案。
            </p>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setConfirmDialogOpen(false);
                  setTimeout(() => window.print(), 100);
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center gap-2"
              >
                🖨️ 瀏覽器直接列印 / 儲存為 PDF
              </button>
              <button
                type="button"
                onClick={() => confirmLineExport(itineraryId, accessToken)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-brand-primary text-slate-900 hover:brightness-95 flex items-center justify-center gap-2"
              >
                📲 傳送 PDF 至 LINE 聊天室
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setConfirmDialogOpen(false)}
                className="px-3 py-1.5 text-xs font-bold rounded-xl text-slate-500 hover:bg-slate-100"
              >
                關閉
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
