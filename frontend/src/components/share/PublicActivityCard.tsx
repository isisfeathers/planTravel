'use client';

import type { ActivityItem } from '@/types/itinerary';

interface PublicActivityCardProps {
  activity: ActivityItem;
  isActive?: boolean;
  onSelect?: (activityId: string) => void;
}

export function PublicActivityCard({ activity, isActive = false, onSelect }: PublicActivityCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(activity.id)}
      className={`atrip-focus block min-h-atrip-control w-full rounded-atrip-lg text-left ${isActive ? 'ring-2 ring-atrip-action-primary ring-offset-2' : ''}`}
      aria-current={isActive ? 'true' : undefined}
    >
      <div className="rounded-atrip-lg border border-atrip-border-subtle bg-atrip-surface-card p-atrip-4 shadow-atrip-soft transition-atrip">
        <span className="text-atrip-caption font-bold tracking-wide text-atrip-brand-logo-ai">{activity.time_slot}</span>
        <h3 className="mt-atrip-1 text-atrip-body font-bold text-atrip-text-primary">{activity.location_name}</h3>
        {activity.description ? <p className="mt-atrip-2 text-atrip-caption leading-relaxed text-atrip-text-secondary">{activity.description}</p> : null}
        {activity.tips ? <p className="mt-atrip-2 rounded-atrip-md bg-atrip-surface-subtle p-atrip-2 text-atrip-caption text-atrip-text-secondary">提示：{activity.tips}</p> : null}
      </div>
    </button>
  );
}
