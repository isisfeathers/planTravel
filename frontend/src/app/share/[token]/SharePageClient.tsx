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
import { getDestinationCoverImage } from '@/lib/destinationImages';

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
  const coverImage = getDestinationCoverImage(itinerary?.destination, token);

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
      <main className="flex min-h-screen items-center justify-center bg-atrip-surface-page text-atrip-body font-bold text-atrip-text-secondary">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-atrip-action-primary border-t-transparent motion-reduce:animate-none" />
          <p>載入分享行程中…</p>
        </div>
      </main>
    );
  }

  if (error || !itinerary) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-atrip-surface-page px-atrip-gutter text-center">
        <div className="flex w-full max-w-md flex-col items-center gap-atrip-4 rounded-atrip-xl border border-atrip-border-subtle bg-atrip-surface-card p-atrip-6 shadow-atrip-elevated">
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
              className="atrip-compact-primary min-h-atrip-control flex-1 rounded-atrip-md text-center"
            >
              返回我的儀表板
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-atrip-surface-page px-atrip-gutter py-atrip-4 max-[359px]:px-atrip-gutter-narrow sm:py-atrip-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-atrip-5">
        <header className="relative min-h-60 overflow-hidden rounded-atrip-xl bg-atrip-brand-logo-trp shadow-atrip-soft">
          <img src={coverImage} alt={`${itinerary.destination}行程封面`} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-atrip-brand-logo-trp via-atrip-brand-logo-trp/60 to-transparent" />
          <div className="relative flex min-h-60 items-end justify-between gap-atrip-4 p-atrip-5 text-white sm:p-atrip-6">
            <div>
              <p className="text-atrip-caption font-bold uppercase tracking-wider text-atrip-action-primary">Atrip 公開行程分享</p>
              <h1 className="mt-atrip-1 text-2xl font-bold text-white sm:text-3xl">{itinerary.title}</h1>
              <p className="mt-atrip-2 flex items-center gap-1 text-atrip-body font-bold text-white">
                <MapPinned size={18} className="text-atrip-action-primary" />
                <span>{itinerary.destination}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => void share()}
              className="atrip-focus inline-flex min-h-atrip-icon-button shrink-0 items-center gap-atrip-1 rounded-atrip-full bg-atrip-action-primary px-atrip-3 text-atrip-caption font-bold text-atrip-action-on-primary"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
              <span>{copied ? '已複製連結' : '分享'}</span>
            </button>
          </div>
        </header>

        <section className="overflow-hidden rounded-atrip-xl border border-atrip-border-subtle bg-atrip-surface-card shadow-atrip-soft">
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
            <article key={day.day_number} className="space-y-atrip-3 rounded-atrip-xl border border-atrip-border-subtle bg-atrip-surface-card p-atrip-4 shadow-atrip-soft sm:p-atrip-5">
              <div className="border-b border-atrip-border-subtle pb-atrip-3">
                <span className="rounded-atrip-full bg-atrip-selection-background px-atrip-2 py-atrip-1 text-atrip-micro font-bold uppercase text-atrip-selection-foreground">Day {day.day_number}</span>
                <h2 className="mt-atrip-2 text-atrip-body font-bold text-atrip-text-primary">{day.date_label}</h2>
                <p className="mt-atrip-1 text-atrip-caption leading-relaxed text-atrip-text-secondary">{day.summary}</p>
              </div>
              <div className="flex flex-col gap-2.5 pt-1">
                {day.activities?.map((activity: any) => (
                  <div
                    key={activity.id}
                    data-activity-id={activity.id}
                    className={activeActivityId === activity.id ? 'rounded-atrip-lg ring-2 ring-atrip-action-primary transition-atrip' : 'rounded-atrip-lg transition-atrip'}
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

        <footer className="sticky bottom-atrip-4 flex items-center justify-center rounded-atrip-lg border border-atrip-border-subtle bg-atrip-surface-card/95 p-atrip-3 shadow-atrip-elevated backdrop-blur">
          <div className="flex items-center gap-atrip-2 text-atrip-caption text-atrip-text-secondary">
            <Clipboard size={14} className="text-slate-400" />
            <span>公開分享內容已自動隱藏建立者個資與預算資訊</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
