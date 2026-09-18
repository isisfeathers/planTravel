import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  CreatedItinerary,
  PreferenceSnapshot,
} from "@/contracts/atrip";
import { preferenceSnapshotSchema } from "@/contracts/preferenceSnapshot";

export interface CreateItineraryInput {
  userId: string;
  title: string;
  preferenceSnapshot: PreferenceSnapshot;
}

export interface ItineraryInsertPayload {
  user_id: string;
  title: string;
  destination: string;
  status: "generating";
  preference_snapshot: PreferenceSnapshot;
}

export async function createItinerary(
  supabase: SupabaseClient,
  input: CreateItineraryInput,
): Promise<CreatedItinerary> {
  const userId = input.userId.trim();
  const title = input.title.trim();
  const preferenceSnapshot = preferenceSnapshotSchema.parse(
    input.preferenceSnapshot,
  );

  if (!userId) throw new Error("建立行程前必須有已登入的 user_id。");
  if (!title) throw new Error("行程 title 不得為空白。");

  const payload: ItineraryInsertPayload = {
    user_id: userId,
    title,
    destination: preferenceSnapshot.destination,
    status: "generating",
    preference_snapshot: preferenceSnapshot,
  };

  const { data, error } = await supabase
    .from("itineraries")
    .insert(payload)
    .select("id, share_token")
    .single();

  if (error) {
    throw new Error(`建立行程失敗：${error.message}`);
  }

  if (!data?.id || !data.share_token) {
    throw new Error("建立行程失敗：資料庫未回傳 id 或 share_token。");
  }

  return {
    id: data.id as string,
    share_token: data.share_token as string,
  };
}
