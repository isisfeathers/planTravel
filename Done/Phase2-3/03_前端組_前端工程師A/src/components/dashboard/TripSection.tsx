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