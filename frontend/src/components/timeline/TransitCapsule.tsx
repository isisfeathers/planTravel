import React from 'react';
import { TransitStep } from '@/types/itinerary';

interface TransitCapsuleProps {
  transit?: TransitStep;
}

export const TransitCapsule: React.FC<TransitCapsuleProps> = ({ transit }) => {
  if (!transit) return null;

  const getTransitIcon = () => {
    switch (transit.mode) {
      case 'subway':
      case 'train':
        return '🚇';
      case 'bus':
        return '🚌';
      case 'taxi':
      case 'driving':
        return '🚗';
      case 'walking':
      default:
        return '🚶';
    }
  };

  return (
    <div className="flex items-center gap-2 my-2 ml-4 sm:ml-6 pl-3 sm:pl-4 border-l-2 border-dashed border-slate-300 py-1 max-w-full overflow-hidden">
      <div className="inline-flex max-w-full items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-slate-100/90 text-slate-700 text-[11px] sm:text-xs font-medium border border-slate-200 shadow-2xs">
        <span className="shrink-0">{getTransitIcon()}</span>
        <span className="truncate max-w-[200px] sm:max-w-none">{transit.route_name || transit.instructions}</span>
        <span className="text-slate-400 shrink-0">·</span>
        <span className="text-slate-500 font-bold shrink-0">{transit.duration_minutes} 分鐘</span>
      </div>
    </div>
  );
};