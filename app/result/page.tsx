"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AxisBars } from "@/components/AxisBars";
import { AxisRadar } from "@/components/AxisRadar";
import { EssentialSummary } from "@/components/EssentialSummary";
import { ShareResult } from "@/components/ShareResult";
import { computeResult } from "@/lib/scoring";
import { loadChoices } from "@/lib/storage";
import type { ScoreResult } from "@/lib/types";

export default function ResultPage() {
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [empty, setEmpty] = useState(false);

  useEffect(() => {
    const ids = loadChoices();
    if (ids.length === 0) {
      setEmpty(true);
      return;
    }
    setResult(computeResult(ids));
  }, []);

  if (empty) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <p className="text-[var(--ink-soft)]">
          Nenhuma escolha encontrada. Percorra a história primeiro.
        </p>
        <Link
          href="/play"
          className="mt-6 inline-flex rounded-lg bg-[var(--accent)] px-5 py-2.5 font-semibold"
        >
          Ir para a história
        </Link>
      </div>
    );
  }

  if (!result) {
    return (
      <p className="mx-auto text-[var(--muted)]" aria-live="polite">
        Calculando perfil…
      </p>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center pb-16">
      <p className="text-sm tracking-wide text-[var(--accent)] uppercase">
        Seu perfil em Valmora
      </p>
      <h1 className="mt-2 text-center font-[family-name:var(--font-display)] text-3xl text-[var(--ink)] sm:text-4xl">
        {result.archetype.name}
      </h1>
      <p className="mt-4 max-w-xl text-center text-lg leading-relaxed text-[var(--ink-soft)]">
        {result.archetype.description}
      </p>

      <div className="mt-10 w-full flex justify-center">
        <EssentialSummary
          ranked={result.rankedByEssentiality}
          profiles={result.profiles}
        />
      </div>

      <div className="mt-12">
        <AxisRadar values={result.display} />
      </div>

      <h2 className="mt-12 font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
        Dez eixos — posição e essencialidade
      </h2>
      <p className="mt-2 max-w-md text-center text-sm text-[var(--muted)]">
        Posição (0–100) mostra o pólo; essencialidade mostra o quanto o tema foi
        tratado como núcleo ou como zona limítrofe/negociável.
      </p>

      <div className="mt-8 w-full flex justify-center">
        <AxisBars profiles={result.profiles} />
      </div>

      <ShareResult result={result} />

      <Link
        href="/"
        className="mt-12 inline-flex rounded-lg border border-[var(--line)] px-5 py-2.5 font-medium text-[var(--ink)] transition-colors hover:border-[var(--accent-muted)]"
      >
        Recomeçar
      </Link>
    </div>
  );
}
