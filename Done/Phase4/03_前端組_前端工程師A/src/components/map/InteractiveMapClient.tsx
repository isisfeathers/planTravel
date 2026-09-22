"use client";

import dynamic from "next/dynamic";

export const InteractiveMap = dynamic(() => import("./InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[360px] w-full items-center justify-center rounded-atrip-xl border border-atrip-border-subtle bg-atrip-surface-subtle text-atrip-body text-atrip-text-secondary">
      地圖載入中…
    </div>
  ),
});
