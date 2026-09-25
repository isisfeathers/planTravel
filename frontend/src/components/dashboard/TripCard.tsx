import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ItineraryEntity } from '@/types/itinerary';
import { getDestinationCoverImage } from '@/lib/destinationImages';

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
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { title, destination, status, preference_snapshot, is_archived } = itinerary;
  const [imgSrc, setImgSrc] = useState(() => getDestinationCoverImage(destination, itinerary.id));

  useEffect(() => {
    setImgSrc(getDestinationCoverImage(destination, itinerary.id));
  }, [destination, itinerary.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    setIsExiting(true);
    setTimeout(() => {
      onDelete(itinerary.id);
    }, 250);
  };

  const handleCardClick = () => {
    if (itinerary.status === 'generating') {
      router.push(`/waiting?id=${itinerary.id}`);
    } else {
      router.push(`/canvas?id=${itinerary.id}`);
    }
  };

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
      onClick={handleCardClick}
      className={`relative bg-white rounded-2xl border transition-all duration-200 ease-in-out shadow-sm hover:shadow-lg hover:-translate-y-0.5 cursor-pointer overflow-hidden group ${
        isActive ? 'border-brand-primary ring-2 ring-brand-primary/20' : 'border-slate-200'
      } ${isExiting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
    >
      <div className="h-36 relative p-4 flex flex-col justify-between text-white overflow-hidden bg-slate-900">
        {/* 背景景點照片與暗色微漸層遮罩 */}
        <img
          src={imgSrc}
          alt={destination || '行程封面'}
          onError={() => {
            setImgSrc(getDestinationCoverImage('default', `${itinerary.id}-fallback`));
          }}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/40 to-slate-900/30" />

        <div className="relative z-10 flex justify-between items-start">
          {isActive ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-brand-primary text-slate-900 shadow-sm">
              ★ 當前關注
            </span>
          ) : (
            <span />
          )}

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen((prev) => !prev);
              }}
              className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm transition-colors shadow-sm focus:outline-none"
              aria-label="更多操作"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="19" cy="12" r="1.5" />
                <circle cx="5" cy="12" r="1.5" />
              </svg>
            </button>

            {isMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-30"
                onClick={(e) => e.stopPropagation()}
              >
                {!isActive && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
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
                    onClick={(e) => {
                      e.stopPropagation();
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

        <div className="relative z-10 flex items-center gap-2">
          <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-black/40 backdrop-blur-md text-white shadow-sm border border-white/15">
            📍 {destination || '目的地待定'}
          </span>
          <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-black/40 backdrop-blur-md text-white shadow-sm border border-white/15">
            🗓️ {totalDays} 天
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-2">
        <div className="flex justify-between items-center gap-2">
          <h3 className="font-bold text-slate-900 text-base truncate group-hover:text-brand-primary transition-colors" title={title}>
            {title}
          </h3>
          {getStatusBadge()}
        </div>

        <div className="flex justify-between items-center text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {dateRangeText}
          </span>
          <span className="text-brand-primary font-bold inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
            進入畫布 →
          </span>
        </div>
      </div>
    </div>
  );
};