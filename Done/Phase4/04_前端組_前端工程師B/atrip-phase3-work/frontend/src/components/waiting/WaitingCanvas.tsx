"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Check, CloudOff, LoaderCircle, Plane, RefreshCw } from "lucide-react";

import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";

const tips = [
  "日本地鐵可使用 Suica 或 PASMO，建議先綁定手機行動支付。",
  "熱門景點通常早上人潮較少，保留彈性會更好玩。",
  "把固定時間的交通與活動先鎖定，再安排附近的自由活動。",
  "旅行中可以先下載離線地圖，網路不穩時仍能查看行程。",
];

interface WaitingCanvasProps {
  itineraryId: string;
}

export function WaitingCanvas({ itineraryId }: WaitingCanvasProps) {
  const realtime = useRealtimeSubscription(itineraryId);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTipIndex((current) => (current + 1) % tips.length);
    }, 4_000);
    return () => clearInterval(timer);
  }, []);

  const failed = realtime.status === "failed";

  return (
    <main className="flex min-h-screen items-center justify-center bg-atrip-surface-page px-atrip-gutter py-atrip-8 max-[359px]:px-atrip-gutter-narrow">
      <section className="w-full max-w-[430px] text-center" aria-live="polite">
        <div className="mx-auto flex h-atrip-button w-atrip-button items-center justify-center rounded-atrip-full bg-atrip-selection-background text-atrip-brand-logo-ai">
          {failed ? <AlertTriangle aria-hidden="true" size={24} /> : <Plane aria-hidden="true" size={24} />}
        </div>
        <h1 className="mt-atrip-5 text-atrip-h1">
          {failed ? "行程生成遇到問題" : "您的專屬行程正在生成中…"}
        </h1>
        <p className="mt-atrip-2 text-atrip-body text-atrip-text-secondary">
          {failed
            ? "我們沒有遺失你的偏好，可以重新嘗試一次。"
            : "AI 正在整理景點、交通與時間，請稍候。"}
        </p>

        <div className="relative mx-auto mt-atrip-8 h-36 w-full max-w-[320px] overflow-hidden rounded-atrip-xl border border-atrip-border-subtle bg-atrip-surface-card p-atrip-4">
          <div className="absolute left-8 right-8 top-1/2 border-t-2 border-dashed border-atrip-border-subtle" />
          <div className="atrip-plane-path absolute left-8 top-1/2 -translate-y-1/2 text-atrip-brand-logo-ai">
            <Plane aria-hidden="true" size={26} />
          </div>
          <div className="absolute bottom-atrip-3 left-atrip-4 text-left text-atrip-caption text-atrip-text-secondary">
            <span className="block h-2 w-24 animate-pulse rounded-atrip-full bg-atrip-surface-subtle" />
            <span className="mt-atrip-2 block h-2 w-36 animate-pulse rounded-atrip-full bg-atrip-surface-subtle" />
          </div>
          <div className="absolute right-atrip-4 top-atrip-4 text-atrip-caption text-atrip-text-secondary">
            {realtime.status === "completed" ? "已完成" : "整理中"}
          </div>
        </div>

        <div className="mt-atrip-5 flex items-start gap-atrip-3 rounded-atrip-lg border border-atrip-border-subtle bg-atrip-surface-card p-atrip-4 text-left">
          <span className="mt-0.5 shrink-0 text-atrip-selection-foreground">
            {failed ? <AlertTriangle aria-hidden="true" size={20} /> : <Check aria-hidden="true" size={20} />}
          </span>
          <div>
            <p className="text-atrip-h2">{failed ? "生成失敗" : "目前進度"}</p>
            <p className="mt-atrip-1 text-atrip-body text-atrip-text-secondary">
              {failed
                ? realtime.errorCode ?? "請稍後重新生成。"
                : `狀態：${realtime.connectionState === "subscribed" ? "即時連線中" : "備援檢查中"}`}
            </p>
          </div>
        </div>

        {!failed ? (
          <div className="mt-atrip-5 rounded-atrip-lg bg-atrip-selection-background p-atrip-4 text-left">
            <p className="text-atrip-caption font-semibold text-atrip-selection-foreground">旅行小知識</p>
            <p className="mt-atrip-1 text-atrip-body text-atrip-text-primary">{tips[tipIndex]}</p>
          </div>
        ) : (
          <button
            type="button"
            className="atrip-primary-button mt-atrip-6"
            onClick={() => window.location.reload()}
          >
            <RefreshCw aria-hidden="true" size={20} />
            重新生成
          </button>
        )}

        {!failed ? (
          <p className="mt-atrip-6 flex items-center justify-center gap-atrip-2 text-atrip-caption text-atrip-text-secondary">
            {realtime.connectionState === "polling" ? <CloudOff aria-hidden="true" size={16} /> : <LoaderCircle aria-hidden="true" size={16} className="animate-spin" />}
            您可以先關閉頁面，完成後 LINE 將主動發送推播通知
          </p>
        ) : null}
      </section>
    </main>
  );
}
