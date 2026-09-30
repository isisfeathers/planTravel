import Link from 'next/link';
import { ArrowRight, MapPinned, Sparkles } from 'lucide-react';

import type { ItineraryEntity } from '@/types/itinerary';
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
  featuredFirst?: boolean;
}

export function TripSection({
  title,
  description,
  itineraries,
  activeItineraryId,
  onSetActive,
  onArchive,
  onDelete,
  emptyMessage,
  featuredFirst = false,
}: TripSectionProps) {
  return (
    <section className="flex flex-col gap-atrip-4">
      <div className="flex items-end justify-between gap-atrip-3">
        <div>
          <h2 className="text-atrip-h1 text-atrip-text-primary">{title}</h2>
          {description ? (
            <p className="mt-atrip-1 text-atrip-caption text-atrip-text-secondary">{description}</p>
          ) : null}
        </div>
        {itineraries.length > 1 ? (
          <span className="shrink-0 rounded-atrip-sm bg-atrip-tag-background px-atrip-tag-x py-atrip-tag-y text-atrip-caption text-atrip-tag-foreground">
            {itineraries.length} 趟旅程
          </span>
        ) : null}
      </div>

      {itineraries.length === 0 ? (
        <div className="relative overflow-hidden rounded-atrip-xl border border-atrip-border-subtle bg-atrip-surface-card p-atrip-5 text-center">
          <div className="atrip-empty-route" aria-hidden="true" />
          <span className="relative mx-auto grid h-14 w-14 place-items-center rounded-atrip-full bg-atrip-selection-background text-atrip-brand-logo-ai">
            <MapPinned size={25} />
          </span>
          <p className="relative mt-atrip-3 text-atrip-body font-semibold text-atrip-text-primary">旅程地圖還是空白的</p>
          <p className="relative mx-auto mt-atrip-1 max-w-xs text-atrip-caption text-atrip-text-secondary">{emptyMessage}</p>
          <Link
            href="/wizard"
            className="atrip-compact-secondary relative mx-auto mt-atrip-4 px-atrip-4"
          >
            <Sparkles size={18} aria-hidden="true" />
            建立第一趟旅程
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-atrip-4 sm:grid-cols-2 lg:grid-cols-3">
          {itineraries.map((itinerary, index) => (
            <TripCard
              key={itinerary.id}
              itinerary={itinerary}
              isActive={itinerary.id === activeItineraryId}
              onSetActive={onSetActive}
              onArchive={onArchive}
              onDelete={onDelete}
              featured={featuredFirst && index === 0}
            />
          ))}
        </div>
      )}
    </section>
  );
}
