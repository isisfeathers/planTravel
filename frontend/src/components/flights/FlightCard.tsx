'use client';

import React from 'react';
import { Plane, Luggage, ExternalLink, Sparkles } from 'lucide-react';

interface FlightCardProps {
  flight: any;
  verifyingId: string | null;
  onBook: (flight: any) => void;
}

export const FlightCard: React.FC<FlightCardProps> = ({ flight, verifyingId, onBook }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md hover:border-brand-primary/40 transition-all flex flex-col gap-3">
      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
            {flight.outbound?.segments?.[0]?.airline_name || '推薦航班'}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            {flight.outbound?.segments?.[0]?.flight_number}
          </span>
        </div>
        {flight.tag && (
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
            <Sparkles size={12} />
            {flight.tag}
          </span>
        )}
      </div>

      {/* 去程 */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-slate-400 block font-bold">去程出發</span>
          <span className="text-base font-black text-slate-900">{flight.outbound?.departure_time}</span>
          <span className="text-xs text-slate-500 block">{flight.outbound?.segments?.[0]?.departure?.airport_name}</span>
        </div>
        <div className="flex-1 flex flex-col items-center px-2">
          <span className="text-[10px] text-slate-400">{flight.outbound?.duration}</span>
          <div className="w-full h-0.5 bg-slate-200 relative my-1 flex items-center justify-center">
            <Plane size={13} className="text-brand-primary absolute rotate-90" />
          </div>
          <span className="text-[10px] text-emerald-600 font-bold">
            {flight.outbound?.stops === 0 ? '直飛' : `轉機 ${flight.outbound?.stops} 次`}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 block font-bold">去程抵達</span>
          <span className="text-base font-black text-slate-900">{flight.outbound?.arrival_time}</span>
          <span className="text-xs text-slate-500 block">{flight.outbound?.segments?.[0]?.arrival?.airport_name}</span>
        </div>
      </div>

      {/* 回程 */}
      {flight.inbound && (
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-dashed border-slate-100">
          <div>
            <span className="text-[10px] text-slate-400 block font-bold">回程出發</span>
            <span className="text-base font-black text-slate-900">{flight.inbound?.departure_time}</span>
            <span className="text-xs text-slate-500 block">{flight.inbound?.segments?.[0]?.departure?.airport_name}</span>
          </div>
          <div className="flex-1 flex flex-col items-center px-2">
            <span className="text-[10px] text-slate-400">{flight.inbound?.duration}</span>
            <div className="w-full h-0.5 bg-slate-200 relative my-1 flex items-center justify-center">
              <Plane size={13} className="text-brand-primary absolute -rotate-90" />
            </div>
            <span className="text-[10px] text-emerald-600 font-bold">
              {flight.inbound?.stops === 0 ? '直飛' : `轉機 ${flight.inbound?.stops} 次`}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-bold">回程抵達</span>
            <span className="text-base font-black text-slate-900">{flight.inbound?.arrival_time}</span>
            <span className="text-xs text-slate-500 block">{flight.inbound?.segments?.[0]?.arrival?.airport_name}</span>
          </div>
        </div>
      )}

      {/* 底部 */}
      <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <Luggage size={14} className="text-slate-400" />
          <span>{flight.baggage_included}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">含稅來回總價</span>
            <span className="text-base font-black text-rose-600">
              NT$ {Number(flight.price_total_twd || 0).toLocaleString()}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onBook(flight)}
            disabled={verifyingId === flight.id}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-primary text-slate-900 font-black text-xs shadow-sm hover:opacity-90 active:scale-98 transition-all disabled:opacity-50"
          >
            {verifyingId === flight.id ? (
              <>
                <div className="w-3 h-3 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                <span>驗價中…</span>
              </>
            ) : (
              <>
                <span>前往 {flight.provider === 'Skyscanner-Direct' ? 'Skyscanner' : '官方平台'} 訂票</span>
                <ExternalLink size={12} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
