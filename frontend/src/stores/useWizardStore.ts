import { create } from "zustand";

import {
  preferenceSnapshotSchema,
  type ValidatedPreferenceSnapshot,
} from "@/contracts/preferenceSnapshot";
import type {
  AccommodationStrategy,
  BudgetLevel,
  PaceLevel,
  PreferenceSnapshot,
  TransitMode,
} from "@/contracts/atrip";

export type PresetBundleId =
  | "classic_bundle"
  | "shopping_bundle"
  | "sports_bundle";
export type SelectedBundle = PresetBundleId | "custom";

export interface WizardFields {
  selectedBundle: SelectedBundle;
  destination: string;
  totalDays: number;
  startDate?: string;
  endDate?: string;
  pace: PaceLevel;
  budgetLevel: BudgetLevel;
  accommodation: AccommodationStrategy;
  transit: TransitMode;
  interests: string[];
  eventNote: string;
}

type EditableWizardField = Exclude<
  keyof WizardFields,
  "selectedBundle" | "interests"
>;

export interface WizardState extends WizardFields {
  applyBundle: (bundle: PresetBundleId) => void;
  hydratePreferences: (preferences?: Partial<PreferenceSnapshot> | null) => void;
  setField: <K extends EditableWizardField>(
    field: K,
    value: WizardFields[K],
  ) => void;
  toggleInterest: (interest: string) => void;
  buildPreferenceSnapshot: () => ValidatedPreferenceSnapshot;
  reset: () => void;
}

type BundlePreset = Omit<WizardFields, "selectedBundle" | "destination" | "totalDays" | "startDate" | "endDate" | "eventNote">;

export const BUNDLE_PRESETS: Readonly<Record<PresetBundleId, BundlePreset>> = {
  classic_bundle: {
    pace: "relaxed",
    budgetLevel: "standard",
    accommodation: "single_hotel",
    transit: "public_transit",
    interests: ["gourmet", "cultural"],
  },
  shopping_bundle: {
    pace: "packed",
    budgetLevel: "standard",
    accommodation: "single_hotel",
    transit: "public_transit",
    interests: ["shopping"],
  },
  sports_bundle: {
    pace: "moderate",
    budgetLevel: "standard",
    accommodation: "single_hotel",
    transit: "public_transit",
    interests: ["sports"],
  },
};

const baseFields: WizardFields = {
  selectedBundle: "classic_bundle",
  destination: "東京",
  totalDays: 5,
  startDate: undefined,
  endDate: undefined,
  pace: BUNDLE_PRESETS.classic_bundle.pace,
  budgetLevel: BUNDLE_PRESETS.classic_bundle.budgetLevel,
  accommodation: BUNDLE_PRESETS.classic_bundle.accommodation,
  transit: BUNDLE_PRESETS.classic_bundle.transit,
  interests: [...BUNDLE_PRESETS.classic_bundle.interests],
  eventNote: "",
};

function buildSnapshot(fields: WizardFields): ValidatedPreferenceSnapshot {
  const snapshot: PreferenceSnapshot = {
    destination: fields.destination.trim(),
    total_days: fields.totalDays,
    pace: fields.pace,
    budget_level: fields.budgetLevel,
    accommodation_strategy: fields.accommodation,
    transit_mode: fields.transit,
    interests: [...fields.interests],
  };

  if (fields.startDate) snapshot.start_date = fields.startDate;
  if (fields.endDate) snapshot.end_date = fields.endDate;
  if (fields.eventNote.trim()) snapshot.event_note = fields.eventNote.trim();
  if (fields.selectedBundle !== "custom") {
    snapshot.selected_bundle = fields.selectedBundle;
  }

  return preferenceSnapshotSchema.parse(snapshot);
}

export const useWizardStore = create<WizardState>((set, get) => ({
  ...baseFields,

  applyBundle: (bundle) => {
    const preset = BUNDLE_PRESETS[bundle];
    set({
      selectedBundle: bundle,
      ...preset,
      interests: [...preset.interests],
      eventNote: bundle === "sports_bundle" ? get().eventNote : "",
    });
  },

  hydratePreferences: (preferences) => {
    if (!preferences) {
      set({ ...baseFields, interests: [...baseFields.interests] });
      return;
    }

    const selectedBundle =
      preferences.selected_bundle === "classic_bundle" ||
      preferences.selected_bundle === "shopping_bundle" ||
      preferences.selected_bundle === "sports_bundle"
        ? preferences.selected_bundle
        : "custom";

    set({
      selectedBundle,
      destination: preferences.destination ?? baseFields.destination,
      totalDays: preferences.total_days ?? baseFields.totalDays,
      startDate: preferences.start_date,
      endDate: preferences.end_date,
      pace: preferences.pace ?? baseFields.pace,
      budgetLevel: preferences.budget_level ?? baseFields.budgetLevel,
      accommodation:
        preferences.accommodation_strategy ?? baseFields.accommodation,
      transit: preferences.transit_mode ?? baseFields.transit,
      interests: preferences.interests
        ? [...preferences.interests]
        : [...baseFields.interests],
      eventNote: preferences.event_note ?? "",
    });
  },

  setField: (field, value) =>
    set((state) => ({
      ...state,
      [field]: value,
      selectedBundle: "custom",
    })),

  toggleInterest: (interest) =>
    set((state) => {
      const isSelected = state.interests.includes(interest);
      return {
        selectedBundle: "custom",
        interests: isSelected
          ? state.interests.filter((item) => item !== interest)
          : [...state.interests, interest],
        eventNote:
          interest === "sports" && isSelected ? "" : state.eventNote,
      };
    }),

  buildPreferenceSnapshot: () => buildSnapshot(get()),

  reset: () => set({ ...baseFields, interests: [...baseFields.interests] }),
}));
