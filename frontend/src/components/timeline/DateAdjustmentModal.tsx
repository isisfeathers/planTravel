'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, ArrowRight, Plane, Luggage, Clock, X } from 'lucide-react';

interface DateAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStartDate?: string;
  totalDays: number;
  destination: string;
  onConfirm: (newStartDate: string) => Promise<void>;
}

export const DateAdjustmentModal: React.FC<DateAdjustmentModalProps> = ({
  isOpen,
  onClose,
  currentStartDate,
  totalDays,
  destination,
  onConfirm,
}) => {
  const getInitialDate = () => {
    if (currentStartDate && /^\d{4}-\d{2}-\d{2}$/.test(currentStartDate)) {
      return currentStartDate;
    }
    return new Date().toISOString().slice(0, 10);
  };

  const [selectedDate, setSelectedDate] = useState<string>(getInitialDate);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 當彈窗開啟或 currentStartDate 更新時，即時同步選取日期
  useEffect(() => {
    if (isOpen) {
      setSelectedDate(getInitialDate());
      setIsSubmitting(false);
    }
  }, [isOpen, currentStartDate]);

  if (!isOpen) return null;

  const effectiveStartDate = selectedDate || getInitialDate();
  const [startYear, startMonth, startDay] = effectiveStartDate.split('-').map(Number);
  const startObj = new Date(startYear, startMonth - 1, startDay, 12);
  const effectiveTotalDays = Math.max(1, totalDays || 1);
  const endObj = new Date(startObj.getTime() + (effectiveTotalDays - 1) * 24 * 3600 * 1000);
  const newEndDateStr = !isNaN(endObj.getTime())
    ? `${endObj.getFullYear()}-${String(endObj.getMonth() + 1).padStart(2, '0')}-${String(endObj.getDate()).padStart(2, '0')}`
    : '';

  const dayOfWeekStart = !isNaN(startObj.getTime())
    ? ['週日', '週一', '週二', '週三', '週四', '週五', '週六'][startObj.getDay()]
    : '';
  const dayOfWeekEnd = !isNaN(endObj.getTime())
    ? ['週日', '週一', '週二', '週三', '週四', '週五', '週六'][endObj.getDay()]
    : '';

  const handleApply = async () => {
    const targetDate = selectedDate || getInitialDate();
    if (!targetDate || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onConfirm(targetDate);
      onClose();
    } catch (e) {
      console.error('更新日期失敗:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="atrip-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="atrip-modal-panel" role="dialog" aria-modal="true" aria-labelledby="date-modal-title">
        <button
          type="button"
          onClick={onClose}
          className="atrip-icon-button absolute right-atrip-4 top-atrip-4 bg-atrip-surface-subtle text-atrip-text-secondary"
          aria-label="關閉日期調整視窗"
        >
          <X size={18} />
        </button>

        <div>
          <span className="inline-flex rounded-atrip-full bg-atrip-selection-background px-atrip-3 py-atrip-1 text-atrip-caption font-bold text-atrip-selection-foreground">
            行程即時動態排程
          </span>
          <h2 id="date-modal-title" className="mt-atrip-1 pr-12 text-atrip-title font-bold text-atrip-text-primary">
            調整 {destination} 出發日期
          </h2>
          <p className="mt-atrip-1 text-atrip-caption leading-relaxed text-atrip-text-secondary">
            變更出發日期後，系統將全面動態連動時間軸、航班比價與行李清單。
          </p>
        </div>

        {/* 日期選擇器 */}
        <div className="flex flex-col gap-atrip-3 rounded-atrip-lg border border-atrip-border-subtle bg-atrip-surface-subtle p-atrip-4">
          <div>
            <label className="mb-atrip-1 block text-atrip-caption font-bold text-atrip-text-primary">
              📅 選擇新的出發日期
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="atrip-focus min-h-atrip-input w-full cursor-pointer rounded-atrip-md border border-atrip-border-default bg-atrip-surface-card px-atrip-3 text-atrip-body font-bold text-atrip-text-primary"
            />
          </div>

          {/* 計算後的新區間 */}
          <div className="flex items-center justify-between rounded-atrip-md border border-atrip-border-subtle bg-atrip-surface-card p-atrip-3 text-atrip-caption">
            <div>
              <span className="block font-medium text-atrip-text-secondary">出發 (Day 1)</span>
              <span className="font-bold text-atrip-text-primary">{effectiveStartDate} ({dayOfWeekStart})</span>
            </div>
            <ArrowRight size={16} className="text-atrip-brand-logo-ai" />
            <div className="text-right">
              <span className="block font-medium text-atrip-text-secondary">回程 (Day {effectiveTotalDays})</span>
              <span className="font-bold text-atrip-text-primary">{newEndDateStr} ({dayOfWeekEnd})</span>
            </div>
          </div>
        </div>

        {/* 聯動項目提示 */}
        <div className="flex flex-col gap-atrip-2 text-atrip-caption text-atrip-text-secondary">
          <div className="flex items-center gap-2">
            <Clock size={16} className="shrink-0 text-atrip-brand-logo-ai" />
            <span>每日時間軸日期與星期自動重新推算</span>
          </div>
          <div className="flex items-center gap-2">
            <Plane size={16} className="shrink-0 text-atrip-brand-logo-ai" />
            <span>機票調度引擎自動切換為新出發日報價</span>
          </div>
          <div className="flex items-center gap-2">
            <Luggage size={16} className="shrink-0 text-atrip-brand-logo-ai" />
            <span>行李清單根據新季節氣候智慧調整防護建議</span>
          </div>
        </div>

        {/* 操作按鈕 */}
        <div className="grid grid-cols-2 gap-atrip-2 pt-atrip-1">
          <button
            type="button"
            onClick={onClose}
            className="atrip-compact-secondary min-h-atrip-control rounded-atrip-md"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={isSubmitting}
            className="atrip-compact-primary min-h-atrip-control rounded-atrip-md disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-atrip-action-on-primary border-t-transparent motion-reduce:animate-none" />
                <span>更新中…</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={14} />
                <span>確認套用新日期</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
