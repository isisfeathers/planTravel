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
        className={`atrip-icon-button interactive-only no-print border border-atrip-border-subtle bg-atrip-surface-card text-atrip-text-primary disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-atrip-3 ${className}`}
        aria-label={isLoading ? '正在準備 PDF' : '匯出或列印 PDF'}
      >
        <Printer size={18} aria-hidden="true" />
        {isLoading ? <span className="hidden sm:inline">處理中...</span> : <span className="hidden sm:inline">匯出 PDF</span>}
      </button>

      {isConfirmDialogOpen && (
        <div className="atrip-modal-backdrop interactive-only no-print">
          <div className="atrip-modal-panel sm:max-w-sm" role="dialog" aria-modal="true" aria-labelledby="pdf-export-title">
            <h3 id="pdf-export-title" className="text-atrip-title font-bold text-atrip-text-primary">
              選擇 PDF 匯出方式
            </h3>
            <p className="text-atrip-caption leading-relaxed text-atrip-text-secondary">
              您可以直接使用裝置的原生列印（儲存為完整手冊 PDF），或透過 LINE 官方帳號接收排版檔案。
            </p>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setConfirmDialogOpen(false);
                  setTimeout(() => window.print(), 100);
                }}
                className="atrip-compact-secondary min-h-atrip-control w-full rounded-atrip-md"
              >
                🖨️ 瀏覽器直接列印 / 儲存為 PDF
              </button>
              <button
                type="button"
                onClick={() => confirmLineExport(itineraryId, accessToken)}
                className="atrip-compact-primary min-h-atrip-control w-full rounded-atrip-md"
              >
                📲 傳送 PDF 至 LINE 聊天室
              </button>
            </div>

            <div className="flex justify-end border-t border-atrip-border-subtle pt-atrip-2">
              <button
                type="button"
                onClick={() => setConfirmDialogOpen(false)}
                className="atrip-focus min-h-atrip-icon-button rounded-atrip-md px-atrip-3 text-atrip-caption font-bold text-atrip-text-secondary"
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
