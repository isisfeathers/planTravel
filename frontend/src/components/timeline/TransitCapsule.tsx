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
    <div className="my-atrip-2 ml-atrip-4 flex min-w-0 max-w-full items-center gap-atrip-2 overflow-hidden border-l-2 border-dashed border-atrip-brand-logo-ai py-atrip-1 pl-atrip-3">
      <div className="atrip-transit-flow inline-flex min-w-0 max-w-full items-center gap-atrip-2 rounded-atrip-full bg-atrip-category-photo-background px-atrip-3 py-atrip-1 text-[11px] font-medium text-atrip-category-photo-foreground sm:text-xs">
        <span className="shrink-0">{getTransitIcon()}</span>
        <span className="truncate max-w-[160px] sm:max-w-none min-w-0">{transit.route_name || transit.instructions}</span>
        <span className="text-slate-400 shrink-0">·</span>
        <span className="text-slate-500 font-bold shrink-0">{transit.duration_minutes} 分鐘</span>
      </div>
    </div>
  );
};
