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
import { createItinerary } from "@/repositories/itineraryRepository";
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
    wizard.accommodation === "single_hotel" ? "連住同一間" : "隨景點換宿",
    wizard.transit === "public_transit" ? "大眾捷運" : "租車自駕",
  ];

  if (wizard.interests.includes("gourmet")) labels.push("在地美食");
  if (wizard.interests.includes("cultural")) labels.push("古蹟文化");
  if (wizard.interests.includes("shopping")) labels.push("購物");
  if (wizard.pace === "relaxed") labels.push("慢慢走");

  return labels;
}

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
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        throw new Error("請先完成 LINE／Supabase 登入再建立行程。");
      }

      const created = await createItinerary(supabase, {
        userId: data.user.id,
        title: `${preferenceSnapshot.destination} ${preferenceSnapshot.total_days} 天行程`,
        preferenceSnapshot,
      });

      router.push(`/waiting/${created.id}`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "建立行程失敗。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-[430px] bg-atrip-surface-page">
      <header className="flex min-h-atrip-nav items-center gap-atrip-2 border-b border-atrip-border-subtle bg-atrip-surface-card px-atrip-gutter max-[359px]:px-atrip-gutter-narrow">
        <button
          type="button"
          className="atrip-icon-button bg-atrip-selection-background text-atrip-brand-logo-ai"
          aria-label="返回上一頁"
          onClick={() => router.back()}
        >
          <ArrowLeft aria-hidden="true" size={20} />
        </button>
        <span className="text-atrip-h2">建立新旅程</span>
      </header>

      <form
        onSubmit={handleSubmit}
        aria-label="Atrip 雙層標籤精靈"
        className="pb-[calc(7rem+env(safe-area-inset-bottom))]"
      >
        <main className="px-atrip-gutter py-atrip-6 max-[359px]:px-atrip-gutter-narrow">
          <div>
            <h1 className="text-atrip-h1">先選一個旅行模式</h1>
            <p className="mt-atrip-1 text-atrip-body text-atrip-text-secondary">
              系統已替你套用推薦組合，也可以再微調。
            </p>
          </div>

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
