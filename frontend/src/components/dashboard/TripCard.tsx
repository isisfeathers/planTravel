import React, { useState, useRef, useEffect } from 'react';
import { ItineraryEntity } from '@/types/itinerary';

interface TripCardProps {
  itinerary: ItineraryEntity;
  isActive: boolean;
  onSetActive: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TripCard: React.FC<TripCardProps> = ({
  itinerary,
  isActive,
  onSetActive,
  onArchive,
  onDelete,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDeleteClick = () => {
    setIsMenuOpen(false);
    setIsExiting(true);
    setTimeout(() => {
      onDelete(itinerary.id);
    }, 250);
  };

  const { title, destination, status, preference_snapshot, is_archived } = itinerary;
  const totalDays = preference_snapshot?.total_days || 1;
  const startDate = preference_snapshot?.start_date;
  const endDate = preference_snapshot?.end_date;
  const dateRangeText = startDate && endDate ? `${startDate} ~ ${endDate}` : '尚未指定出發日期';

  const getStatusBadge = () => {
    switch (status) {
      case 'completed':
        return <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-800">已就緒</span>;
      case 'generating':
        return <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-amber-100 text-amber-800 animate-pulse">AI 生成中</span>;
      case 'failed':
        return <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-rose-100 text-rose-800">生成失敗</span>;
      default:
        return <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600">草稿</span>;
    }
  };

  return (
    <div
      className={`relative bg-white rounded-2xl border transition-all duration-250 ease-in-out shadow-sm hover:shadow-md overflow-hidden ${
        isActive ? 'border-brand-primary ring-2 ring-brand-primary/20' : 'border-slate-200'
      } ${isExiting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
    >
      <div className="h-32 bg-slate-100 relative p-4 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          {isActive ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-brand-primary text-slate-900 font-bold shadow-sm">
              ★ 當前關注
            </span>
          ) : (
            <span />
          )}

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="p-1.5 rounded-full bg-white/80 hover:bg-white text-slate-600 transition-colors shadow-sm focus:outline-none"
              aria-label="更多操作"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="19" cy="12" r="1.5" />
                <circle cx="5" cy="12" r="1.5" />
              </svg>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-20">
                {!isActive && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onSetActive(itinerary.id);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <span>★</span> 設為當前關注
                  </button>
                )}
                {!is_archived && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onArchive(itinerary.id);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <span>📁</span> 封存行程
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                >
                  <span>🗑️</span> 移至垃圾桶
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white/90 text-slate-800 shadow-sm">
            {destination || '目的地待定'}
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white/90 text-slate-800 shadow-sm">
            {totalDays} 天
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-2">
        <div className="flex justify-between items-center gap-2">
          <h3 className="font-bold text-slate-900 text-base truncate" title={title}>
            {title}
          </h3>
          {getStatusBadge()}
        </div>

        <p className="text-xs text-slate-500 flex items-center gap-1.5">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {dateRangeText}
        </p>
      </div>
    </div>
  );
};