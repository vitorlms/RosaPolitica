"use client";

import { useId, useState } from "react";

interface InfoTooltipProps {
  label: string;
  children: string;
}

/** Accessible hover/focus tooltip for short inline explanations. */
export function InfoTooltip({ label, children }: InfoTooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex align-middle">
      <button
        type="button"
        className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full border border-[var(--line)] text-xs text-[var(--muted)] transition-colors hover:border-[var(--accent-muted)] hover:text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
        aria-label={label}
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
      >
        ?
      </button>
      {open ? (
        <span
          id={id}
          role="tooltip"
          className="absolute bottom-[calc(100%+0.5rem)] left-1/2 z-20 w-60 -translate-x-1/2 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-left text-xs leading-relaxed font-normal text-[var(--ink-soft)] shadow-lg normal-case tracking-normal"
        >
          {children}
        </span>
      ) : null}
    </span>
  );
}
