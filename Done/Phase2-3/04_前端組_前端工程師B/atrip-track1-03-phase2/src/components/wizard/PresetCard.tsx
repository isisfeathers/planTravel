import type { LucideIcon } from "lucide-react";
import { Check } from "lucide-react";

import type { PresetBundleId } from "@/stores/useWizardStore";

interface PresetCardProps {
  id: PresetBundleId;
  title: string;
  description: string;
  icon: LucideIcon;
  selected: boolean;
  onSelect: (id: PresetBundleId) => void;
}

export function PresetCard({
  id,
  title,
  description,
  icon: Icon,
  selected,
  onSelect,
}: PresetCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className="atrip-preset-card"
      onClick={() => onSelect(id)}
    >
      <span className="flex items-start justify-between gap-atrip-2">
        <span
          aria-hidden="true"
          className={`flex h-atrip-icon-button w-atrip-icon-button items-center justify-center rounded-atrip-full ${
            selected
              ? "bg-atrip-action-primary text-atrip-action-on-primary"
              : "bg-atrip-surface-subtle text-atrip-text-primary"
          }`}
        >
          <Icon size={20} strokeWidth={2} />
        </span>
        <span
          aria-hidden="true"
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-atrip-full bg-atrip-selection-foreground text-atrip-surface-card ${
            selected ? "visible" : "invisible"
          }`}
        >
          <Check size={15} strokeWidth={3} />
        </span>
      </span>
      <span className="mt-atrip-3 block">
        <span className="block text-atrip-h2">{title}</span>
        <span className="mt-atrip-1 block text-atrip-body text-atrip-text-secondary">
          {description}
        </span>
      </span>
    </button>
  );
}
