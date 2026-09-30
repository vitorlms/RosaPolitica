"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ResultView } from "@/components/ResultView";
import { scoreInstitutions } from "@/lib/institutions";
import { computeResult } from "@/lib/scoring";
import {
  clearInProgress,
  loadChoices,
  loadSavedResult,
  saveSavedResult,
} from "@/lib/storage";
import type { InstitutionPick, ScoreResult } from "@/lib/types";

export default function ResultPage() {
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [institutions, setInstitutions] = useState<InstitutionPick[]>([]);
  const [empty, setEmpty] = useState(false);

  useEffect(() => {
    const ids = loadChoices();
    if (ids.length === 0) {
      setEmpty(true);
      return;
    }
    if (!loadSavedResult()) {
      saveSavedResult({
        choiceIds: ids,
        mode: "padrao",
        savedAt: new Date().toISOString(),
      });
    }
    const saved = loadSavedResult();
    if (saved) clearInProgress(saved.mode);
    setResult(computeResult(ids));
    setInstitutions(scoreInstitutions(ids));
  }, []);

  if (empty) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <p className="text-[var(--ink-soft)]">
          Nenhuma escolha encontrada. Percorra a história primeiro.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-lg bg-[var(--accent)] px-5 py-2.5 font-semibold"
        >
          Escolher o teste
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

  return <ResultView result={result} institutions={institutions} />;
}
