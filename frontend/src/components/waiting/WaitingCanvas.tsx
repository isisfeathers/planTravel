"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Check, CloudOff, LoaderCircle, Plane, RefreshCw, Sparkles, Compass } from "lucide-react";
import Link from "next/link";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";

const tips = [
  "日本地鐵可使用 Suica 或 PASMO，建議先綁定手機行動支付。",
  "熱門景點通常早上人潮較少，保留彈性會更好玩。",
  "把固定時間的交通與活動先鎖定，再安排附近的自由活動。",
  "旅行中可以先下載離線地圖，網路不穩時仍能查看行程。",
  "行李清單已為您結合目的地氣候、插座電壓與行程特色專屬訂製。",
];

const progressSteps = [
  { id: 1, label: "解析目的地與偏好標籤" },
  { id: 2, label: "調度住宿基地與交通動線" },
  { id: 3, label: "AI 構建每日精準時間軸" },
  { id: 4, label: "智能生成專屬行李清單" },
];

interface WaitingCanvasProps {
  itineraryId: string;
}

export function WaitingCanvas({ itineraryId }: WaitingCanvasProps) {
  const realtime = useRealtimeSubscription(itineraryId);
  const [tipIndex, setTipIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const tipTimer = setInterval(() => {
      setTipIndex((current) => (current + 1) % tips.length);
    }, 3500);

    const stepTimer = setInterval(() => {
      setCurrentStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 2500);

    return () => {
      clearInterval(tipTimer);
      clearInterval(stepTimer);
    };
  }, []);

  const failed = realtime.status === "failed";
  const isCompleted = realtime.status === "completed";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <section className="w-full max-w-[430px] text-center" aria-live="polite">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary/15 text-brand-primary shadow-sm">
          {failed ? (
            <AlertTriangle aria-hidden="true" size={26} className="text-rose-600" />
          ) : isCompleted ? (
            <Sparkles aria-hidden="true" size={26} className="text-emerald-600 animate-bounce" />
          ) : (
            <Compass aria-hidden="true" size={26} className="animate-spin text-brand-primary" style={{ animationDuration: '8s' }} />
          )}
        </div>

        <h1 className="mt-4 text-xl sm:text-2xl font-black text-slate-900">
          {failed
            ? "行程生成遇到問題"
            : isCompleted
            ? "專屬行程已規劃完成！"
            : "AI 自由行規劃管家正在為您排程…"}
        </h1>

        <p className="mt-1.5 text-xs sm:text-sm text-slate-500">
          {failed
            ? "我們沒有遺失你的偏好，可以重新嘗試一次。"
            : isCompleted
            ? "正在為您載入動態畫布與行李清單…"
            : "正在結合地理座標、交通轉乘與專屬行李清單"}
        </p>

        {/* 飛機航線動態畫布 */}
        <div className="relative mx-auto mt-6 h-36 w-full max-w-[340px] overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-sky-50/70 via-white to-slate-50 p-4 shadow-sm">
          <div className="absolute left-6 right-6 top-1/2 border-t-2 border-dashed border-sky-300/80 -translate-y-1/2" />
          <div className="absolute top-3 left-8 text-sky-200 text-xs select-none">☁️</div>
          <div className="absolute bottom-3 right-10 text-sky-200 text-xs select-none">☁️</div>

          <div className="atrip-plane-flight absolute left-6 top-1/2 -translate-y-1/2 text-brand-primary filter drop-shadow-md">
            <div className="flex items-center gap-1">
              <Plane aria-hidden="true" size={28} className="text-[#347FA3] transform rotate-45" />
              <span className="h-1.5 w-6 rounded-full bg-gradient-to-r from-transparent to-sky-300 opacity-60" />
            </div>
          </div>

          <div className="absolute bottom-3 left-4 text-left">
            <span className="block h-2 w-20 animate-pulse rounded-full bg-slate-200" />
            <span className="mt-1.5 block h-2 w-32 animate-pulse rounded-full bg-slate-200" />
          </div>

          <div className="absolute right-3.5 top-3.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping" />
              {isCompleted ? "已完成" : "生成中"}
            </span>
          </div>
        </div>

        {/* 四大步驟動態進度清單 */}
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-2xs space-y-2.5">
          <p className="text-xs font-bold text-slate-800 flex items-center justify-between">
            <span>🚀 生成進度</span>
            <span className="text-[11px] text-brand-primary font-black">
              Step {currentStep} / 4
            </span>
          </p>
          <div className="space-y-1.5">
            {progressSteps.map((step) => {
              const isDone = currentStep > step.id || isCompleted;
              const isCurrent = currentStep === step.id && !isCompleted;
              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-2 text-xs transition-all ${
                    isDone
                      ? "text-emerald-700 font-bold"
                      : isCurrent
                      ? "text-brand-primary font-bold"
                      : "text-slate-400"
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-black ${
                      isDone
                        ? "bg-emerald-100 text-emerald-700"
                        : isCurrent
                        ? "bg-brand-primary/20 text-brand-primary animate-pulse"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {isDone ? "✓" : step.id}
                  </span>
                  <span>{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 旅行小知識輪播 */}
        {!failed && (
          <div className="mt-4 rounded-xl bg-amber-50/80 border border-amber-200/60 p-3.5 text-left shadow-2xs">
            <p className="text-[11px] font-bold text-amber-800 flex items-center gap-1">
              <span>💡</span>
              <span>旅行小知識</span>
            </p>
            <p className="mt-1 text-xs text-amber-900 leading-relaxed transition-all">
              {tips[tipIndex]}
            </p>
          </div>
        )}

        {/* 操作區 */}
        {failed ? (
          <button
            type="button"
            className="w-full mt-5 py-3 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-all flex items-center justify-center gap-1.5 shadow-md"
            onClick={() => window.location.reload()}
          >
            <RefreshCw size={14} />
            <span>重新生成行程</span>
          </button>
        ) : (
          <div className="mt-5 flex flex-col gap-2">
            <Link
              href={`/canvas/${itineraryId}`}
              className="w-full py-3 rounded-xl bg-brand-primary text-slate-900 font-bold text-xs hover:brightness-95 transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              <span>⚡ 直接前往行程畫布 (Canvas)</span>
              <span>→</span>
            </Link>

            <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              {realtime.connectionState === "polling" ? (
                <CloudOff size={13} />
              ) : (
                <LoaderCircle size={13} className="animate-spin text-brand-primary" />
              )}
              <span>您可以先關閉頁面，完成後 LINE 將主動發送推播通知</span>
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
