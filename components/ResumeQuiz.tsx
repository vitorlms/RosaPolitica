"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import {
  IN_PROGRESS_UNREADY,
  assessInProgress,
  clearInProgress,
  finishQuiz,
  getInProgressServerSnapshot,
  getInProgressSnapshot,
  quizzesFromSnapshot,
  subscribeInProgress,
  type InProgressQuiz,
} from "@/lib/storage";
import {
  TEST_MODES,
  playHref,
  scenesForMode,
  type TestModeId,
} from "@/lib/testModes";

export function ResumeQuiz() {
  const router = useRouter();
  const snapshot = useSyncExternalStore(
    subscribeInProgress,
    getInProgressSnapshot,
    getInProgressServerSnapshot,
  );

  const items = useMemo(() => {
    if (snapshot === IN_PROGRESS_UNREADY) return null;
    const resumable: InProgressQuiz[] = [];
    for (const saved of quizzesFromSnapshot(snapshot)) {
      const status = assessInProgress(saved, scenesForMode(saved.mode));
      if (status === "resume") resumable.push(saved);
    }
    return resumable;
  }, [snapshot]);

  useEffect(() => {
    if (snapshot === IN_PROGRESS_UNREADY) return;
    const complete: InProgressQuiz[] = [];
    for (const saved of quizzesFromSnapshot(snapshot)) {
      const status = assessInProgress(saved, scenesForMode(saved.mode));
      if (status === "complete") complete.push(saved);
      else if (status !== "resume") clearInProgress(saved.mode);
    }
    if (complete.length === 0) return;
    const [newest, ...older] = complete;
    finishQuiz(newest.choiceIds, newest.mode);
    for (const item of older) clearInProgress(item.mode);
    router.replace("/result");
  }, [snapshot, router]);

  function discard(mode: TestModeId) {
    clearInProgress(mode);
  }

  if (!items || items.length === 0) return null;

  return (
    <section
      aria-label="Continuar o teste"
      className="mt-10 rounded-lg border border-[var(--accent-muted)] bg-[var(--surface)] px-5 py-4"
    >
      <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
        Continuar de onde parou
      </h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Pode fechar a aba e voltar depois — fica neste navegador.
      </p>
      <ul className="mt-4 flex flex-col gap-4">
        {items.map((progress) => {
          const modeLabel = TEST_MODES[progress.mode].label;
          const total = scenesForMode(progress.mode).length;
          const situation = progress.index + 1;

          return (
            <li key={progress.mode}>
              <p className="text-sm text-[var(--ink-soft)]">
                Você parou no modo {modeLabel}, na situação {situation} de{" "}
                {total}.
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <Link
                  href={playHref(progress.mode)}
                  aria-label={`Continuar o modo ${modeLabel}`}
                  className="inline-flex rounded-lg bg-[var(--accent)] px-5 py-2.5 font-semibold text-[var(--ink)] transition-opacity hover:opacity-90"
                >
                  Continuar
                </Link>
                <button
                  type="button"
                  onClick={() => discard(progress.mode)}
                  aria-label={`Apagar o modo ${modeLabel} e escolher de novo`}
                  className="inline-flex rounded-lg border border-[var(--line)] px-5 py-2.5 font-medium text-[var(--ink)] transition-colors hover:border-[var(--accent-muted)]"
                >
                  Apagar e escolher de novo
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
