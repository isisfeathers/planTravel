import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { ActivityItem } from '@/types/itinerary';
import { TransitCapsule } from './TransitCapsule';

interface ActivityCardProps {
  activity: ActivityItem;
  index: number;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, index }) => {
  return (
    <Draggable draggableId={activity.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="relative select-none"
        >
          {/* 景點主卡片 */}
          <div
            className={`p-4 rounded-2xl bg-white border transition-shadow duration-200 ${
              snapshot.isDragging
                ? 'shadow-xl ring-2 ring-brand-primary/40 border-brand-primary scale-[1.02] z-50'
                : 'shadow-sm hover:shadow-md border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* 拖曳手把 Icon */}
                <div className="text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing p-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
                  </svg>
                </div>

                <div>
                  <span className="text-xs font-bold text-brand-primary tracking-wide">
                    {activity.time_slot}
                  </span>
                  <h4 className="text-base font-bold text-slate-900 mt-0.5">
                    {activity.location_name}
                  </h4>
                </div>
              </div>

              {/* 預估費用標籤 */}
              {activity.cost_estimate > 0 && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                  約 ${activity.cost_estimate}
                </span>
              )}
            </div>

            {/* 景點描述 */}
            {activity.description && (
              <p className="text-xs text-slate-600 mt-2.5 ml-8 leading-relaxed">
                {activity.description}
              </p>
            )}

            {/* 小叮嚀 */}
            {activity.tips && (
              <div className="mt-2 ml-8 text-xs text-amber-700 bg-amber-50 rounded-lg p-2 flex items-start gap-1.5 border border-amber-200/60">
                <span>💡</span>
                <span>{activity.tips}</span>
              </div>
            )}
          </div>

          {/* 景點之間的交通銜接膠囊 */}
          <TransitCapsule transit={activity.transit_to_next} />
        </div>
      )}
    </Draggable>
  );
};