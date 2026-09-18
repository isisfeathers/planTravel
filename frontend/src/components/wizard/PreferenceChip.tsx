import { Check } from "lucide-react";

export type PreferenceChipCategory =
  | "neutral"
  | "food"
  | "culture"
  | "walk";

const categoryClasses: Readonly<Record<PreferenceChipCategory, string>> = {
  neutral: "bg-atrip-surface-subtle text-atrip-text-secondary",
  food: "bg-atrip-category-food-background text-atrip-category-food-foreground",
  culture:
    "bg-atrip-category-culture-background text-atrip-category-culture-foreground",
  walk: "bg-atrip-category-walk-background text-atrip-category-walk-foreground",
};

interface PreferenceChipProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
  category?: PreferenceChipCategory;
}

export function PreferenceChip({
  label,
  selected,
  onToggle,
  category = "neutral",
}: PreferenceChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={`atrip-chip ${categoryClasses[category]}`}
      onClick={onToggle}
    >
      <span
        aria-hidden="true"
        className="flex h-atrip-check w-atrip-check shrink-0 items-center justify-center text-atrip-selection-foreground"
      >
        {selected ? <Check size={16} strokeWidth={3} /> : null}
      </span>
      <span>{label}</span>
    </button>
  );
}
