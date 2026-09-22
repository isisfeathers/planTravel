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
      className={`block w-full rounded-2xl text-left ${isActive ? 'ring-2 ring-brand-primary ring-offset-2' : ''}`}
      aria-current={isActive ? 'true' : undefined}
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
        <span className="text-xs font-bold tracking-wide text-brand-primary">{activity.time_slot}</span>
        <h3 className="mt-1 text-base font-bold text-slate-900">{activity.location_name}</h3>
        {activity.description ? <p className="mt-2 text-xs leading-relaxed text-slate-600">{activity.description}</p> : null}
        {activity.tips ? <p className="mt-2 rounded-lg bg-slate-50 p-2 text-xs text-slate-600">提示：{activity.tips}</p> : null}
      </div>
    </button>
  );
}
