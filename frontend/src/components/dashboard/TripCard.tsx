'use client';

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  Archive,
  ArrowRight,
  CalendarDays,
  Clock3,
  MapPin,
  MoreHorizontal,
  Star,
  Trash2,
} from 'lucide-react';

import { getDestinationCoverImage } from '@/lib/destinationImages';
import type { ItineraryEntity } from '@/types/itinerary';

interface TripCardProps {
  itinerary: ItineraryEntity;
  isActive: boolean;
  onSetActive: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  featured?: boolean;
}

function formatDateRange(startDate?: string, endDate?: string) {
  if (!startDate || !endDate) return '日期由 AI 協助安排';

  const formatter = new Intl.DateTimeFormat('zh-TW', {
    month: 'numeric',
    day: 'numeric',
  });
  return `${formatter.format(new Date(startDate))} — ${formatter.format(new Date(endDate))}`;
}

function getDepartureLabel(startDate?: string) {
  if (!startDate) return null;
  const start = new Date(`${startDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.ceil((start.getTime() - today.getTime()) / 86_400_000);

  if (days > 0) return `距離出發 ${days} 天`;
  if (days === 0) return '今天出發';
  return null;
}

export function TripCard({
  itinerary,
  isActive,
  onSetActive,
  onArchive,
  onDelete,
  featured = false,
}: TripCardProps) {
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
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDeleteClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setIsMenuOpen(false);
    setIsExiting(true);
    window.setTimeout(() => onDelete(itinerary.id), 220);
  };

  const openItinerary = () => {
    router.push(
      itinerary.status === 'generating'
        ? `/waiting?id=${itinerary.id}`
        : `/canvas?id=${itinerary.id}`,
    );
  };

  const totalDays = preference_snapshot?.total_days || 1;
  const startDate = preference_snapshot?.start_date;
  const endDate = preference_snapshot?.end_date;
  const departureLabel = getDepartureLabel(startDate);

  const statusBadge = {
    completed: '已就緒',
    generating: 'AI 規劃中',
    failed: '需要重試',
    draft: '草稿',
  }[status];

  return (
    <article
      className={`atrip-trip-card group relative overflow-hidden rounded-atrip-xl border bg-atrip-surface-card transition-[border-color,box-shadow,opacity] duration-atrip ease-atrip motion-reduce:transition-none ${
        featured ? 'sm:col-span-2 lg:col-span-3' : ''
      } ${
        isActive
          ? 'border-atrip-selection-foreground shadow-atrip-soft'
          : 'border-atrip-border-subtle'
      } ${isExiting ? 'opacity-0' : 'opacity-100'}`}
    >
      <button
        type="button"
        onClick={openItinerary}
        className="atrip-focus absolute inset-0 z-10 cursor-pointer rounded-atrip-xl"
        aria-label={`開啟${title}`}
      />
      <div className={featured ? 'sm:grid sm:grid-cols-[1.35fr_1fr]' : ''}>
        <div className={`relative overflow-hidden bg-atrip-brand-logo-trp ${featured ? 'h-52 sm:h-64' : 'h-44'}`}>
          <img
            src={imgSrc}
            alt={`${destination || '目的地'}景色`}
            onError={() => setImgSrc(getDestinationCoverImage('default', `${itinerary.id}-fallback`))}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-atrip-brand-logo-trp via-atrip-brand-logo-trp/30 to-transparent" />

          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-atrip-2 p-atrip-4">
            <div className="flex flex-wrap gap-atrip-2">
              {isActive ? (
                <span className="inline-flex items-center gap-atrip-1 rounded-atrip-full bg-atrip-action-primary px-atrip-3 py-atrip-1 text-atrip-caption font-semibold text-atrip-action-on-primary">
                  <Star size={13} fill="currentColor" aria-hidden="true" />
                  當前關注
                </span>
              ) : null}
              {departureLabel ? (
                <span className="rounded-atrip-full bg-atrip-surface-card px-atrip-3 py-atrip-1 text-atrip-caption font-semibold text-atrip-text-primary">
                  {departureLabel}
                </span>
              ) : null}
            </div>

            <div className="relative z-20 shrink-0" ref={menuRef}>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setIsMenuOpen((value) => !value);
                }}
                className="atrip-focus grid h-11 w-11 place-items-center rounded-atrip-full border border-white/30 bg-atrip-brand-logo-trp/70 text-white backdrop-blur-sm"
                aria-label={`管理${title}`}
                aria-expanded={isMenuOpen}
              >
                <MoreHorizontal size={20} aria-hidden="true" />
              </button>

              {isMenuOpen ? (
                <div
                  className="atrip-motion-reveal absolute right-0 z-30 mt-atrip-2 w-52 rounded-atrip-md border border-atrip-border-subtle bg-atrip-surface-card p-atrip-1 shadow-atrip-popover"
                  onClick={(event) => event.stopPropagation()}
                >
                  {!isActive ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onSetActive(itinerary.id);
                      }}
                      className="atrip-focus atrip-menu-item flex min-h-11 w-full items-center gap-atrip-2 rounded-atrip-sm px-atrip-3 text-left text-atrip-body text-atrip-text-primary"
                    >
                      <Star size={18} aria-hidden="true" />
                      設為當前關注
                    </button>
                  ) : null}
                  {!is_archived ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onArchive(itinerary.id);
                      }}
                      className="atrip-focus atrip-menu-item flex min-h-11 w-full items-center gap-atrip-2 rounded-atrip-sm px-atrip-3 text-left text-atrip-body text-atrip-text-primary"
                    >
                      <Archive size={18} aria-hidden="true" />
                      封存行程
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={handleDeleteClick}
                    className="atrip-focus atrip-menu-item flex min-h-11 w-full items-center gap-atrip-2 rounded-atrip-sm px-atrip-3 text-left text-atrip-body text-atrip-text-secondary"
                  >
                    <Trash2 size={18} aria-hidden="true" />
                    移至垃圾桶
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-atrip-4 text-white">
            <div className="flex items-center gap-atrip-2 text-atrip-caption">
              <MapPin size={15} className="text-atrip-action-primary" aria-hidden="true" />
              {destination || '目的地待定'}
            </div>
            <h3 className={`mt-atrip-1 font-bold ${featured ? 'text-xl leading-7' : 'text-atrip-h2'}`}>{title}</h3>
          </div>
        </div>

        <div className={`flex flex-col justify-between p-atrip-4 ${featured ? 'sm:p-atrip-6' : ''}`}>
          <div>
            <div className="flex flex-wrap items-center gap-atrip-2">
              <span className="rounded-atrip-sm bg-atrip-tag-background px-atrip-tag-x py-atrip-tag-y text-atrip-caption text-atrip-tag-foreground">
                {statusBadge}
              </span>
              <span className="inline-flex items-center gap-atrip-1 rounded-atrip-sm bg-atrip-tag-background px-atrip-tag-x py-atrip-tag-y text-atrip-caption text-atrip-tag-foreground">
                <Clock3 size={13} aria-hidden="true" />
                {totalDays} 天
              </span>
            </div>
            {featured ? (
              <p className="mt-atrip-4 text-atrip-body text-atrip-text-secondary">
                這是 LINE 旅遊助理目前優先關注的旅程。開啟後可查看每日路線、機票與行李清單。
              </p>
            ) : null}
          </div>

          <div className={`mt-atrip-4 flex items-center justify-between gap-atrip-3 border-t border-atrip-border-subtle pt-atrip-3 ${featured ? 'sm:mt-atrip-6' : ''}`}>
            <span className="inline-flex min-w-0 items-center gap-atrip-1 text-atrip-caption text-atrip-text-secondary">
              <CalendarDays size={15} className="shrink-0" aria-hidden="true" />
              <span className="truncate">{formatDateRange(startDate, endDate)}</span>
            </span>
            <span className="inline-flex shrink-0 items-center gap-atrip-1 text-atrip-body font-semibold text-atrip-brand-logo-ai">
              查看行程
              <ArrowRight size={17} aria-hidden="true" />
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
