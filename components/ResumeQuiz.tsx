"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import { assessGovernment } from "@/lib/governoFlow";
import {
  IN_PROGRESS_UNREADY,
  assessInProgress,
  clearGovernmentProgress,
  clearInProgress,
  finishGovernment,
  finishQuiz,
  getGovernmentProgressServerSnapshot,
  getGovernmentProgressSnapshot,
  getInProgressServerSnapshot,
  getInProgressSnapshot,
  governmentProgressFromSnapshot,
  quizzesFromSnapshot,
  subscribeInProgress,
  type GovernmentProgress,
  type InProgressQuiz,
} from "@/lib/storage";
import {
  TEST_MODES,
  playHref,
  scenesForMode,
  type TestModeId,
} from "@/lib/testModes";

type ResumeEntry =
  | { kind: "positioning"; progress: InProgressQuiz; total: number }
  | { kind: "governo"; progress: GovernmentProgress };

export function ResumeQuiz() {
  const router = useRouter();
  const positioningSnapshot = useSyncExternalStore(
    subscribeInProgress,
    getInProgressSnapshot,
    getInProgressServerSnapshot,
  );
  const governoSnapshot = useSyncExternalStore(
    subscribeInProgress,
    getGovernmentProgressSnapshot,
    getGovernmentProgressServerSnapshot,
  );

  const items = useMemo(() => {
    if (
      positioningSnapshot === IN_PROGRESS_UNREADY ||
      governoSnapshot === IN_PROGRESS_UNREADY
    ) {
      return null;
    }
    const resumable: ResumeEntry[] = [];
    for (const saved of quizzesFromSnapshot(positioningSnapshot)) {
      const status = assessInProgress(saved, scenesForMode(saved.mode));
      if (status === "resume") {
        resumable.push({
          kind: "positioning",
          progress: saved,
          total: scenesForMode(saved.mode).length,
        });
      }
    }
    const governo = governmentProgressFromSnapshot(governoSnapshot);
    if (governo && assessGovernment(governo) === "resume") {
      resumable.push({
        kind: "governo",
        progress: governo,
      });
    }
    resumable.sort((a, b) =>
      b.progress.updatedAt.localeCompare(a.progress.updatedAt),
    );
    return resumable;
  }, [positioningSnapshot, governoSnapshot]);

  useEffect(() => {
    if (
      positioningSnapshot === IN_PROGRESS_UNREADY ||
      governoSnapshot === IN_PROGRESS_UNREADY
    ) {
      return;
    }

    const positioningDone: InProgressQuiz[] = [];
    for (const saved of quizzesFromSnapshot(positioningSnapshot)) {
      const status = assessInProgress(saved, scenesForMode(saved.mode));
      if (status === "complete") positioningDone.push(saved);
      else if (status !== "resume") clearInProgress(saved.mode);
    }

    const governo = governmentProgressFromSnapshot(governoSnapshot);
    const governoStatus = governo ? assessGovernment(governo) : null;
    if (governo && governoStatus !== "resume" && governoStatus !== "complete") {
      clearGovernmentProgress();
    }

    if (positioningDone.length === 0 && governoStatus !== "complete") return;

    const [newestPositioning, ...olderPositioning] = positioningDone;
    if (newestPositioning) {
      finishQuiz(newestPositioning.choiceIds, newestPositioning.mode);
      for (const item of olderPositioning) clearInProgress(item.mode);
    }
    if (governo && governoStatus === "complete") {
      finishGovernment(governo.choiceIds, { countryName: governo.countryName });
    }

    const positioningAt = newestPositioning?.updatedAt ?? "";
    const governoAt =
      governo && governoStatus === "complete" ? governo.updatedAt : "";
    if (governoAt > positioningAt) {
      router.replace("/estado/resultado");
    } else if (newestPositioning) {
      router.replace("/perfil");
    }
  }, [positioningSnapshot, governoSnapshot, router]);

  function discardPositioning(mode: TestModeId) {
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
        Pode fechar a aba e voltar depois — fica neste navegador. Meu Perfil e
        Meu Estado não se misturam.
      </p>
      <ul className="mt-4 flex flex-col gap-4">
        {items.map((entry) => {
          if (entry.kind === "governo") {
            const situation = entry.progress.index + 1;
            const place = entry.progress.countryName?.trim();
            return (
              <li key="governo">
                <p className="text-sm text-[var(--ink-soft)]">
                  {entry.progress.choiceIds.length === 0
                    ? place
                      ? `Você parou em Meu Estado, logo depois de escolher o nome ${place}.`
                      : "Você parou em Meu Estado, logo depois de escolher o nome do país."
                    : place
                      ? `Você parou em Meu Estado, na fundação de ${place}, na situação ${situation}. O caminho muda com a resposta.`
                      : `Você parou em Meu Estado, na situação ${situation}. O caminho muda com a resposta.`}
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <Link
                    href="/estado"
                    aria-label="Continuar Meu Estado"
                    className="inline-flex rounded-lg bg-[var(--accent)] px-5 py-2.5 font-semibold text-[var(--ink)] transition-opacity hover:opacity-90"
                  >
                    Continuar
                  </Link>
                  <button
                    type="button"
                    onClick={() => clearGovernmentProgress()}
                    aria-label="Apagar Meu Estado e escolher de novo"
                    className="inline-flex rounded-lg border border-[var(--line)] px-5 py-2.5 font-medium text-[var(--ink)] transition-colors hover:border-[var(--accent-muted)]"
                  >
                    Apagar e escolher de novo
                  </button>
                </div>
              </li>
            );
          }

          const modeLabel = TEST_MODES[entry.progress.mode].label;
          const situation = entry.progress.index + 1;
          return (
            <li key={entry.progress.mode}>
              <p className="text-sm text-[var(--ink-soft)]">
                Você parou em Meu Perfil, no modo {modeLabel}, na situação{" "}
                {situation} de {entry.total}.
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <Link
                  href={playHref(entry.progress.mode)}
                  aria-label={`Continuar o modo ${modeLabel}`}
                  className="inline-flex rounded-lg bg-[var(--accent)] px-5 py-2.5 font-semibold text-[var(--ink)] transition-opacity hover:opacity-90"
                >
                  Continuar
                </Link>
                <button
                  type="button"
                  onClick={() => discardPositioning(entry.progress.mode)}
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
