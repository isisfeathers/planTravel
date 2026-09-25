'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, Clipboard, MapPinned, Share2, AlertCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

import { InteractiveMap } from '@/components/map/InteractiveMapClient';
import { PublicActivityCard } from '@/components/share/PublicActivityCard';
import { supabase } from '@/lib/supabaseClient';
import { toDeidentifiedItinerary, type DeidentifiedItinerary, type PublicItineraryRow } from '@/lib/deidentifiedShare';
import mockItinerary from '@/mocks/mock_itinerary.json';

export default function SharePage({ params }: { params?: { token?: string } }) {
  const searchParams = useSearchParams();
  const token = params?.token || searchParams.get('token') || 'demo';

  const [itinerary, setItinerary] = useState<DeidentifiedItinerary | null>(null);
  const [activeActivityId, setActiveActivityId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error: queryError } = await supabase
          .from('itineraries')
          .select('id, share_token, title, destination, status, preference_snapshot, itinerary_data, flight_data')
          .eq('share_token', token)
          .eq('is_public', true)
          .is('deleted_at', null)
          .maybeSingle<PublicItineraryRow>();

        if (cancelled) return;
        if (data) {
          setItinerary(toDeidentifiedItinerary(data));
          setIsLoading(false);
          return;
        }

        if (token === 'demo' || token === 'mock-share-token' || token === 'sample-share-token') {
          const fallbackRow: PublicItineraryRow = {
            id: 'mock-itinerary-id',
            share_token: token,
            title: mockItinerary.meta.trip_title,
            destination: mockItinerary.meta.destination,
            status: 'completed',
            preference_snapshot: {},
            itinerary_data: mockItinerary as any,
            flight_data: [],
          };
          setItinerary(toDeidentifiedItinerary(fallbackRow));
          setIsLoading(false);
          return;
        }

        setError(queryError?.message || '找不到這份公開行程，或分享連結已失效。');
      } catch (err: any) {
        if (!cancelled) setError(err?.message || '載入失敗');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void load();
    return () => { cancelled = true; };
  }, [token]);

  const activities = useMemo(
    () => itinerary?.itinerary_data?.daily_itinerary?.flatMap((day) => day.activities || []) ?? [],
    [itinerary],
  );

  const sharePageUrl = typeof window === 'undefined' ? '' : window.location.href;

  const share = async () => {
    if (!sharePageUrl) return;
    if (navigator.share) {
      await navigator.share({ title: itinerary?.title ?? 'Atrip 行程分享', url: sharePageUrl });
      return;
    }
    await navigator.clipboard.writeText(sharePageUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2_000);
  };

  const focusActivity = (activityId: string) => {
    setActiveActivityId(activityId);
    try {
      const escaped = typeof CSS !== 'undefined' && typeof CSS.escape === 'function' ? CSS.escape(activityId) : activityId.replace(/["\\]/g, '\\$&');
      document.querySelector(`[data-activity-id="${escaped}"]`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (e) {}
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-sm font-bold text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <p>載入分享行程中…</p>
        </div>
      </main>
    );
  }

  if (error || !itinerary) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-center">
        <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl border border-slate-200 flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-base font-bold text-slate-900">無法開啟行程分享</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            {error ?? '此行程可能已被設定為非公開，或是分享網址已失效。'}
          </p>
          <div className="flex gap-2 w-full pt-2">
            <Link
              href="/dashboard"
              className="flex-1 py-2 px-3 rounded-xl bg-brand-primary text-slate-900 font-bold text-xs hover:brightness-95 transition-all text-center"
            >
              返回我的儀表板
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-primary">Atrip 公開行程分享</p>
              <h1 className="mt-1 text-xl sm:text-2xl font-black text-slate-900">{itinerary.title}</h1>
              <p className="mt-2 flex items-center gap-1 text-sm text-slate-600 font-bold">
                <MapPinned size={16} className="text-brand-primary" />
                <span>{itinerary.destination}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => void share()}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
              <span>{copied ? '已複製連結' : '分享'}</span>
            </button>
          </div>
        </header>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <InteractiveMap
            activities={activities.map((activity) => ({
              id: activity.id,
              name: activity.location_name,
              timeSlot: activity.time_slot,
              coordinates: activity.coordinates,
            }))}
            activeActivityId={activeActivityId}
            onActivitySelect={focusActivity}
            className="h-[300px] w-full sm:h-[420px]"
          />
        </section>

        <section className="flex flex-col gap-4">
          {itinerary.itinerary_data?.daily_itinerary?.map((day) => (
            <article key={day.day_number} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <div className="border-b border-slate-100 pb-2">
                <span className="text-[11px] font-bold text-brand-primary uppercase">Day {day.day_number}</span>
                <h2 className="text-base font-bold text-slate-900 mt-0.5">{day.date_label}</h2>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">{day.summary}</p>
              </div>
              <div className="flex flex-col gap-2.5 pt-1">
                {day.activities?.map((activity: any) => (
                  <div
                    key={activity.id}
                    data-activity-id={activity.id}
                    className={activeActivityId === activity.id ? 'rounded-2xl ring-2 ring-brand-primary transition-all' : 'rounded-2xl transition-all'}
                  >
                    <PublicActivityCard
                      activity={activity}
                      isActive={activeActivityId === activity.id}
                      onSelect={focusActivity}
                    />
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>

        <footer className="sticky bottom-4 rounded-2xl border border-slate-200 bg-white/95 p-3.5 shadow-lg backdrop-blur flex items-center justify-center">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clipboard size={14} className="text-slate-400" />
            <span>公開分享內容已自動隱藏建立者個資與預算資訊</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
