import React from 'react';
import { DayPlan } from '@/types/itinerary';

interface DayTabsProps {
  days: DayPlan[];
  selectedDay: number;
  onSelectDay: (day: number) => void;
}

export const DayTabs: React.FC<DayTabsProps> = ({ days, selectedDay, onSelectDay }) => {
  return (
    <div className="atrip-scrollbar-hidden flex w-full max-w-full select-none items-start gap-atrip-2 overflow-x-auto pb-atrip-2" aria-label="選擇行程日期">
      {days.map((day) => {
        const isSelected = day.day_number === selectedDay;
        return (
          <button
            key={day.day_number}
            type="button"
            onClick={() => onSelectDay(day.day_number)}
            aria-pressed={isSelected}
            className={`atrip-focus relative min-h-14 min-w-[88px] shrink-0 rounded-atrip-lg border px-atrip-3 py-atrip-2 text-left transition-atrip duration-atrip ease-atrip motion-reduce:transition-none ${
              isSelected
                ? 'border-atrip-selection-foreground bg-atrip-selection-background text-atrip-selection-foreground shadow-atrip-soft'
                : 'border-atrip-border-subtle bg-atrip-surface-card text-atrip-text-secondary'
            }`}
          >
            <span className="block text-atrip-caption font-semibold">DAY {day.day_number}</span>
            <span className="mt-atrip-1 block max-w-28 truncate text-[11px]">{day.date_label || `第 ${day.day_number} 天`}</span>
          </button>
        );
      })}
    </div>
  );
};
