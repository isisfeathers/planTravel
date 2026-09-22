import React from 'react';
import { usePdfExportStore } from '../../stores/usePdfExportStore';

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
        className={`interactive-only no-print inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-colors 
          bg-brand-primary text-text-inverse hover:bg-brand-secondary disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {isLoading ? <span>處理中...</span> : <span>匯出 / 列印 PDF</span>}
      </button>

      {isConfirmDialogOpen && (
        <div className="interactive-only no-print fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-surface-card p-6 shadow-xl border border-border-subtle">
            <h3 className="text-lg font-bold text-text-primary">
              傳送 PDF 到 LINE 聊天室
            </h3>
            <p className="mt-2 text-sm text-text-secondary">
              因 LINE 內建瀏覽器限制，系統將透過 LINE 官方帳號直接把完整的行程 PDF 檔案傳送到您的對話框中。
            </p>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setConfirmDialogOpen(false)}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-surface-muted text-text-primary hover:bg-surface-hover"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => confirmLineExport(itineraryId, accessToken)}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-brand-primary text-text-inverse hover:bg-brand-secondary"
              >
                確認傳送
              </button>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="interactive-only no-print fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-status-success px-4 py-3 text-sm text-text-inverse shadow-lg flex items-center justify-between min-w-[300px]">
          <span>{successMessage}</span>
          <button type="button" onClick={resetStatus} className="ml-3 font-bold">
            ✕
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="interactive-only no-print fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-status-error px-4 py-3 text-sm text-text-inverse shadow-lg flex items-center justify-between min-w-[300px]">
          <span>{errorMessage}</span>
          <button type="button" onClick={resetStatus} className="ml-3 font-bold">
            ✕
          </button>
        </div>
      )}
    </>
  );
};