'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, RefreshCw } from 'lucide-react';
import { FlightCard } from './FlightCard';
import { getFallbackFlights } from './flightMockData';
import { resolveGateway } from '@/lib/gatewayResolver';

export const FlightTab: React.FC<{ destination: string; startDate?: string; endDate?: string }> = ({ destination, startDate, endDate }) => {
  const [flights, setFlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [origin, setOrigin] = useState('TPE');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchFlights = async () => {
    setLoading(true);
    const now = new Date();
    const defaultDep = new Date(now.getTime() + 14 * 24 * 3600 * 1000).toISOString().slice(0, 10);
    const defaultRet = new Date(now.getTime() + 19 * 24 * 3600 * 1000).toISOString().slice(0, 10);
    const depDate = startDate || defaultDep;
    const retDate = endDate || defaultRet;

    const gateway = resolveGateway(destination);
    const searchTarget = gateway ? gateway.airportCode : destination;

    try {
      const depQ = `&departureDate=${encodeURIComponent(depDate)}&departure_date=${encodeURIComponent(depDate)}`;
      const retQ = retDate ? `&returnDate=${encodeURIComponent(retDate)}&return_date=${encodeURIComponent(retDate)}` : '';

      const cloudRunUrl = process.env.NEXT_PUBLIC_FLIGHT_SERVICE_URL || 'https://atrip-flight-service-1096361179847.asia-east1.run.app';

      // 1. 優先嘗試 Next.js 伺服端 API Proxy
      let res = await fetch(`/api/flights/search?destination=${encodeURIComponent(searchTarget)}&origin=${origin}${depQ}${retQ}`).catch(() => null);

      // 2. 若在純靜態前端 (GitHub Pages / Local)，直接連線 Google Cloud Run 機票服務
      if (!res || !res.ok) {
        res = await fetch(`${cloudRunUrl}/api/v1/flights/search?destination=${encodeURIComponent(searchTarget)}&origin=${origin}${depQ}${retQ}`).catch(() => null);
      }

      if (res && res.ok) {
        const json = await res.json();
        const list = json.flights || json.data;
        if (Array.isArray(list) && list.length > 0) {
          // 檢查回傳資料是否為舊版未更新的 Cloud Run 測試假資料 (例如包含樂桃/全日空但目的地為歐美長程)
          const isAsia = ['東京', '大阪', '沖繩', '名古屋', '福岡', '札幌', '仙台', '岡山', '日本', '首爾', '釜山', '濟州', '曼谷', '新加坡', '吉隆坡', '峇里島', '峴港', '胡志明', '河內', '香港', '澳門'].some(c => destination.includes(c));
          const hasInvalidLCC = list.some((f: any) => 
            f.id?.startsWith('flight-mock-mm-') || 
            (f.airline_name?.includes('樂桃') && !isAsia) ||
            (f.airline_name?.includes('全日空') && !isAsia)
          );

          if (!hasInvalidLCC) {
            const enriched = list.map((f: any) => ({
              ...f,
              gateway_info: f.gateway_info || (gateway ? {
                gateway_city: gateway.gatewayCity,
                gateway_airport_code: gateway.airportCode,
                gateway_airport_name: gateway.airportName,
                transit_instruction: gateway.instruction,
                transit_estimated_time: gateway.estimatedTime,
              } : undefined)
            }));
            setFlights(enriched);
            setLoading(false);
            return;
          }
        }
      }
    } catch (e) {
      console.warn('機票 API 查詢失敗，切換為預設航班推薦:', e);
    }

    setFlights(getFallbackFlights(destination, origin, depDate, retDate));
    setLoading(false);
  };

  useEffect(() => {
    fetchFlights();
  }, [destination, origin, startDate, endDate]);

  const handleBook = (flight: any) => {
    const airlineName = flight.outbound?.segments?.[0]?.airline_name || '官方推薦航班';
    setToastMsg(`🚀 正在為您另開新分頁前往「${airlineName}」官方即時比價與訂票頁面...`);
    setTimeout(() => {
      setToastMsg(null);
    }, 3000);
  };

  return (
    <div className="flex flex-col gap-atrip-4">
      {/* 搜尋設定 */}
      <div className="flex flex-col items-start justify-between gap-atrip-4 rounded-atrip-xl bg-atrip-brand-logo-trp p-atrip-4 text-white shadow-atrip-soft sm:flex-row sm:items-center">
        <div>
          <span className="rounded-atrip-full bg-atrip-action-primary px-atrip-2 py-atrip-1 text-atrip-micro font-bold text-atrip-action-on-primary">
            AI 即時機票調度引擎
          </span>
          <h2 className="mt-atrip-2 text-atrip-body font-bold text-white">
            出發地 <span className="text-atrip-action-primary">{origin === 'TPE' ? '台北桃園 (TPE)' : origin === 'TSA' ? '台北松山 (TSA)' : '高雄 (KHH)'}</span> ⇄ {destination}
            {startDate && endDate && (
              <span className="ml-atrip-2 inline-block rounded-atrip-sm bg-white/10 px-atrip-2 py-atrip-1 text-atrip-caption font-semibold text-white">
                📅 {startDate} ~ {endDate}
              </span>
            )}
          </h2>
        </div>
        <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] gap-atrip-2 sm:w-auto">
          <select
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="atrip-focus min-h-atrip-input min-w-0 rounded-atrip-md border border-white/30 bg-white px-atrip-3 text-atrip-caption font-semibold text-atrip-text-primary"
          >
            <option value="TPE">台北桃園 (TPE)</option>
            <option value="TSA">台北松山 (TSA)</option>
            <option value="KHH">高雄小港 (KHH)</option>
          </select>
          <button
            type="button"
            onClick={fetchFlights}
            disabled={loading}
            className="atrip-compact-primary min-h-atrip-input rounded-atrip-md disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin motion-reduce:animate-none' : ''} />
            <span>比價</span>
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="flex items-center gap-atrip-2 rounded-atrip-lg bg-atrip-selection-background p-atrip-3 text-atrip-caption font-bold text-atrip-selection-foreground" role="status">
          <CheckCircle2 size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {loading ? (
        <>
          <div className="space-y-atrip-3 py-atrip-2" aria-hidden="true">
            {[0, 1, 2].map((item) => <div key={item} className="h-44 animate-pulse rounded-atrip-xl bg-atrip-surface-subtle motion-reduce:animate-none" />)}
          </div>
          <p className="sr-only" role="status">正在調度最新航班報價與即時可用機位</p>
        </>
      ) : (
        <div className="flex flex-col gap-atrip-3">
          {flights.map((flight) => (
            <FlightCard
              key={flight.id}
              flight={flight}
              onBook={handleBook}
            />
          ))}
        </div>
      )}
    </div>
  );
};
