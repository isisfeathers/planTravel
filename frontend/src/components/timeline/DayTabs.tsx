import React from 'react';
import { DayPlan } from '@/types/itinerary';

interface DayTabsProps {
  days: DayPlan[];
  selectedDay: number;
  onSelectDay: (day: number) => void;
}

export const DayTabs: React.FC<DayTabsProps> = ({ days, selectedDay, onSelectDay }) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 select-none">
      {days.map((day) => {
        const isSelected = day.day_number === selectedDay;
        return (
          <button
            key={day.day_number}
            type="button"
            onClick={() => onSelectDay(day.day_number)}
            className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all shrink-0 ${
              isSelected
                ? 'bg-brand-primary text-white shadow-sm ring-2 ring-brand-primary/40'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Day {day.day_number}
          </button>
        );
      })}
    </div>
  );
};