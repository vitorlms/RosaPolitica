"use client";

import Link from "next/link";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import { GovernoIdeal } from "@/components/GovernoIdeal";
import { scoreInstitutions } from "@/lib/institutions";
import {
  IN_PROGRESS_UNREADY,
  clearGovernmentProgress,
  getGovernmentSessionServerSnapshot,
  getGovernmentSessionSnapshot,
  loadSavedGovernment,
  saveSavedGovernment,
} from "@/lib/storage";

function subscribe() {
  return () => {};
}

function choiceIdsFromSession(raw: string): string[] {
  if (!raw || raw === IN_PROGRESS_UNREADY) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

export default function GovernoResultadoPage() {
  const raw = useSyncExternalStore(
    subscribe,
    getGovernmentSessionSnapshot,
    getGovernmentSessionServerSnapshot,
  );
  const choiceIds = useMemo(() => choiceIdsFromSession(raw), [raw]);
  const ready = raw !== IN_PROGRESS_UNREADY;

  useEffect(() => {
    if (!ready || choiceIds.length === 0) return;
    if (!loadSavedGovernment()) {
      saveSavedGovernment({
        choiceIds,
        savedAt: new Date().toISOString(),
      });
    }
    clearGovernmentProgress();
  }, [ready, choiceIds]);

  if (!ready) {
    return (
      <p className="mx-auto text-[var(--muted)]" aria-live="polite">
        Calculando arranjo…
      </p>
    );
  }

  if (choiceIds.length === 0) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <p className="text-[var(--ink-soft)]">
          Nenhuma escolha de governo ideal encontrada. Percorra esses dilemas
          primeiro.
        </p>
        <Link
          href="/governo"
          className="mt-6 inline-flex rounded-lg bg-[var(--accent)] px-5 py-2.5 font-semibold"
        >
          Começar o governo ideal
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center pb-16">
      <GovernoIdeal picks={scoreInstitutions(choiceIds)} standalone />
      <div className="mt-12 flex flex-wrap justify-center gap-3">
        <Link
          href="/meu-resultado"
          className="inline-flex rounded-lg border border-[var(--line)] px-5 py-2.5 font-medium text-[var(--ink)] transition-colors hover:border-[var(--accent-muted)]"
        >
          Meu resultado
        </Link>
        <Link
          href="/"
          className="inline-flex rounded-lg border border-[var(--line)] px-5 py-2.5 font-medium text-[var(--ink)] transition-colors hover:border-[var(--accent-muted)]"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
