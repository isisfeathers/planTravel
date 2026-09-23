'use client';

import React from 'react';
import { ItineraryPayload } from '@/types/itinerary';

interface PdfPrintViewProps {
  itinerary: ItineraryPayload;
}

export const PdfPrintView: React.FC<PdfPrintViewProps> = ({ itinerary }) => {
  const meta = itinerary.meta || ({} as any);
  const daily = itinerary.daily_itinerary || [];
  const accommodations = itinerary.recommendations?.accommodations || [];
  const transitOverview = itinerary.transit_overview || [];
  const packingList = itinerary.packing_list || [];

  return (
    <div className="print-document hidden print:block text-slate-900 bg-white font-sans text-xs">
      <header className="border-b-2 border-slate-900 pb-3 mb-4 break-inside-avoid">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-brand-primary">Atrip</span>
            <span className="text-xs font-bold text-slate-500">｜ 智慧自由行專屬手冊</span>
          </div>
          <span className="text-xs text-slate-400">A4 列印版</span>
        </div>
        <h1 className="text-xl font-black text-slate-900 mt-2">
          {meta.trip_title || '自由行旅遊行程手冊'}
        </h1>
        <div className="flex flex-wrap items-center gap-4 mt-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <div><strong>📍 目的地：</strong>{meta.destination}</div>
          <div><strong>🗓️ 天數：</strong>{meta.total_days} 天</div>
          {meta.start_date && meta.end_date && (
            <div><strong>📅 日期：</strong>{meta.start_date} ~ {meta.end_date}</div>
          )}
          <div><strong>⚡ 步調：</strong>{meta.pace === 'relaxed' ? '悠閒慢活' : '平衡充實'}</div>
          <div><strong>💰 幣別：</strong>{meta.currency || 'TWD'}</div>
        </div>
      </header>

      {accommodations.length > 0 && (
        <section className="mb-4 break-inside-avoid">
          <div className="border-b border-slate-200 pb-1 mb-2 font-bold text-slate-900">
            🏨 推薦住宿基地 (Basecamp)
          </div>
          <div className="grid grid-cols-1 gap-2">
            {accommodations.map((hotel: any, idx: number) => (
              <div key={idx} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-900">{hotel.name}</h3>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    ★ {hotel.rating} · {hotel.type}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 flex flex-wrap gap-x-4">
                  <span><strong>地址：</strong>{hotel.address}</span>
                  {hotel.approx_cost && <span><strong>價格：</strong>{hotel.approx_cost}</span>}
                </div>
                {hotel.reason && (
                  <p className="text-[11px] text-slate-700 pt-1 border-t border-slate-200/60">
                    <strong>推薦理由：</strong>{hotel.reason}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4 mb-4">
        <div className="border-b-2 border-slate-900 pb-1 mb-3 break-inside-avoid font-bold text-slate-900">
          🗺️ 每日完整行程動線
        </div>
        {daily.map((day) => (
          <div key={day.day_number} className="break-inside-avoid border border-slate-200 rounded-xl p-3 bg-white mb-4">
            <div className="border-b border-slate-200 pb-1.5 mb-2">
              <span className="text-[10px] font-bold text-brand-primary uppercase">DAY {day.day_number}</span>
              <h2 className="text-sm font-bold text-slate-900 mt-0.5">{day.date_label}</h2>
              {day.summary && <p className="text-[11px] text-slate-600 mt-0.5">{day.summary}</p>}
            </div>
            <div className="space-y-2">
              {day.activities?.map((act: any, aIdx: number) => {
                const isAnchor = act.category === 'sports_event' || act.is_time_anchor || act.category === 'concert';
                return (
                  <div key={act.id || aIdx} className="space-y-1">
                    <div className={`p-2.5 rounded-lg border ${isAnchor ? 'border-brand-primary/60 bg-brand-primary/5' : 'border-slate-200 bg-slate-50/40'}`}>
                      <div className="flex justify-between items-start text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-brand-primary font-mono">{act.time_slot}</span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-200 text-slate-700">
                            {act.category === 'sightseeing' ? '觀光' : act.category === 'dining' ? '美食' : act.category === 'shopping' ? '購物' : act.category}
                          </span>
                          {isAnchor && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500 text-slate-900">
                              ⭐ 時間錨點
                            </span>
                          )}
                        </div>
                        {act.cost_estimate ? (
                          <span className="text-slate-500 font-mono">預估 {meta.currency || 'TWD'} {act.cost_estimate}</span>
                        ) : null}
                      </div>
                      <h3 className="font-bold text-slate-900 mt-0.5">{act.location_name}</h3>
                      {act.description && <p className="text-[11px] text-slate-600 mt-0.5">{act.description}</p>}
                      {act.tips && (
                        <p className="text-[10px] text-amber-800 bg-amber-50/80 p-1 rounded border border-amber-200/60 mt-1">
                          💡 <strong>小撇步：</strong>{act.tips}
                        </p>
                      )}
                    </div>
                    {act.transit_to_next && act.transit_to_next.instructions && (
                      <div className="flex items-center gap-1.5 pl-3 text-[11px] text-slate-500">
                        <span>↳ 🚇 交通接駁：</span>
                        <span className="font-medium text-slate-700">
                          {act.transit_to_next.route_name ? `${act.transit_to_next.route_name} · ` : ''}
                          {act.transit_to_next.instructions}
                          {act.transit_to_next.duration_minutes ? ` (${act.transit_to_next.duration_minutes}分)` : ''}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      {transitOverview.length > 0 && (
        <section className="mb-4 break-inside-avoid">
          <div className="border-b border-slate-200 pb-1 mb-2 font-bold text-slate-900">
            🎫 交通票券與動線建議
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {transitOverview.map((t: any, idx: number) => (
              <div key={idx} className="p-2 rounded-lg border border-slate-200 bg-slate-50">
                <div className="font-bold text-slate-900">{t.from_zone} ➔ {t.to_zone}</div>
                <div className="text-brand-primary font-medium">{t.suggested_pass}</div>
                {t.notes && <div className="text-slate-500 text-[10px] mt-0.5">{t.notes}</div>}
              </div>
            ))}
          </div>
        </section>
      )}

      {packingList.length > 0 && (
        <section className="mb-4 break-inside-avoid">
          <div className="border-b border-slate-200 pb-1 mb-2 font-bold text-slate-900">
            🎒 智能行李打包檢查清單
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {['essentials', 'clothing', 'electronics', 'toiletries'].map((cat: string) => {
              const items = packingList.filter((item: any) => item.category === cat);
              if (items.length === 0) return null;
              const label = cat === 'essentials' ? '🛂 必備證件' : cat === 'clothing' ? '👕 衣物防護' : cat === 'electronics' ? '🔌 3C 電子' : '🧴 藥品盥洗';
              return (
                <div key={cat} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/60">
                  <h4 className="font-bold text-slate-800 mb-1 border-b border-slate-200 pb-0.5">{label}</h4>
                  <ul className="space-y-1">
                    {items.map((item: any) => (
                      <li key={item.id} className="flex items-start gap-1.5 text-[10px] text-slate-700">
                        <span className="w-3 h-3 border border-slate-400 rounded-xs inline-block shrink-0 mt-0.5" />
                        <div>
                          <span className="font-medium text-slate-900">{item.item_name}</span>
                          {item.notes && <span className="text-slate-500 block text-[9px]">{item.notes}</span>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <footer className="border-t border-slate-300 pt-2 text-center text-[9px] text-slate-400 break-inside-avoid">
        <span>Atrip 自由行旅遊助理 · 祝您旅途愉快順心！</span>
      </footer>
    </div>
  );
};
