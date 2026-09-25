"use client";

import type { Choice } from "@/lib/types";

interface ChoiceButtonProps {
  choice: Choice;
  selected: boolean;
  onSelect: (id: string) => void;
}

export function ChoiceButton({ choice, selected, onSelect }: ChoiceButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(choice.id)}
      className={`w-full text-left rounded-lg border px-4 py-3 transition-colors ${
        selected
          ? "border-[var(--accent)] bg-[var(--accent-soft)]"
          : "border-[var(--line)] bg-[var(--surface)] hover:border-[var(--accent-muted)]"
      }`}
    >
      <span className="block text-[0.95rem] leading-snug text-[var(--ink)]">
        {choice.label}
      </span>
      {choice.hint ? (
        <span className="mt-1.5 block text-sm text-[var(--muted)]">
          {choice.hint}
        </span>
      ) : null}
    </button>
  );
}
