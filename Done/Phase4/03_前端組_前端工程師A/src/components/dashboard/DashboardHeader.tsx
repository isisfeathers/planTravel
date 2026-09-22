import React from 'react';
import Link from 'next/link';

export const DashboardHeader: React.FC = () => {
  return (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          我的行程儀表板
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          管理你的 AI 自由行計畫、關注當前旅程與歷史封存
        </p>
      </div>

      <Link
        href="/wizard"
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary text-white font-semibold text-sm shadow-sm hover:opacity-95 active:scale-98 transition-all"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        </svg>
        <span>規劃新旅程</span>
      </Link>
    </header>
  );
};
檔案 5：UI 元件 - 行程區塊容器
路徑：src/components/dashboard/TripSection.tsx
內容：
import React from 'react';
import { ItineraryEntity } from '@/types/itinerary';
import { TripCard } from './TripCard';

interface TripSectionProps {
  title: string;
  description?: string;
  itineraries: ItineraryEntity[];
  activeItineraryId: string | null;
  onSetActive: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  emptyMessage: string;
}

export const TripSection: React.FC<TripSectionProps> = ({
  title,
  description,
  itineraries,
  activeItineraryId,
  onSetActive,
  onArchive,
  onDelete,
  emptyMessage,
}) => {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-bold text-slate-800">{title}</h2>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>

      {itineraries.length === 0 ? (
        <div className="py-10 px-4 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
          <p className="text-sm text-slate-400">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {itineraries.map((itinerary) => (
            <TripCard
              key={itinerary.id}
              itinerary={itinerary}
              isActive={itinerary.id === activeItineraryId}
              onSetActive={onSetActive}
              onArchive={onArchive}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
};