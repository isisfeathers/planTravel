'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPlan } from '@/types/itinerary';

interface DayTabsProps {
  days: DayPlan[];
  selectedDay: number;
  onSelectDay: (day: number) => void;
}

export const DayTabs: React.FC<DayTabsProps> = ({ days, selectedDay, onSelectDay }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;
    setCanScrollLeft(element.scrollLeft > 2);
    setCanScrollRight(element.scrollLeft + element.clientWidth < element.scrollWidth - 2);
  }, []);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    updateScrollState();
    element.addEventListener('scroll', updateScrollState, { passive: true });
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(element);

    return () => {
      element.removeEventListener('scroll', updateScrollState);
      observer.disconnect();
    };
  }, [days.length, updateScrollState]);

  useEffect(() => {
    const selectedTab = scrollRef.current?.querySelector<HTMLElement>(
      `[data-day-tab="${selectedDay}"]`,
    );
    selectedTab?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [selectedDay]);

  const scrollDays = (direction: -1 | 1) => {
    const element = scrollRef.current;
    if (!element) return;
    element.scrollBy({
      left: direction * Math.max(280, element.clientWidth * 0.72),
      behavior: 'smooth',
    });
  };

  return (
    <div className="flex min-w-0 max-w-full items-center gap-atrip-2">
      <button
        type="button"
        onClick={() => scrollDays(-1)}
        disabled={!canScrollLeft}
        className="atrip-icon-button hidden shrink-0 border border-atrip-border-subtle bg-atrip-surface-card disabled:cursor-not-allowed disabled:opacity-30 md:grid"
        aria-label="查看前面的行程日期"
      >
        <ChevronLeft size={20} aria-hidden="true" />
      </button>

      <div
        ref={scrollRef}
        className="atrip-scrollbar-hidden flex min-w-0 flex-1 snap-x snap-mandatory select-none items-start gap-atrip-2 overflow-x-auto pb-atrip-2"
        aria-label="選擇行程日期"
      >
        {days.map((day) => {
        const isSelected = day.day_number === selectedDay;
        const dateMatch = day.date_label?.match(/^(\d{4})-(\d{2})-(\d{2})/);
        const calendarDate = dateMatch ? `${dateMatch[1]}/${dateMatch[2]}/${dateMatch[3]}` : `第 ${day.day_number} 天`;
        const calendarDay = dateMatch
          ? new Date(Number(dateMatch[1]), Number(dateMatch[2]) - 1, Number(dateMatch[3]), 12)
          : null;
        const weekday = calendarDay && !Number.isNaN(calendarDay.getTime())
          ? ['週日', '週一', '週二', '週三', '週四', '週五', '週六'][calendarDay.getDay()]
          : null;
        return (
          <button
            key={day.day_number}
            data-day-tab={day.day_number}
            type="button"
            onClick={() => onSelectDay(day.day_number)}
            aria-pressed={isSelected}
            className={`atrip-day-tab atrip-focus relative min-h-[76px] min-w-[128px] snap-start shrink-0 rounded-atrip-lg border px-atrip-3 py-atrip-2 text-left transition-atrip duration-atrip ease-atrip motion-reduce:transition-none ${
              isSelected
                ? 'border-atrip-selection-foreground bg-atrip-selection-background text-atrip-selection-foreground shadow-atrip-soft'
                : 'border-atrip-border-subtle bg-atrip-surface-card text-atrip-text-secondary'
            }`}
          >
            <span className="flex items-center justify-between gap-atrip-2 text-atrip-caption font-semibold">
              <span>DAY {day.day_number}</span>
              {weekday ? <span className="rounded-atrip-full bg-atrip-surface-card/70 px-atrip-2 py-0.5 text-atrip-micro">{weekday}</span> : null}
            </span>
            <span className="mt-atrip-2 block whitespace-nowrap text-atrip-caption font-medium">{calendarDate}</span>
            {isSelected ? <span className="atrip-day-tab-indicator" aria-hidden="true" /> : null}
          </button>
        );
        })}
      </div>

      <button
        type="button"
        onClick={() => scrollDays(1)}
        disabled={!canScrollRight}
        className="atrip-icon-button hidden shrink-0 border border-atrip-border-subtle bg-atrip-surface-card disabled:cursor-not-allowed disabled:opacity-30 md:grid"
        aria-label="查看更多行程日期"
      >
        <ChevronRight size={20} aria-hidden="true" />
      </button>
    </div>
  );
};
