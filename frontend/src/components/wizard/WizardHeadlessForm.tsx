"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { createItinerary } from "@/repositories/itineraryRepository";
import {
  BUNDLE_PRESETS,
  useWizardStore,
  type PresetBundleId,
} from "@/stores/useWizardStore";

const bundleLabels: Readonly<Record<PresetBundleId, string>> = {
  classic_bundle: "平台推薦經典遊",
  shopping_bundle: "都會潮流血拚狂",
  sports_bundle: "熱血運動賽事遊",
};

const interestOptions = ["gourmet", "cultural", "shopping", "sports"] as const;

export function WizardHeadlessForm() {
  const router = useRouter();
  const wizard = useWizardStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
    <form onSubmit={handleSubmit} aria-label="Atrip 雙層標籤精靈">
      <fieldset>
        <legend>一鍵套版</legend>
        {(Object.keys(BUNDLE_PRESETS) as PresetBundleId[]).map((bundle) => (
          <button
            key={bundle}
            type="button"
            aria-pressed={wizard.selectedBundle === bundle}
            onClick={() => wizard.applyBundle(bundle)}
          >
            {bundleLabels[bundle]}
          </button>
        ))}
      </fieldset>

      <fieldset>
        <legend>自選微調</legend>
        <label>
          目的地
          <input
            value={wizard.destination}
            onChange={(event) => wizard.setField("destination", event.target.value)}
          />
        </label>
        <label>
          天數
          <input
            type="number"
            min={1}
            value={wizard.totalDays}
            onChange={(event) =>
              wizard.setField("totalDays", Number(event.target.value))
            }
          />
        </label>

        <label>
          住宿策略
          <select
            value={wizard.accommodation}
            onChange={(event) =>
              wizard.setField(
                "accommodation",
                event.target.value as typeof wizard.accommodation,
              )
            }
          >
            <option value="single_hotel">連住同一間</option>
            <option value="switch_hotel">隨景點分區換宿</option>
          </select>
        </label>

        <label>
          交通方式
          <select
            value={wizard.transit}
            onChange={(event) =>
              wizard.setField(
                "transit",
                event.target.value as typeof wizard.transit,
              )
            }
          >
            <option value="public_transit">大眾運輸優先</option>
            <option value="self_drive">租車自駕／包車</option>
          </select>
        </label>

        <div aria-label="主題標籤">
          {interestOptions.map((interest) => (
            <button
              key={interest}
              type="button"
              aria-pressed={wizard.interests.includes(interest)}
              onClick={() => wizard.toggleInterest(interest)}
            >
              {interest}
            </button>
          ))}
        </div>

        {wizard.interests.includes("sports") ? (
          <label>
            運動賽事時間錨點
            <input
              value={wizard.eventNote}
              onChange={(event) => wizard.setField("eventNote", event.target.value)}
            />
          </label>
        ) : null}
      </fieldset>

      <output aria-live="polite">
        目前模式：{wizard.selectedBundle === "custom" ? "自訂組合" : bundleLabels[wizard.selectedBundle]}
      </output>

      {submitError ? <p role="alert">{submitError}</p> : null}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "建立中" : "一鍵開始 AI 規劃"}
      </button>
    </form>
  );
}
