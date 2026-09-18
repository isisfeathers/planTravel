import React from 'react';
import { DayPlan } from '@/types/itinerary';

interface DayTabsProps {
  days: DayPlan[];
  selectedDay: number;
  onSelectDay: (day: number) => void;
}

export const DayTabs: React.FC<DayTabsProps> = ({ days, selectedDay, onSelectDay }) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      {days.map((day) => {
        const isSelected = day.day_number === selectedDay;
        return (
          <button
            key={day.day_number}
            type="button"
            onClick={() => onSelectDay(day.day_number)}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              isSelected
                ? 'bg-brand-primary text-white shadow-sm'
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