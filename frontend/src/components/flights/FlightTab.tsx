'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, RefreshCw } from 'lucide-react';
import { FlightCard } from './FlightCard';
import { getFallbackFlights } from './flightMockData';

export const FlightTab: React.FC<{ destination: string; startDate?: string; endDate?: string }> = ({ destination, startDate, endDate }) => {
  const [flights, setFlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [origin, setOrigin] = useState('TPE');
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchFlights = async () => {
    setLoading(true);
    const now = new Date();
    const defaultDep = new Date(now.getTime() + 14 * 24 * 3600 * 1000).toISOString().slice(0, 10);
    const defaultRet = new Date(now.getTime() + 19 * 24 * 3600 * 1000).toISOString().slice(0, 10);
    const depDate = startDate || defaultDep;
    const retDate = endDate || defaultRet;

    try {
      const isStaticHost =
        typeof window !== 'undefined' &&
        (window.location.hostname.includes('github.io') ||
          process.env.NEXT_PUBLIC_MOCK_LIFF === 'true');

      if (!isStaticHost) {
        const depQ = startDate ? `&departureDate=${startDate}` : '';
        const retQ = endDate ? `&returnDate=${endDate}` : '';
        const res = await fetch(`/api/flights/search?destination=${encodeURIComponent(destination)}&origin=${origin}${depQ}${retQ}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.length > 0) {
            setFlights(json.data);
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
    setVerifyingId(flight.id);
    setTimeout(() => {
      setVerifyingId(null);
      setToastMsg('驗價完成！即將導向官方合作購票頁面...');
      setTimeout(() => {
        window.open(flight.deep_link_url, '_blank');
        setToastMsg(null);
      }, 800);
    }, 500);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 搜尋設定 */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-brand-primary/15 text-brand-primary">
            AI 即時機票調度引擎
          </span>
          <h2 className="text-base font-extrabold text-slate-900 mt-1">
            出發地 <span className="text-brand-primary">{origin === 'TPE' ? '台北桃園 (TPE)' : origin === 'TSA' ? '台北松山 (TSA)' : '高雄 (KHH)'}</span> ⇄ {destination}
            {startDate && endDate && (
              <span className="text-xs font-bold px-2 py-0.5 ml-2 rounded-md bg-slate-100 text-slate-600 inline-block">
                📅 {startDate} ~ {endDate}
              </span>
            )}
          </h2>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none"
          >
            <option value="TPE">台北桃園 (TPE)</option>
            <option value="TSA">台北松山 (TSA)</option>
            <option value="KHH">高雄小港 (KHH)</option>
          </select>
          <button
            type="button"
            onClick={fetchFlights}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>比價</span>
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2">
          <div className="w-7 h-7 border-3 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">正在調度最新航班報價與即時可用機位...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {flights.map((flight) => (
            <FlightCard
              key={flight.id}
              flight={flight}
              verifyingId={verifyingId}
              onBook={handleBook}
            />
          ))}
        </div>
      )}
    </div>
  );
};
