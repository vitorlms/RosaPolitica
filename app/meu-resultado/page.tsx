"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { GovernoIdeal } from "@/components/GovernoIdeal";
import { ResultView } from "@/components/ResultView";
import { scoreGovernment, type GovernmentResult } from "@/lib/governoFlow";
import { computeResult } from "@/lib/scoring";
import {
  clearAllSavedResults,
  loadSavedGovernment,
  loadSavedResult,
  type SavedGovernment,
  type SavedResult,
} from "@/lib/storage";
import { TEST_MODES } from "@/lib/testModes";
import type { ScoreResult } from "@/lib/types";

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
  const [governo, setGoverno] = useState<SavedGovernment | null>(null);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [arrangement, setArrangement] = useState<GovernmentResult | null>(null);

  const refresh = useCallback(() => {
    const next = loadSavedResult();
    const savedArrangement = loadSavedGovernment();
    setSaved(next);
    setGoverno(savedArrangement);
    setResult(next ? computeResult(next.choiceIds) : null);
    setArrangement(
      savedArrangement ? scoreGovernment(savedArrangement.choiceIds) : null,
    );
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function handleClear() {
    clearAllSavedResults();
    setSaved(null);
    setGoverno(null);
    setResult(null);
    setArrangement(null);
  }

  if (saved === undefined) {
    return (
      <p className="mx-auto text-[var(--muted)]" aria-live="polite">
        Carregando…
      </p>
    );
  }

  if (!saved && !governo) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <p className="text-sm tracking-wide text-[var(--accent)] uppercase">
          Meu resultado
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
          Nada salvo ainda
        </h1>
        <p className="mt-4 text-[var(--ink-soft)]">
          O perfil nos dez eixos e o governo ideal ficam guardados neste
          navegador, cada um quando você termina aquele teste — sem conta, e
          sem precisar fazer os dois.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/#modos"
            className="inline-flex rounded-lg bg-[var(--accent)] px-5 py-2.5 font-semibold"
          >
            Fazer o teste de perfil
          </Link>
          <Link
            href="/#governo-ideal"
            className="inline-flex rounded-lg border border-[var(--line)] px-5 py-2.5 font-medium text-[var(--ink)] transition-colors hover:border-[var(--accent-muted)]"
          >
            Fazer o governo ideal
          </Link>
        </div>
      </div>
    );
  }

  const actions = (
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
  );

  const governoBlock: ReactNode = governo ? (
    arrangement ? (
      <GovernoIdeal
        result={arrangement}
        standalone={!result}
        countryName={governo.countryName}
        meta={<>Salvo em {formatSavedAt(governo.savedAt)}</>}
      />
    ) : (
      <section className="mt-16 w-full border-t border-[var(--line)] pt-12 text-center">
        <p className="text-sm text-[var(--ink-soft)]">
          O governo ideal salvo não fecha o caminho deste teste. Faça de novo
          para ver o arranjo.
        </p>
        <Link
          href="/governo"
          className="mt-4 inline-flex rounded-lg border border-[var(--line)] px-5 py-2.5 font-medium text-[var(--ink)]"
        >
          Refazer o governo ideal
        </Link>
      </section>
    )
  ) : null;

  if (result && saved) {
    const modeLabel = TEST_MODES[saved.mode].label;
    return (
      <ResultView
        result={result}
        meta={
          <>
            Modo {modeLabel} · salvo em {formatSavedAt(saved.savedAt)}
          </>
        }
        below={governoBlock}
        actions={actions}
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center pb-16">
      {governoBlock}
      <div className="mt-12 flex flex-wrap justify-center gap-3">{actions}</div>
    </div>
  );
}
