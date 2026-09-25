"use client";

import type { Choice } from "@/lib/types";

interface ChoiceButtonProps {
  choice: Choice;
  selected: boolean;
  dimmed?: boolean;
  onSelect: (id: string) => void;
}

export function ChoiceButton({
  choice,
  selected,
  dimmed = false,
  onSelect,
}: ChoiceButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(choice.id)}
      aria-pressed={selected}
      className={`w-full text-left rounded-lg border px-4 py-3 transition-[border-color,background-color,opacity,transform] duration-300 ease-out ${
        selected
          ? "border-[var(--accent)] bg-[var(--accent-soft)]"
          : "border-[var(--line)] bg-[var(--surface)] hover:border-[var(--accent-muted)]"
      } ${dimmed ? "pointer-events-none opacity-35" : "opacity-100"}`}
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
