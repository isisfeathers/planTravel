"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BedDouble,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronUp,
  CircleDot,
  LoaderCircle,
  MapPin,
  ShoppingBag,
  Sparkles,
  TrainFront,
  Trophy,
} from "lucide-react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  useWizardStore,
  type PresetBundleId,
} from "@/stores/useWizardStore";
import { PreferenceChip } from "./PreferenceChip";
import { PresetCard } from "./PresetCard";

const presetOptions = [
  {
    id: "classic_bundle",
    title: "平台推薦經典遊",
    description: "均衡、省心",
    icon: Trophy,
  },
  {
    id: "shopping_bundle",
    title: "都會潮流",
    description: "購物、美食",
    icon: ShoppingBag,
  },
  {
    id: "sports_bundle",
    title: "運動賽事",
    description: "賽程優先",
    icon: CircleDot,
  },
] as const;

const interestOptions = [
  { id: "gourmet", label: "主題美食", category: "food" },
  { id: "cultural", label: "古蹟文化", category: "culture" },
  { id: "shopping", label: "購物", category: "neutral" },
] as const;

const bundleNames: Readonly<Record<PresetBundleId, string>> = {
  classic_bundle: "平台推薦經典遊",
  shopping_bundle: "都會潮流",
  sports_bundle: "運動賽事",
};

function getSummaryLabels(wizard: ReturnType<typeof useWizardStore.getState>) {
  const labels = [
    `📍 ${wizard.destination} · ${wizard.totalDays} 天`,
    wizard.accommodation === "single_hotel" ? "連住同一間" : "隨景點換宿",
    wizard.transit === "public_transit" ? "大眾捷運" : "租車自駕",
  ];

  if (wizard.interests.includes("gourmet")) labels.push("在地美食");
  if (wizard.interests.includes("cultural")) labels.push("古蹟文化");
  if (wizard.interests.includes("shopping")) labels.push("購物");
  if (wizard.pace === "relaxed") labels.push("慢慢走");

  return labels;
}

const POPULAR_DESTINATIONS = [
  { label: "🇯🇵 東京", value: "東京" },
  { label: "🇯🇵 京阪神", value: "京都與大阪" },
  { label: "🇯🇵 沖繩", value: "沖繩" },
  { label: "🇰🇷 首爾", value: "首爾" },
  { label: "🇹🇭 曼谷", value: "曼谷" },
  { label: "🇫🇷 巴黎", value: "巴黎" },
  { label: "🇬🇧 倫敦", value: "倫敦" },
  { label: "🇮🇸 冰島", value: "冰島雷克雅維克" },
];

const POPULAR_DAYS = [
  { label: "3 天 2 夜", value: 3 },
  { label: "5 天 4 夜", value: 5 },
  { label: "7 天 6 夜", value: 7 },
  { label: "10 天探索", value: 10 },
];

