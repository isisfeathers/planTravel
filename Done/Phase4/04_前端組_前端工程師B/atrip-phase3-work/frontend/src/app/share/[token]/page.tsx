'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, Clipboard, MapPinned, Share2 } from 'lucide-react';

import { InteractiveMap } from '@/components/map/InteractiveMapClient';
import { PublicActivityCard } from '@/components/share/PublicActivityCard';
import { ForkButton } from '@/components/share/ForkButton';
import { supabase } from '@/lib/supabaseClient';
import { toDeidentifiedItinerary, type DeidentifiedItinerary, type PublicItineraryRow } from '@/lib/deidentifiedShare';

export default function SharePage({ params }: { params: { token: string } }) {
  const [itinerary, setItinerary] = useState<DeidentifiedItinerary | null>(null);
  const [activeActivityId, setActiveActivityId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      const { data, error: queryError } = await supabase
        .from('itineraries')
        .select('id, share_token, title, destination, status, preference_snapshot, itinerary_data, flight_data')
        .eq('share_token', params.token)
        .eq('is_public', true)
        .is('deleted_at', null)
        .maybeSingle<PublicItineraryRow>();

      if (cancelled) return;
      if (queryError || !data) {
        setError(queryError?.message || '找不到這份公開行程，或分享連結已失效。');
      } else {
        setItinerary(toDeidentifiedItinerary(data));
      }
      setIsLoading(false);
    };

    void load();
    return () => { cancelled = true; };
  }, [params.token]);

  const activities = useMemo(
    () => itinerary?.itinerary_data.daily_itinerary.flatMap((day) => day.activities) ?? [],
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
    document.querySelector(`[data-activity-id="${CSS.escape(activityId)}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  if (isLoading) return <main className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">載入分享行程中…</main>;
  if (error || !itinerary) return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-center text-sm text-rose-700">{error ?? '分享行程不存在。'}</main>;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-primary">Atrip 公開行程</p>
              <h1 className="mt-1 text-2xl font-black text-slate-900">{itinerary.title}</h1>
              <p className="mt-2 flex items-center gap-1 text-sm text-slate-600"><MapPinned size={16} />{itinerary.destination}</p>
            </div>
            <button type="button" onClick={() => void share()} className="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
              {copied ? <Check size={16} /> : <Share2 size={16} />}
              {copied ? '已複製' : '分享連結'}
            </button>
          </div>
          <div className="mt-4"><ForkButton shareToken={itinerary.share_token} /></div>
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

        <section className="flex flex-col gap-3">
          {itinerary.itinerary_data.daily_itinerary.map((day) => (
            <article key={day.day_number} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="font-bold text-slate-900">{day.date_label}</h2>
              <p className="mt-1 text-sm text-slate-500">{day.summary}</p>
              <div className="mt-3 flex flex-col gap-2">
                {day.activities.map((activity, index) => (
                    <div key={activity.id} data-activity-id={activity.id} className={activeActivityId === activity.id ? 'rounded-2xl ring-2 ring-brand-primary' : 'rounded-2xl'}>
                    <PublicActivityCard activity={activity} isActive={activeActivityId === activity.id} onSelect={focusActivity} />
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>

        <footer className="sticky bottom-4 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500"><Clipboard size={14} />公開分享內容已隱藏建立者個資與預算資訊</div>
          <div className="mt-2"><ForkButton shareToken={itinerary.share_token} label="複製到我的行程" /></div>
        </footer>
      </div>
    </main>
  );
}
