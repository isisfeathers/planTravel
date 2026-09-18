import { beforeEach, describe, expect, it } from "vitest";

import mockUserPreferences from "../mocks/mock_user_prefs.json";
import { preferenceSnapshotSchema } from "@/contracts/preferenceSnapshot";
import { useWizardStore } from "@/stores/useWizardStore";

const validMockUserPreferences = preferenceSnapshotSchema.parse(
  mockUserPreferences,
);

beforeEach(() => {
  useWizardStore.getState().reset();
});

describe("useWizardStore", () => {
  it("初次進入即套用 classic_bundle，支援 0 點擊組裝合法快照", () => {
    const state = useWizardStore.getState();

    expect(state.selectedBundle).toBe("classic_bundle");
    expect(state.accommodation).toBe("single_hotel");
    expect(state.transit).toBe("public_transit");
    expect(state.pace).toBe("relaxed");
    expect(state.interests).toEqual(["gourmet", "cultural"]);

    expect(state.buildPreferenceSnapshot()).toEqual({
      destination: "東京",
      total_days: 5,
      pace: "relaxed",
      budget_level: "standard",
      accommodation_strategy: "single_hotel",
      transit_mode: "public_transit",
      interests: ["gourmet", "cultural"],
      selected_bundle: "classic_bundle",
    });
  });

  it("點擊套版時會一次聯動所有下層選項", () => {
    useWizardStore.getState().applyBundle("shopping_bundle");
    const state = useWizardStore.getState();

    expect(state.selectedBundle).toBe("shopping_bundle");
    expect(state.pace).toBe("packed");
    expect(state.accommodation).toBe("single_hotel");
    expect(state.transit).toBe("public_transit");
    expect(state.interests).toEqual(["shopping"]);
  });

  it("手動微調後切換為 custom，輸出不夾帶 selected_bundle", () => {
    useWizardStore.getState().setField("transit", "self_drive");
    const state = useWizardStore.getState();
    const snapshot = state.buildPreferenceSnapshot();

    expect(state.selectedBundle).toBe("custom");
    expect(snapshot.transit_mode).toBe("self_drive");
    expect(snapshot).not.toHaveProperty("selected_bundle");
  });

  it("可由正式 mock_user_prefs.json 還原並產生相同快照", () => {
    useWizardStore.getState().hydratePreferences(validMockUserPreferences);
    const snapshot = useWizardStore.getState().buildPreferenceSnapshot();

    expect(snapshot).toEqual(validMockUserPreferences);
    expect(preferenceSnapshotSchema.parse(snapshot)).toEqual(
      validMockUserPreferences,
    );
  });

  it("sports 可選填 event_note，取消 sports 時會清空備註", () => {
    useWizardStore.getState().applyBundle("sports_bundle");
    expect(useWizardStore.getState().buildPreferenceSnapshot()).not.toHaveProperty(
      "event_note",
    );

    useWizardStore.getState().setField("eventNote", "週五 18:00 東京巨蛋");
    expect(useWizardStore.getState().buildPreferenceSnapshot().event_note).toBe(
      "週五 18:00 東京巨蛋",
    );

    useWizardStore.getState().toggleInterest("sports");
    expect(useWizardStore.getState().eventNote).toBe("");
  });
});
