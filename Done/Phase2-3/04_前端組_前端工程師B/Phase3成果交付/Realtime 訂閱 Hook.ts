"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { RealtimeChannel } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ItineraryStatus } from "@/contracts/atrip";

const POLL_INTERVAL_MS = 5_000;

type SubscriptionStatus = Extract<ItineraryStatus, "draft" | "generating" | "completed" | "failed">;

type SubscriptionState = {
  status: SubscriptionStatus;
  errorCode: string | null;
  connectionState: "connecting" | "subscribed" | "polling" | "closed";
};

function isTerminalStatus(value: unknown): value is "completed" | "failed" {
  return value === "completed" || value === "failed";
}

function normalizeStatus(value: unknown): SubscriptionStatus {
  if (value === "draft" || value === "generating" || value === "completed" || value === "failed") {
    return value;
  }
  return "generating";
}

export function useRealtimeSubscription(itineraryId: string) {
  const router = useRouter();
  const [state, setState] = useState<SubscriptionState>({
    status: "generating",
    errorCode: null,
    connectionState: "connecting",
  });
  const routedRef = useRef(false);

  useEffect(() => {
    if (!itineraryId.trim()) return;

    let cancelled = false;
    let channel: RealtimeChannel | null = null;
    let pollTimer: ReturnType<typeof setInterval> | null = null;

    const handleStatus = (statusValue: unknown, errorCodeValue?: unknown) => {
      if (cancelled) return;
      const status = normalizeStatus(statusValue);
      const errorCode = typeof errorCodeValue === "string" ? errorCodeValue : null;
      setState((current) => ({ ...current, status, errorCode }));

      if (status === "completed" && !routedRef.current) {
        routedRef.current = true;
        router.push(`/canvas/${itineraryId}`);
      }
    };

    const pollOnce = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase
          .from("itineraries")
          .select("status, error_code")
          .eq("id", itineraryId)
          .maybeSingle();

        if (error) throw error;
        const row = data as { status?: unknown; error_code?: unknown } | null;
        if (row) handleStatus(row.status, row.error_code);
      } catch {
        if (!cancelled) {
          setState((current) => ({
            ...current,
            connectionState: "polling",
          }));
        }
      }
    };

    const start = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        await pollOnce();
        if (cancelled) return;

        channel = supabase
          .channel(`itinerary-${itineraryId}`)
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "itineraries",
              filter: `id=eq.${itineraryId}`,
            },
            (payload) => {
              const next = payload.new as { status?: unknown; error_code?: unknown };
              handleStatus(next.status, next.error_code);
            },
          )
          .subscribe((subscriptionStatus) => {
            if (cancelled) return;
            setState((current) => ({
              ...current,
              connectionState:
                subscriptionStatus === "SUBSCRIBED" ? "subscribed" : "polling",
            }));
          });

        pollTimer = setInterval(pollOnce, POLL_INTERVAL_MS);
      } catch {
        if (!cancelled) {
          setState((current) => ({ ...current, connectionState: "polling" }));
          pollTimer = setInterval(pollOnce, POLL_INTERVAL_MS);
        }
      }
    };

    void start();

    return () => {
      cancelled = true;
      if (pollTimer) clearInterval(pollTimer);
      if (channel) void channel.unsubscribe();
    };
  }, [itineraryId, router]);

  return {
    ...state,
    isTerminal: isTerminalStatus(state.status),
  };
}
