'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, ArrowRight, Plane, Luggage, Clock, X } from 'lucide-react';

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
  const startObj = new Date(effectiveStartDate);
  const effectiveTotalDays = Math.max(1, totalDays || 1);
  const endObj = new Date(startObj.getTime() + (effectiveTotalDays - 1) * 24 * 3600 * 1000);
  const newEndDateStr = !isNaN(endObj.getTime()) ? endObj.toISOString().slice(0, 10) : '';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 flex flex-col gap-5 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X size={18} />
        </button>

        <div>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-brand-primary/15 text-brand-primary">
            行程即時動態排程
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-1">
            調整 {destination} 出發日期
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            變更出發日期後，系統將全面動態連動時間軸、航班比價與行李清單。
          </p>
        </div>

        {/* 日期選擇器 */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              📅 選擇新的出發日期
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary cursor-pointer"
            />
          </div>

          {/* 計算後的新區間 */}
          <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 font-medium block">出發 (Day 1)</span>
              <span className="font-extrabold text-slate-800">{effectiveStartDate} ({dayOfWeekStart})</span>
            </div>
            <ArrowRight size={14} className="text-slate-400" />
            <div className="text-right">
              <span className="text-slate-400 font-medium block">回程 (Day {effectiveTotalDays})</span>
              <span className="font-extrabold text-slate-800">{newEndDateStr} ({dayOfWeekEnd})</span>
            </div>
          </div>
        </div>

        {/* 聯動項目提示 */}
        <div className="flex flex-col gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Clock size={15} className="text-brand-primary shrink-0" />
            <span>每日時間軸日期與星期自動重新推算</span>
          </div>
          <div className="flex items-center gap-2">
            <Plane size={15} className="text-sky-500 shrink-0" />
            <span>機票調度引擎自動切換為新出發日報價</span>
          </div>
          <div className="flex items-center gap-2">
            <Luggage size={15} className="text-emerald-500 shrink-0" />
            <span>行李清單根據新季節氣候智慧調整防護建議</span>
          </div>
        </div>

        {/* 操作按鈕 */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={isSubmitting}
            className="flex-1 py-2.5 rounded-xl bg-brand-primary text-slate-900 text-xs font-black shadow-sm hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
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
