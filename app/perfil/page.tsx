"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { ResultView } from "@/components/ResultView";
import { computeResult } from "@/lib/scoring";
import {
  IN_PROGRESS_UNREADY,
  clearChoices,
  clearInProgress,
  clearSavedResult,
  getChoicesServerSnapshot,
  getChoicesSnapshot,
  getSavedResultServerSnapshot,
  getSavedResultSnapshot,
  parseChoiceIds,
  parseSavedResult,
  saveSavedResult,
} from "@/lib/storage";
import { TEST_MODES } from "@/lib/testModes";

function subscribe() {
  return () => {};
}

function formatSavedAt(iso: string): string {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function PerfilPage() {
  const choicesRaw = useSyncExternalStore(
    subscribe,
    getChoicesSnapshot,
    getChoicesServerSnapshot,
  );
  const savedRaw = useSyncExternalStore(
    subscribe,
    getSavedResultSnapshot,
    getSavedResultServerSnapshot,
  );
  const [dismissed, setDismissed] = useState(false);
  const ready =
    choicesRaw !== IN_PROGRESS_UNREADY && savedRaw !== IN_PROGRESS_UNREADY;
  const sessionIds = useMemo(() => parseChoiceIds(choicesRaw), [choicesRaw]);
  const saved = useMemo(() => parseSavedResult(savedRaw), [savedRaw]);
  const ids = sessionIds.length > 0 ? sessionIds : (saved?.choiceIds ?? []);
  const result = ids.length > 0 ? computeResult(ids) : null;

  useEffect(() => {
    if (!ready || sessionIds.length === 0) return;
    if (!saved) {
      saveSavedResult({
        choiceIds: sessionIds,
        mode: "padrao",
        savedAt: new Date().toISOString(),
      });
    }
    const mode = saved?.mode ?? "padrao";
    clearInProgress(mode);
  }, [ready, sessionIds, saved]);

  if (!ready) {
    return (
      <p className="mx-auto text-[var(--muted)]" aria-live="polite">
        Calculando perfil…
      </p>
    );
  }

  if (dismissed || !result) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <p className="text-sm tracking-wide text-[var(--accent)] uppercase">
          Meu Perfil
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
          Nada salvo ainda
        </h1>
        <p className="mt-4 text-[var(--ink-soft)]">
          Meu Perfil é o teste de Valmora: dez eixos, arquétipo e o que puxou
          o resultado. Meu Estado fica em outra página.
        </p>
        <Link
          href="/#modos"
          className="mt-6 inline-flex rounded-lg bg-[var(--accent)] px-5 py-2.5 font-semibold"
        >
          Fazer Meu Perfil
        </Link>
      </div>
    );
  }

  const meta = saved
    ? `Modo ${TEST_MODES[saved.mode].label} · salvo em ${formatSavedAt(saved.savedAt)}`
    : null;

  return (
    <ResultView
      result={result}
      meta={meta}
      actions={
        <>
          <Link
            href="/estado/resultado"
            className="inline-flex rounded-lg border border-[var(--line)] px-5 py-2.5 font-medium text-[var(--ink)] transition-colors hover:border-[var(--accent-muted)]"
          >
            Meu Estado Ideal
          </Link>
          <Link
            href="/posicoes"
            className="inline-flex rounded-lg border border-[var(--line)] px-5 py-2.5 font-medium text-[var(--ink)] transition-colors hover:border-[var(--accent-muted)]"
          >
            Ver todas as posições
          </Link>
          <Link
            href="/#modos"
            className="inline-flex rounded-lg border border-[var(--line)] px-5 py-2.5 font-medium text-[var(--ink)] transition-colors hover:border-[var(--accent-muted)]"
          >
            Refazer Meu Perfil
          </Link>
          <button
            type="button"
            onClick={() => {
              clearSavedResult();
              clearChoices();
              setDismissed(true);
            }}
            className="inline-flex rounded-lg border border-[var(--line)] px-5 py-2.5 font-medium text-[var(--muted)] transition-colors hover:border-[var(--accent-muted)] hover:text-[var(--ink)]"
          >
            Apagar Meu Perfil
          </button>
        </>
      }
    />
  );
}
