"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CloudOff,
  LoaderCircle,
  MapPin,
  Plane,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";

const tips = [
  "熱門景點通常早上人潮較少，我們會優先保留舒服的參觀節奏。",
  "正在減少不必要的折返，讓每天的移動更順路。",
  "固定時間的交通與活動會先被鎖定，再安排附近的自由探索。",
  "行李清單會依目的地氣候、插座與活動內容自動調整。",
];

const progressSteps = [
  { id: 1, label: "讀懂你的旅行偏好", detail: "目的地、步調與興趣" },
  { id: 2, label: "安排住宿與移動路線", detail: "減少折返與等待時間" },
  { id: 3, label: "組合每日探索節奏", detail: "景點、餐食與自由時間" },
  { id: 4, label: "準備機票與行李建議", detail: "出發前資訊一次整理" },
] as const;

interface WaitingCanvasProps {
  itineraryId: string;
}

export function WaitingCanvas({ itineraryId }: WaitingCanvasProps) {
  const realtime = useRealtimeSubscription(itineraryId);
  const [tipIndex, setTipIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const tipTimer = window.setInterval(
      () => setTipIndex((current) => (current + 1) % tips.length),
      3800,
    );
    const stepTimer = window.setInterval(
      () => setCurrentStep((current) => Math.min(progressSteps.length, current + 1)),
      2600,
    );

    return () => {
      window.clearInterval(tipTimer);
      window.clearInterval(stepTimer);
    };
  }, []);

  const failed = realtime.status === "failed";
  const completed = realtime.status === "completed";

  return (
    <main className="min-h-screen bg-atrip-surface-page px-atrip-gutter pb-[calc(2rem+env(safe-area-inset-bottom))] pt-atrip-6 max-[359px]:px-atrip-gutter-narrow">
      <section className="mx-auto w-full max-w-[430px]" aria-live="polite">
        <div className="text-center">
          <p className="text-atrip-caption font-semibold text-atrip-brand-logo-ai">ATRIP AI 旅遊管家</p>
          <h1 className="mt-atrip-1 text-atrip-display text-atrip-text-primary">
            {failed ? "規劃途中遇到問題" : completed ? "你的旅程準備好了" : "正在展開你的旅行路線"}
          </h1>
          <p className="mx-auto mt-atrip-2 max-w-sm text-atrip-body text-atrip-text-secondary">
            {failed
              ? "偏好資料仍然完整保留，可以安心重新嘗試。"
              : completed
                ? "每日路線、機票與行李建議已經整理完成。"
                : "你可以先離開這個畫面，完成後 LINE OA 會主動通知。"}
          </p>
        </div>

        <div className="relative mt-atrip-6 min-h-[238px] overflow-hidden rounded-atrip-xl bg-atrip-brand-logo-trp p-atrip-5 text-white">
          <div className="atrip-waiting-route" aria-hidden="true" />
          {!failed && !completed ? (
            <div className="atrip-waiting-flight-scene" aria-hidden="true">
              <span className="atrip-waiting-cloud atrip-waiting-cloud-one" />
              <span className="atrip-waiting-cloud atrip-waiting-cloud-two" />
              <span className="atrip-waiting-flight-path" />
              <span className="atrip-plane-flight">
                <Plane size={23} strokeWidth={2.4} />
              </span>
            </div>
          ) : null}
          <div className="relative z-10 flex items-start justify-between gap-atrip-4">
            <div>
              <span className="inline-flex items-center gap-atrip-1 rounded-atrip-full bg-atrip-action-primary px-atrip-3 py-atrip-1 text-atrip-caption font-semibold text-atrip-action-on-primary">
                {failed ? <AlertTriangle size={13} /> : completed ? <Check size={13} /> : <LoaderCircle className="atrip-loading-icon animate-spin" size={13} />}
                {failed ? "等待重試" : completed ? "規劃完成" : "AI 規劃中"}
              </span>
              <p className="mt-atrip-5 text-atrip-caption text-white">TAIPEI</p>
              <p className="text-atrip-h1">下一站，專屬旅程</p>
            </div>
            <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-atrip-full bg-atrip-selection-background text-atrip-brand-logo-ai ${!failed && !completed ? "atrip-waiting-beacon" : ""}`}>
              {completed ? <Sparkles size={26} /> : <Plane className="-rotate-12" size={26} />}
            </span>
          </div>
          <div className="relative z-10 mt-atrip-6 flex items-center gap-atrip-2 text-atrip-caption text-white">
            <MapPin size={15} className="text-atrip-action-primary" />
            <span>路線建立後，可在地圖與時間軸間自由切換</span>
          </div>
        </div>

        <div className="mt-atrip-5 rounded-atrip-xl border border-atrip-border-subtle bg-atrip-surface-card p-atrip-4">
          <div className="flex items-center justify-between gap-atrip-3">
            <div>
              <h2 className="text-atrip-h2 text-atrip-text-primary">旅程準備進度</h2>
              <p className="text-atrip-caption text-atrip-text-secondary">每一步都會同步保存</p>
            </div>
            <span className="rounded-atrip-sm bg-atrip-tag-background px-atrip-tag-x py-atrip-tag-y text-atrip-caption font-semibold text-atrip-tag-foreground">
              {completed ? "4 / 4" : currentStep === progressSteps.length ? "最後整理" : `${currentStep} / 4`}
            </span>
          </div>

          <ol className="mt-atrip-4 space-y-atrip-1">
            {progressSteps.map((step, index) => {
              const done = completed || currentStep > step.id;
              const current = !completed && currentStep === step.id;
              return (
                <li
                  key={step.id}
                  className="atrip-waiting-progress-step relative flex gap-atrip-3 pb-atrip-4 last:pb-0"
                  style={{ animationDelay: `${index * 90}ms` }}
                >
                  {index < progressSteps.length - 1 ? (
                    <span className="absolute left-[15px] top-8 h-[calc(100%-1rem)] border-l-2 border-dashed border-atrip-border-subtle" aria-hidden="true" />
                  ) : null}
                  <span
                    className={`relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-atrip-full border text-atrip-caption font-semibold transition-colors duration-atrip motion-reduce:transition-none ${
                      done
                        ? "atrip-waiting-step-done border-atrip-selection-foreground bg-atrip-selection-background text-atrip-selection-foreground"
                        : current
                          ? "atrip-waiting-step-current border-atrip-action-primary bg-atrip-action-primary text-atrip-action-on-primary"
                          : "border-atrip-border-subtle bg-atrip-surface-subtle text-atrip-text-secondary"
                    }`}
                  >
                    {done ? <Check size={15} strokeWidth={3} /> : step.id}
                  </span>
                  <div className="pt-atrip-1">
                    <p className={`text-atrip-body font-semibold ${current || done ? "text-atrip-text-primary" : "text-atrip-text-secondary"}`}>{step.label}</p>
                    <p className="text-atrip-caption text-atrip-text-secondary">{step.detail}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {!failed ? (
          <div key={tipIndex} className="atrip-loading-stage mt-atrip-4 rounded-atrip-lg bg-atrip-selection-background p-atrip-4">
            <div className="flex items-center gap-atrip-2">
              <span className="atrip-waiting-tip-spark grid h-7 w-7 place-items-center rounded-atrip-full bg-atrip-action-primary text-atrip-action-on-primary" aria-hidden="true">
                <Sparkles size={14} />
              </span>
              <p className="text-atrip-caption font-semibold text-atrip-selection-foreground">旅途小提醒</p>
            </div>
            <p className="mt-atrip-1 text-atrip-body text-atrip-text-primary">{tips[tipIndex]}</p>
          </div>
        ) : null}

        {failed ? (
          <button type="button" className="atrip-primary-button mt-atrip-5" onClick={() => window.location.reload()}>
            <RefreshCw size={20} aria-hidden="true" />
            重新規劃行程
          </button>
        ) : (
          <div className="mt-atrip-5">
            <Link href={`/canvas/${itineraryId}`} className="atrip-primary-button">
              {completed ? "開啟完整行程" : "先看看行程畫布"}
              <ArrowRight size={20} aria-hidden="true" />
            </Link>
            <p className="mt-atrip-3 flex items-start justify-center gap-atrip-2 text-center text-atrip-caption text-atrip-text-secondary">
              {realtime.connectionState === "polling" ? <CloudOff className="mt-0.5 shrink-0" size={14} /> : <LoaderCircle className="atrip-loading-icon mt-0.5 shrink-0 animate-spin" size={14} />}
              完成後會透過 LINE OA 傳送通知，不需要一直停留在此頁。
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
