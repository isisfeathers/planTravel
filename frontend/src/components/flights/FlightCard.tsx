'use client';

import React from 'react';
import { Plane, Luggage, ExternalLink, Sparkles, Compass } from 'lucide-react';

interface FlightCardProps {
  flight: any;
  verifyingId?: string | null;
  onBook: (flight: any) => void;
}
function formatFlightTime(timeStr?: string) {
  if (!timeStr) return '--:--';
  if (timeStr.includes('T')) {
    try {
      const d = new Date(timeStr);
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch {
      return timeStr.slice(11, 16);
    }
  }
  if (timeStr.length > 10 && timeStr.includes(' ')) {
    return timeStr.split(' ')[1];
  }
  return timeStr;
}

function formatFlightDate(timeStr?: string) {
  if (!timeStr) return '';
  if (timeStr.includes('T')) {
    try {
      const d = new Date(timeStr);
      const m = d.getMonth() + 1;
      const date = d.getDate();
      return `${m}/${date}`;
    } catch {
      return timeStr.slice(5, 10);
    }
  }
  if (timeStr.length >= 10 && timeStr.includes('-')) {
    return timeStr.split(' ')[0].slice(5);
  }
  return '';
}


export const FlightCard: React.FC<FlightCardProps> = ({ flight, verifyingId, onBook }) => {
  const outboundDepDate = formatFlightDate(flight.outbound?.departure_time);
  const outboundDepTime = formatFlightTime(flight.outbound?.departure_time);
  const outboundArrTime = formatFlightTime(flight.outbound?.arrival_time);
  const outboundAircraft = flight.outbound?.segments?.[0]?.aircraft;

  const inboundDepDate = flight.inbound ? formatFlightDate(flight.inbound?.departure_time) : '';
  const inboundDepTime = flight.inbound ? formatFlightTime(flight.inbound?.departure_time) : '';
  const inboundArrTime = flight.inbound ? formatFlightTime(flight.inbound?.arrival_time) : '';

  const providerLabel = flight.provider === 'Apify-GoogleFlights'
    ? 'Google Flights 即時報價'
    : flight.provider === 'Skyscanner-Direct'
    ? 'Skyscanner'
    : '官方合作渠道';

  // 智慧構建 Google Flights 官方即時直達比價 Deep Link（防護確保起訖機場與日期 100% 帶入）
  const buildEffectiveDeepLink = () => {
    const rawUrl = flight.deep_link_url;
    if (rawUrl && (rawUrl.includes('Flights%20to') || rawUrl.includes('flights%20to') || rawUrl.includes('skyscanner'))) {
      return rawUrl;
    }

    const originCode = flight.outbound?.segments?.[0]?.departure?.airport_code || 'TPE';
    const destCode = flight.outbound?.segments?.[flight.outbound?.segments?.length - 1]?.arrival?.airport_code || 
                     flight.gateway_info?.gateway_airport_code || 
                     '';
    
    const outboundDep = flight.outbound?.departure_time || '';
    const depDate = outboundDep.includes('T') ? outboundDep.split('T')[0] : outboundDep.split(' ')[0];
    
    const inboundDep = flight.inbound?.departure_time || '';
    const retDate = inboundDep ? (inboundDep.includes('T') ? inboundDep.split('T')[0] : inboundDep.split(' ')[0]) : '';

    if (destCode && depDate) {
      const depDateQuery = `%20on%20${depDate}`;
      const retDateQuery = retDate ? `%20through%20${retDate}` : '';
      return `https://www.google.com/travel/flights?q=Flights%20to%20${encodeURIComponent(destCode)}%20from%20${encodeURIComponent(originCode)}${depDateQuery}${retDateQuery}&hl=zh-TW&curr=TWD`;
    }

    return rawUrl || 'https://www.google.com/travel/flights';
  };

  const effectiveDeepLink = buildEffectiveDeepLink();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md hover:border-brand-primary/40 transition-all flex flex-col gap-3">
      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
            {flight.outbound?.segments?.[0]?.airline_name || '推薦航班'}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            {flight.outbound?.segments?.[0]?.flight_number}
          </span>
          {outboundAircraft && (
            <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
              · {outboundAircraft}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {flight.tag && (
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <Sparkles size={12} />
              {flight.tag}
            </span>
          )}
          <span className="text-[10px] font-semibold text-slate-400">
            {providerLabel}
          </span>
        </div>
      </div>

      {/* 去程 */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-slate-400 block font-bold">
            去程出發 {outboundDepDate && <span className="text-slate-500">({outboundDepDate})</span>}
          </span>
          <span className="text-base font-black text-slate-900">{outboundDepTime}</span>
          <span className="text-xs text-slate-500 block">{flight.outbound?.segments?.[0]?.departure?.airport_name || flight.outbound?.segments?.[0]?.departure?.airport_code}</span>
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
          <span className="text-base font-black text-slate-900">{outboundArrTime}</span>
          <span className="text-xs text-slate-500 block">{flight.outbound?.segments?.[flight.outbound.segments.length - 1]?.arrival?.airport_name || flight.outbound?.segments?.[0]?.arrival?.airport_code}</span>
        </div>
      </div>

      {/* 回程 */}
      {flight.inbound && (
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-dashed border-slate-100">
          <div>
            <span className="text-[10px] text-slate-400 block font-bold">
              回程出發 {inboundDepDate && <span className="text-slate-500">({inboundDepDate})</span>}
            </span>
            <span className="text-base font-black text-slate-900">{inboundDepTime}</span>
            <span className="text-xs text-slate-500 block">{flight.inbound?.segments?.[0]?.departure?.airport_name || flight.inbound?.segments?.[0]?.departure?.airport_code}</span>
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
            <span className="text-base font-black text-slate-900">{inboundArrTime}</span>
            <span className="text-xs text-slate-500 block">{flight.inbound?.segments?.[flight.inbound.segments.length - 1]?.arrival?.airport_name || flight.inbound?.segments?.[0]?.arrival?.airport_code}</span>
          </div>
        </div>
      )}

      {/* 門戶機場與在地轉乘指引 */}
      {flight.gateway_info && (
        <div className="p-3 rounded-xl bg-emerald-50/90 border border-emerald-200/80 text-xs flex items-start gap-2 shadow-2xs">
          <Compass className="text-emerald-700 shrink-0 mt-0.5" size={16} />
          <div className="flex-1 min-w-0">
            <span className="font-extrabold text-emerald-950 block">
              💡 門戶樞紐轉乘：經由 {flight.gateway_info.gateway_airport_name}
            </span>
            <p className="text-emerald-800 text-[11px] mt-0.5 leading-relaxed font-medium">
              {flight.gateway_info.transit_instruction}（預估時間：{flight.gateway_info.transit_estimated_time}）
            </p>
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
          <a
            href={effectiveDeepLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onBook(flight)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-primary text-slate-900 font-black text-xs shadow-sm hover:brightness-95 active:scale-98 transition-all"
          >
            <span>前往訂票</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
};
