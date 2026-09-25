"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AxisBars } from "@/components/AxisBars";
import { AxisRadar } from "@/components/AxisRadar";
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
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center">
      <p className="text-sm tracking-wide text-[var(--accent)] uppercase">
        Seu perfil em Valmora
      </p>
      <h1 className="mt-2 text-center font-[family-name:var(--font-display)] text-3xl text-[var(--ink)] sm:text-4xl">
        {result.archetype.name}
      </h1>
      <p className="mt-4 max-w-xl text-center text-lg leading-relaxed text-[var(--ink-soft)]">
        {result.archetype.description}
      </p>

      <div className="mt-10">
        <AxisRadar values={result.display} />
      </div>

      <div className="mt-10 w-full flex justify-center">
        <AxisBars values={result.display} />
      </div>

      <p className="mt-8 max-w-md text-center text-sm text-[var(--muted)]">
        Valores de 0 a 100: próximo de 0 aproxima-se do pólo da esquerda na
        barra; próximo de 100, do pólo da direita. Não há pontuação “boa” ou
        “ruim”.
      </p>

      <Link
        href="/"
        className="mt-10 inline-flex rounded-lg border border-[var(--line)] px-5 py-2.5 font-medium text-[var(--ink)] transition-colors hover:border-[var(--accent-muted)]"
      >
        Recomeçar
      </Link>
    </div>
  );
}
