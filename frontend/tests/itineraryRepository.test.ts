import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";

import mockUserPreferences from "../mocks/mock_user_prefs.json";
import { preferenceSnapshotSchema } from "@/contracts/preferenceSnapshot";
import { createItinerary } from "@/repositories/itineraryRepository";

const validMockUserPreferences = preferenceSnapshotSchema.parse(
  mockUserPreferences,
);

describe("createItinerary", () => {
  it("依 DDL 補入 user_id 並以 generating 建立行程", async () => {
    const single = vi.fn().mockResolvedValue({
      data: { id: "itinerary-id", share_token: "share-token" },
      error: null,
    });
    const select = vi.fn().mockReturnValue({ single });
    const insert = vi.fn().mockReturnValue({ select });
    const from = vi.fn().mockReturnValue({ insert });
    const client = { from } as unknown as SupabaseClient;

    const result = await createItinerary(client, {
      userId: "user-id",
      title: "東京 5 天行程",
      preferenceSnapshot: validMockUserPreferences,
    });

    expect(from).toHaveBeenCalledWith("itineraries");
    expect(insert).toHaveBeenCalledWith({
      user_id: "user-id",
      title: "東京 5 天行程",
      destination: "東京",
      status: "generating",
      preference_snapshot: validMockUserPreferences,
    });
    expect(select).toHaveBeenCalledWith("id, share_token");
    expect(result).toEqual({ id: "itinerary-id", share_token: "share-token" });
  });

  it("將 Supabase 錯誤轉成可呈現的例外", async () => {
    const client = {
      from: vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "RLS denied" },
            }),
          }),
        }),
      }),
    } as unknown as SupabaseClient;

    await expect(
      createItinerary(client, {
        userId: "user-id",
        title: "東京 5 天行程",
        preferenceSnapshot: validMockUserPreferences,
      }),
    ).rejects.toThrow("建立行程失敗：RLS denied");
  });
});
