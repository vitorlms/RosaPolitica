"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ResultView } from "@/components/ResultView";
import { scoreInstitutions } from "@/lib/institutions";
import { computeResult } from "@/lib/scoring";
import {
  clearSavedResult,
  loadSavedResult,
  type SavedResult,
} from "@/lib/storage";
import { TEST_MODES } from "@/lib/testModes";
import type { InstitutionPick, ScoreResult } from "@/lib/types";

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

export default function MeuResultadoPage() {
  const [saved, setSaved] = useState<SavedResult | null | undefined>(undefined);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [institutions, setInstitutions] = useState<InstitutionPick[]>([]);

  const refresh = useCallback(() => {
    const next = loadSavedResult();
    setSaved(next);
    setResult(next ? computeResult(next.choiceIds) : null);
    setInstitutions(next ? scoreInstitutions(next.choiceIds) : []);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function handleClear() {
    clearSavedResult();
    setSaved(null);
    setResult(null);
    setInstitutions([]);
  }

  if (saved === undefined) {
    return (
      <p className="mx-auto text-[var(--muted)]" aria-live="polite">
        Carregando…
      </p>
    );
  }

  if (!saved || !result) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <p className="text-sm tracking-wide text-[var(--accent)] uppercase">
          Meu resultado
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
          Nada salvo ainda
        </h1>
        <p className="mt-4 text-[var(--ink-soft)]">
          Quando você terminar um teste, o perfil fica guardado neste navegador
          — sem precisar de conta.
        </p>
        <Link
          href="/#modos"
          className="mt-6 inline-flex rounded-lg bg-[var(--accent)] px-5 py-2.5 font-semibold"
        >
          Fazer o teste
        </Link>
      </div>
    );
  }

  const modeLabel = TEST_MODES[saved.mode].label;

  return (
    <ResultView
      result={result}
      institutions={institutions}
      meta={
        <>
          Modo {modeLabel} · salvo em {formatSavedAt(saved.savedAt)}
        </>
      }
      actions={
        <>
          <Link
            href="/"
            className="inline-flex rounded-lg bg-[var(--accent)] px-5 py-2.5 font-semibold text-[var(--ink)] transition-opacity hover:opacity-90"
          >
            Fazer de novo
          </Link>
          <Link
            href="/posicoes"
            className="inline-flex rounded-lg border border-[var(--line)] px-5 py-2.5 font-medium text-[var(--ink)] transition-colors hover:border-[var(--accent-muted)]"
          >
            Ver todas as posições
          </Link>
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex rounded-lg border border-[var(--line)] px-5 py-2.5 font-medium text-[var(--muted)] transition-colors hover:border-[var(--accent-muted)] hover:text-[var(--ink)]"
          >
            Apagar resultado
          </button>
        </>
      }
    />
  );
}
