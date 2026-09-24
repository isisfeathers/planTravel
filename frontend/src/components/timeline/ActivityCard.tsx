import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { ActivityItem } from '@/types/itinerary';
import { TransitCapsule } from './TransitCapsule';
import { MapPin } from 'lucide-react';

interface ActivityCardProps {
  activity: ActivityItem;
  index: number;
  isActive?: boolean;
  onSelect?: (activityId: string) => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  index,
  isActive = false,
  onSelect,
}) => {
  const isHotelCheckin =
    activity.category === 'accommodation_checkin' ||
    activity.location_name.includes('飯店') ||
    activity.location_name.includes('Check-in');

  return (
    <Draggable draggableId={activity.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          data-activity-id={activity.id}
          className="relative select-none max-w-full w-full min-w-0"
        >
          {/* 景點/住宿主卡片 */}
          <div
            onClick={() => onSelect?.(activity.id)}
            className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 cursor-pointer min-w-0 max-w-full overflow-hidden ${
              isActive
                ? 'ring-2 ring-brand-primary ring-offset-2 bg-sky-50/40 border-brand-primary/60'
                : isHotelCheckin
                ? 'bg-gradient-to-r from-indigo-50/70 via-white to-white border-indigo-200/80'
                : 'bg-white border-slate-200 hover:border-slate-300'
            } ${
              snapshot.isDragging
                ? 'shadow-xl ring-2 ring-brand-primary/40 border-brand-primary scale-[1.02] z-50'
                : 'shadow-2xs hover:shadow-md'
            }`}
          >
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                {/* 拖曳手把 Icon - 僅在此處綁定 dragHandleProps 與 touch-none 防止手機整頁卡死 */}
                <div
                  {...provided.dragHandleProps}
                  className="text-slate-400 hover:text-slate-600 active:text-brand-primary cursor-grab active:cursor-grabbing p-1 -ml-1 mt-0.5 touch-none shrink-0"
                  title="長按拖曳調整順序"
                  aria-label="拖曳調整順序"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 8h16M4 16h16" />
                  </svg>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="text-xs font-black text-brand-primary tracking-wide">
                      {activity.time_slot}
                    </span>
                    {isHotelCheckin ? (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 flex items-center gap-1">
                        🏨 住宿基地
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        Step {index + 1}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5 truncate" title={activity.location_name}>
                    {activity.location_name}
                  </h4>
                </div>
              </div>

              {/* 預估費用標籤 */}
              <div className="shrink-0 flex items-center gap-1.5">
                {activity.cost_estimate > 0 ? (
                  <span className="text-[11px] sm:text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 whitespace-nowrap">
                    ${activity.cost_estimate}
                  </span>
                ) : isHotelCheckin ? (
                  <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 whitespace-nowrap">
                    已預訂
                  </span>
                ) : null}
              </div>
            </div>

            {/* 景點描述 */}
            {activity.description && (
              <p className="text-xs text-slate-600 mt-2 sm:ml-7 leading-relaxed line-clamp-3 sm:line-clamp-none break-words">
                {activity.description}
              </p>
            )}

            {/* 小叮嚀與地圖捷徑 */}
            <div className="mt-2.5 sm:ml-7 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100/80 min-w-0">
              {activity.tips ? (
                <div className="text-[11px] sm:text-xs text-amber-800 bg-amber-50/80 rounded-lg px-2 py-1 flex items-start gap-1 border border-amber-200/50 min-w-0 flex-1 break-words">
                  <span className="shrink-0">💡</span>
                  <span className="break-words line-clamp-2 sm:line-clamp-none">{activity.tips}</span>
                </div>
              ) : <div />}

              {activity.coordinates && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect?.(activity.id);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-primary hover:text-slate-900 px-2 py-1 rounded-md bg-brand-primary/10 hover:bg-brand-primary/20 transition-colors self-end sm:self-auto shrink-0"
                >
                  <MapPin size={12} />
                  <span>定位景點</span>
                </button>
              )}
            </div>
          </div>

          {/* 景點之間的交通銜接膠囊 */}
          <TransitCapsule transit={activity.transit_to_next} />
        </div>
      )}
    </Draggable>
  );
};