export function WizardHeadlessForm() {
  const router = useRouter();
  const wizard = useWizardStore();
  const [activePreset, setActivePreset] =
    useState<PresetBundleId>("classic_bundle");
  const [isFineTuneExpanded, setIsFineTuneExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const summaryLabels = getSummaryLabels(wizard);
  const sportsModeEnabled = wizard.interests.includes("sports");
  const selectedCount =
    2 +
    interestOptions.filter((option) => wizard.interests.includes(option.id))
      .length +
    (wizard.pace === "relaxed" ? 1 : 0) +
    (sportsModeEnabled ? 1 : 0);

  function handlePresetSelect(bundle: PresetBundleId) {
    setActivePreset(bundle);
    wizard.applyBundle(bundle);
    setIsFineTuneExpanded(bundle === "sports_bundle");
    setSubmitError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const preferenceSnapshot = wizard.buildPreferenceSnapshot();
      const { user } = useAuthStore.getState();
      const userId = user?.id || "11111111-1111-1111-1111-111111111111"; // Fallback to mock

      // Bypass RLS, directly call our server API
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          destination: preferenceSnapshot.destination,
          total_days: preferenceSnapshot.total_days,
          preferenceSnapshot: preferenceSnapshot
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "伺服器建立行程失敗");
      }

      const resData = await response.json();
      if (!resData.id) {
        throw new Error("伺服器未回傳行程 ID");
      }

      router.push(`/waiting/${resData.id}`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "建立行程失敗。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-[430px] bg-atrip-surface-page">
      <header className="flex min-h-atrip-nav items-center justify-between border-b border-atrip-border-subtle bg-atrip-surface-card px-atrip-gutter max-[359px]:px-atrip-gutter-narrow">
        <div className="flex items-center gap-atrip-2">
          <button
            type="button"
            className="atrip-icon-button bg-atrip-selection-background text-atrip-brand-logo-ai"
            aria-label="返回儀表板"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft aria-hidden="true" size={20} />
          </button>
          <span className="text-atrip-h2 font-bold text-slate-800">建立新旅程</span>
        </div>
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="text-xs font-bold px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
        >
          🗂️ 我的行程
        </button>
      </header>

      <form
        onSubmit={handleSubmit}
        aria-label="Atrip 雙層標籤精靈"
        className="pb-[calc(7rem+env(safe-area-inset-bottom))]"
      >
        <main className="px-atrip-gutter py-atrip-6 max-[359px]:px-atrip-gutter-narrow">
          <div>
            <h1 className="text-atrip-h1">開始規劃你的專屬自由行</h1>
            <p className="mt-atrip-1 text-atrip-body text-atrip-text-secondary">
              選擇目的地與天數，由 AI 旅遊管家為您量身打造行程。
            </p>
          </div>

          {/* 目的地與天數客製區塊 */}
          <section className="mt-atrip-5 rounded-atrip-xl border border-atrip-border-subtle bg-atrip-surface-card p-atrip-4 shadow-sm">
            <label className="flex items-center gap-atrip-2 text-atrip-h2 font-bold text-slate-900">
              <MapPin aria-hidden="true" size={18} className="text-atrip-brand-logo-ai" />
              想去哪座城市？
            </label>
            
            {/* 快速熱門推薦標籤 */}
            <div className="mt-atrip-2 flex flex-wrap gap-atrip-2">
              {POPULAR_DESTINATIONS.map((dest) => (
                <button
                  key={dest.value}
                  type="button"
                  onClick={() => wizard.setField("destination", dest.value)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                    wizard.destination === dest.value
                      ? "bg-brand-primary text-white shadow-sm ring-2 ring-brand-primary/30"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {dest.label}
                </button>
              ))}
            </div>

            {/* 自訂輸入城市 */}
            <div className="mt-atrip-3">
              <input
                type="text"
                value={wizard.destination}
                onChange={(e) => wizard.setField("destination", e.target.value)}
                placeholder="或輸入任何想去的城市（如：北海道、巴黎、羅馬、曼谷）"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
              />
            </div>

            {/* 行程天數 */}
            <div className="mt-atrip-4 border-t border-slate-100 pt-atrip-3">
              <label className="flex items-center gap-atrip-2 text-xs font-bold text-slate-600">
                <CalendarDays aria-hidden="true" size={16} className="text-atrip-brand-logo-ai" />
                規劃天數
              </label>
              <div className="mt-atrip-2 flex flex-wrap gap-atrip-2">
                {POPULAR_DAYS.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => {
                      wizard.setField("totalDays", d.value);
                      if (wizard.startDate) {
                        const start = new Date(wizard.startDate);
                        const end = new Date(start.getTime() + (d.value - 1) * 24 * 3600 * 1000);
                        wizard.setField("endDate", end.toISOString().slice(0, 10));
                      }
                    }}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                      wizard.totalDays === d.value
                        ? "bg-brand-primary text-white font-bold"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 出發日期設定 */}
            <div className="mt-atrip-4 border-t border-slate-100 pt-atrip-3">
              <div className="flex justify-between items-center mb-1.5">
                <label className="flex items-center gap-atrip-2 text-xs font-bold text-slate-700">
                  <CalendarDays aria-hidden="true" size={16} className="text-atrip-brand-logo-ai" />
                  出發日期設定
                </label>
                <span className="text-[11px] font-medium text-slate-500">
                  {wizard.startDate && wizard.endDate ? `${wizard.startDate} ~ ${wizard.endDate}` : 'AI 推薦出發時機'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    wizard.setField("startDate", undefined);
                    wizard.setField("endDate", undefined);
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                    !wizard.startDate
                      ? "border-brand-primary bg-brand-primary/10 text-slate-900 ring-1 ring-brand-primary"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span className="block">✨ 尚未確定日期</span>
                  <span className="text-[10px] font-normal text-slate-500">由 AI 安排最合適季節與航班</span>
                </button>

                <div className={`p-2.5 rounded-xl border transition-all ${
                  wizard.startDate ? "border-brand-primary bg-white ring-1 ring-brand-primary" : "border-slate-200 bg-slate-50"
                }`}>
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">📅 指定出發日期</label>
                  <input
                    type="date"
                    min={new Date().toISOString().slice(0, 10)}
                    value={wizard.startDate || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val) {
                        const start = new Date(val);
                        const end = new Date(start.getTime() + (wizard.totalDays - 1) * 24 * 3600 * 1000);
                        wizard.setField("startDate", val);
                        wizard.setField("endDate", end.toISOString().slice(0, 10));
                      } else {
                        wizard.setField("startDate", undefined);
                        wizard.setField("endDate", undefined);
                      }
                    }}
                    className="w-full text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="mt-atrip-6" aria-labelledby="preset-title">
            <div className="flex items-center justify-between gap-atrip-3">
              <h2 id="preset-title" className="text-atrip-h2">
                第一層｜懶人套版
              </h2>
              <span className="shrink-0 text-atrip-caption text-atrip-text-secondary">
                左右滑動
              </span>
            </div>

            <div className="atrip-scrollbar-hidden -mx-atrip-gutter mt-atrip-3 flex snap-x snap-mandatory gap-atrip-3 overflow-x-auto px-atrip-gutter pb-atrip-2 max-[359px]:-mx-atrip-gutter-narrow max-[359px]:px-atrip-gutter-narrow">
              {presetOptions.map((preset) => (
                <PresetCard
                  key={preset.id}
                  {...preset}
                  selected={activePreset === preset.id}
                  onSelect={handlePresetSelect}
                />
              ))}
            </div>
          </section>

          <section className="mt-atrip-6" aria-labelledby="fine-tune-title">
            <div className="flex items-center justify-between gap-atrip-3">
              <h2 id="fine-tune-title" className="text-atrip-h2">
                第二層｜{isFineTuneExpanded ? "微調" : "推薦細節"}
              </h2>
              {isFineTuneExpanded ? (
                <button
                  type="button"
                  aria-expanded="true"
                  aria-controls="fine-tune-panel"
                  className="atrip-focus inline-flex min-h-atrip-icon-button items-center gap-atrip-1 rounded-atrip-md px-atrip-2 text-atrip-body text-atrip-brand-logo-ai"
                  onClick={() => setIsFineTuneExpanded(false)}
                >
                  收合
                  <ChevronUp aria-hidden="true" size={18} />
                </button>
              ) : null}
            </div>

            {!isFineTuneExpanded ? (
              <button
                type="button"
                aria-expanded="false"
                aria-controls="fine-tune-panel"
                className="atrip-focus mt-atrip-3 w-full rounded-atrip-xl border border-atrip-border-subtle bg-atrip-surface-card p-atrip-4 text-left"
                onClick={() => setIsFineTuneExpanded(true)}
              >
                <span className="flex items-start justify-between gap-atrip-3">
                  <span>
                    <span className="block text-atrip-h2">已套用推薦組合</span>
                    <span className="mt-atrip-1 block text-atrip-body text-atrip-text-secondary">
                      不用再填資料，直接開始也可以。
                    </span>
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-atrip-1 text-atrip-body text-atrip-brand-logo-ai">
                    微調
                    <ChevronDown aria-hidden="true" size={18} />
                  </span>
                </span>
                <span className="mt-atrip-3 flex flex-wrap gap-atrip-2" aria-label="已套用的推薦項目">
                  {summaryLabels.map((label) => (
                    <span
                      key={label}
                      className="rounded-atrip-sm bg-atrip-tag-background px-atrip-tag-x py-atrip-tag-y text-atrip-caption text-atrip-tag-foreground"
                    >
                      {label}
                    </span>
                  ))}
                </span>
              </button>
            ) : (
              <div id="fine-tune-panel" className="mt-atrip-4 space-y-atrip-5">
                <fieldset>
                  <legend className="flex items-center gap-atrip-2 text-atrip-h2">
                    <BedDouble aria-hidden="true" size={18} className="text-atrip-brand-logo-ai" />
                    住宿策略
                  </legend>
                  <div className="mt-atrip-3 flex flex-wrap gap-atrip-2">
                    <PreferenceChip
                      label="連住同一間"
                      selected={wizard.accommodation === "single_hotel"}
                      onToggle={() => wizard.setField("accommodation", "single_hotel")}
                    />
                    <PreferenceChip
                      label="隨景點換宿"
                      selected={wizard.accommodation === "switch_hotel"}
                      onToggle={() => wizard.setField("accommodation", "switch_hotel")}
                    />
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="flex items-center gap-atrip-2 text-atrip-h2">
                    <TrainFront aria-hidden="true" size={18} className="text-atrip-brand-logo-ai" />
                    交通模式
                  </legend>
                  <div className="mt-atrip-3 flex flex-wrap gap-atrip-2">
                    <PreferenceChip
                      label="大眾捷運"
                      selected={wizard.transit === "public_transit"}
                      onToggle={() => wizard.setField("transit", "public_transit")}
                    />
                    <PreferenceChip
                      label="租車自駕"
                      selected={wizard.transit === "self_drive"}
                      onToggle={() => wizard.setField("transit", "self_drive")}
                    />
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="flex w-full items-center justify-between gap-atrip-3 text-atrip-h2">
                    <span className="flex items-center gap-atrip-2">
                      <MapPin aria-hidden="true" size={18} className="text-atrip-brand-logo-ai" />
                      興趣標籤
                    </span>
                    <span className="text-atrip-caption font-normal text-atrip-text-secondary">可複選</span>
                  </legend>
                  <div className="mt-atrip-3 flex flex-wrap gap-atrip-2">
                    {interestOptions.map((interest) => (
                      <PreferenceChip
                        key={interest.id}
                        label={interest.label}
                        category={interest.category}
                        selected={wizard.interests.includes(interest.id)}
                        onToggle={() => wizard.toggleInterest(interest.id)}
                      />
                    ))}
                    <PreferenceChip
                      label="慢慢走"
                      category="walk"
                      selected={wizard.pace === "relaxed"}
                      onToggle={() =>
                        wizard.setField(
                          "pace",
                          wizard.pace === "relaxed" ? "moderate" : "relaxed",
                        )
                      }
                    />
                  </div>
                  <p
                    className="mt-atrip-2 text-atrip-caption text-atrip-selection-foreground"
                    aria-live="polite"
                  >
                    已選 {selectedCount} 項
                  </p>
                </fieldset>

                {sportsModeEnabled ? (
                  <div className="space-y-atrip-3">
                    <label htmlFor="event-note" className="block text-atrip-h2">
                      賽事／時間錨點（選填）
                    </label>
                    <div className="relative">
                      <CalendarDays
                        aria-hidden="true"
                        size={20}
                        className="pointer-events-none absolute left-atrip-3 top-1/2 -translate-y-1/2 text-atrip-brand-logo-ai"
                      />
                      <input
                        id="event-note"
                        className="atrip-input pl-10"
                        value={wizard.eventNote}
                        placeholder="例：9/18 18:00 東京巨蛋"
                        onChange={(event) =>
                          wizard.setField("eventNote", event.target.value)
                        }
                      />
                    </div>
                    <div className="flex gap-atrip-2 rounded-atrip-lg border border-atrip-selection-foreground bg-atrip-selection-background p-atrip-3 text-atrip-selection-foreground">
                      <Check aria-hidden="true" size={20} className="mt-0.5 shrink-0" />
                      <p className="text-atrip-body">
                        <strong className="block font-semibold">運動賽事模式已套用</strong>
                        <span>AI 會優先保留固定賽事時間。</span>
                      </p>
                    </div>
                  </div>
                ) : null}

                <p className="text-atrip-body text-atrip-text-secondary">
                  選取會立即更新，不需另按儲存。
                </p>
              </div>
            )}
          </section>

          {!isFineTuneExpanded ? (
            <div className="mt-atrip-5 flex gap-atrip-2 rounded-atrip-lg border border-atrip-selection-foreground bg-atrip-selection-background p-atrip-3 text-atrip-selection-foreground">
              <span
                aria-hidden="true"
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-atrip-full bg-atrip-action-primary"
              >
                <Check size={16} strokeWidth={3} />
              </span>
              <p className="text-atrip-body">
                <strong className="block font-semibold">預設組合已選好</strong>
                <span>0 次點擊即可開始規劃</span>
              </p>
            </div>
          ) : null}

          {!isFineTuneExpanded ? (
            <div className="mt-atrip-6">
              <h2 className="text-atrip-h2">想更精準？</h2>
              <p className="mt-atrip-1 text-atrip-body text-atrip-text-secondary">
                展開「微調」即可調整住宿、交通與興趣標籤。
              </p>
            </div>
          ) : null}

          <output className="sr-only" aria-live="polite">
            目前模式：
            {wizard.selectedBundle === "custom"
              ? "自訂組合"
              : bundleNames[wizard.selectedBundle]}
          </output>

          {submitError ? (
            <p
              id="wizard-submit-error"
              role="alert"
              className="mt-atrip-5 rounded-atrip-md border border-atrip-selection-foreground bg-atrip-selection-background p-atrip-3 text-atrip-body text-atrip-selection-foreground"
            >
              {submitError}
            </p>
          ) : null}
        </main>

        <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[430px] border-t border-atrip-border-subtle bg-atrip-surface-card px-atrip-gutter pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-atrip-3 max-[359px]:px-atrip-gutter-narrow">
          <button
            type="submit"
            className="atrip-primary-button"
            aria-busy={isSubmitting}
            aria-disabled={isSubmitting}
            aria-describedby={submitError ? "wizard-submit-error" : undefined}
          >
            {isSubmitting ? (
              <LoaderCircle
                aria-hidden="true"
                size={20}
                className="atrip-loading-icon animate-spin"
              />
            ) : (
              <Sparkles aria-hidden="true" size={20} />
            )}
            {isSubmitting ? "AI 規劃中…" : "一鍵開始 AI 規劃"}
          </button>
        </div>
      </form>
    </div>
  );
}
