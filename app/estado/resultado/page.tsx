"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { GovernoIdeal } from "@/components/GovernoIdeal";
import { SkippedQuestions } from "@/components/SkippedQuestions";
import { scoreGovernment, skippedQuestions } from "@/lib/governoFlow";
import {
  IN_PROGRESS_UNREADY,
  clearGovernmentProgress,
  getGovernmentProgressSnapshot,
  getGovernmentSessionServerSnapshot,
  getGovernmentSessionSnapshot,
  getSavedGovernmentServerSnapshot,
  getSavedGovernmentSnapshot,
  governmentProgressFromSnapshot,
  parseGovernmentSession,
  parseSavedGovernment,
  saveGovernmentChoices,
  saveGovernmentProgress,
  saveSavedGovernment,
  type GovernmentSession,
  type SavedGovernment,
} from "@/lib/storage";

function subscribe() {
  return () => {};
}

export default function EstadoResultadoPage() {
  const sessionRaw = useSyncExternalStore(
    subscribe,
    getGovernmentSessionSnapshot,
    getGovernmentSessionServerSnapshot,
  );
  const savedRaw = useSyncExternalStore(
    subscribe,
    getSavedGovernmentSnapshot,
    getSavedGovernmentServerSnapshot,
  );
  const ready =
    sessionRaw !== IN_PROGRESS_UNREADY && savedRaw !== IN_PROGRESS_UNREADY;
  const session = useMemo(
    () => parseGovernmentSession(sessionRaw),
    [sessionRaw],
  );
  const saved = useMemo(() => parseSavedGovernment(savedRaw), [savedRaw]);
  const fromSession = session.choiceIds.length > 0;
  const choiceIds = useMemo(
    () => (fromSession ? session.choiceIds : (saved?.choiceIds ?? [])),
    [fromSession, session.choiceIds, saved],
  );
  const countryName = fromSession ? session.countryName : saved?.countryName;
  const pathKey = choiceIds.join("\u0001");
  const storedExtras = useMemo(
    () => extrasFor(session, saved, choiceIds, fromSession),
    [session, saved, choiceIds, fromSession],
  );
  const [override, setOverride] = useState<ExtraOverride | null>(null);
  const active = override?.pathKey === pathKey ? override : null;
  const extraChoiceIds = active?.extraChoiceIds ?? storedExtras.extraChoiceIds;
  const extrasDismissed = active?.extrasDismissed ?? storedExtras.extrasDismissed;
  const result = useMemo(
    () =>
      choiceIds.length > 0 ? scoreGovernment(choiceIds, extraChoiceIds) : null,
    [choiceIds, extraChoiceIds],
  );

  useEffect(() => {
    if (!ready || !fromSession || !result) return;
    if (!saved) {
      saveSavedGovernment({
        choiceIds: session.choiceIds,
        savedAt: new Date().toISOString(),
        countryName: session.countryName,
        extraChoiceIds: extraChoiceIds.length > 0 ? extraChoiceIds : undefined,
        extrasDismissed: extrasDismissed || undefined,
      });
    }
    const remaining = skippedQuestions(choiceIds, extraChoiceIds);
    const untouched = extraChoiceIds.length === 0 && !extrasDismissed;
    if (untouched || (remaining.length === 0 && !extrasDismissed)) {
      clearGovernmentProgress();
      return;
    }
    saveGovernmentProgress({
      choiceIds,
      index: choiceIds.length,
      countryName,
      extraChoiceIds,
      extrasDismissed,
    });
  }, [
    ready,
    fromSession,
    result,
    saved,
    session.choiceIds,
    session.countryName,
    choiceIds,
    countryName,
    extraChoiceIds,
    extrasDismissed,
  ]);

  if (!ready) {
    return (
      <p className="mx-auto text-[var(--muted)]" aria-live="polite">
        Calculando arranjo…
      </p>
    );
  }

  if (choiceIds.length === 0 || !result) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <p className="text-sm tracking-wide text-[var(--accent)] uppercase">
          Meu Estado Ideal
        </p>
        <p className="mt-4 text-[var(--ink-soft)]">
          {choiceIds.length === 0
            ? "Nenhuma escolha de Meu Estado encontrada. Percorra o caminho primeiro."
            : "Estas escolhas não fecham o caminho deste teste. Comece de novo."}
        </p>
        <Link
          href="/estado"
          className="mt-6 inline-flex rounded-lg bg-[var(--accent)] px-5 py-2.5 font-semibold"
        >
          Começar Meu Estado
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center pb-16">
      <GovernoIdeal result={result} countryName={countryName} standalone />
      <SkippedQuestions
        choiceIds={choiceIds}
        extraChoiceIds={extraChoiceIds}
        countryName={countryName}
        dismissed={extrasDismissed}
        onAnswer={(choiceId) =>
          persistExtras(
            choiceIds,
            countryName,
            [...extraChoiceIds, choiceId],
            extrasDismissed,
            saved?.savedAt,
            setOverride,
          )
        }
        onDismiss={() =>
          persistExtras(
            choiceIds,
            countryName,
            extraChoiceIds,
            true,
            saved?.savedAt,
            setOverride,
          )
        }
        onReopen={() =>
          persistExtras(
            choiceIds,
            countryName,
            extraChoiceIds,
            false,
            saved?.savedAt,
            setOverride,
          )
        }
      />
      <div className="mt-12 flex flex-wrap justify-center gap-3">
        <Link
          href="/organizacoes"
          className="inline-flex rounded-lg bg-[var(--accent)] px-5 py-2.5 font-semibold text-[var(--ink)]"
        >
          Ver organizações
        </Link>
        <Link
          href="/perfil"
          className="inline-flex rounded-lg border border-[var(--line)] px-5 py-2.5 font-medium text-[var(--ink)] transition-colors hover:border-[var(--accent-muted)]"
        >
          Meu Perfil
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

interface ExtraOverride {
  pathKey: string;
  extraChoiceIds: string[];
  extrasDismissed: boolean;
}

function samePath(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((id, index) => id === right[index]);
}

function extrasFor(
  session: GovernmentSession,
  saved: SavedGovernment | null,
  choiceIds: readonly string[],
  fromSession: boolean,
): { extraChoiceIds: string[]; extrasDismissed: boolean } {
  const savedMatches = saved !== null && samePath(saved.choiceIds, choiceIds);
  if (fromSession && (session.extraChoiceIds || session.extrasDismissed)) {
    return {
      extraChoiceIds: session.extraChoiceIds ?? EMPTY_EXTRAS,
      extrasDismissed: session.extrasDismissed === true,
    };
  }
  if (savedMatches) {
    return {
      extraChoiceIds: saved.extraChoiceIds ?? EMPTY_EXTRAS,
      extrasDismissed: saved.extrasDismissed === true,
    };
  }
  return { extraChoiceIds: EMPTY_EXTRAS, extrasDismissed: false };
}

const EMPTY_EXTRAS: string[] = [];

function persistExtras(
  choiceIds: string[],
  countryName: string | undefined,
  extraChoiceIds: string[],
  extrasDismissed: boolean,
  savedAt: string | undefined,
  setOverride: (value: ExtraOverride) => void,
): void {
  const pathKey = choiceIds.join("\u0001");
  setOverride({ pathKey, extraChoiceIds, extrasDismissed });
  const extra = { extraChoiceIds, extrasDismissed };
  saveGovernmentChoices(choiceIds, countryName, extra);
  saveSavedGovernment({
    choiceIds,
    savedAt: savedAt ?? new Date().toISOString(),
    countryName,
    extraChoiceIds: extraChoiceIds.length > 0 ? extraChoiceIds : undefined,
    extrasDismissed: extrasDismissed || undefined,
  });
  const progress = governmentProgressFromSnapshot(getGovernmentProgressSnapshot());
  if (progress && samePath(progress.choiceIds, choiceIds)) {
    saveGovernmentProgress({
      choiceIds: progress.choiceIds,
      index: progress.index,
      countryName: progress.countryName,
      extraChoiceIds,
      extrasDismissed,
    });
  }
}
