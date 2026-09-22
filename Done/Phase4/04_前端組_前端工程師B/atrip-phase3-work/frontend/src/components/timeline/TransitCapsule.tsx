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
    <div className="flex items-center gap-3 my-2 ml-6 pl-4 border-l-2 border-dashed border-slate-300 py-1.5">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
        <span>{getTransitIcon()}</span>
        <span>{transit.route_name || transit.instructions}</span>
        <span className="text-slate-400">·</span>
        <span className="text-slate-500 font-semibold">{transit.duration_minutes} 分鐘</span>
      </div>
    </div>
  );
};