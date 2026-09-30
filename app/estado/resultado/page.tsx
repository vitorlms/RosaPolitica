"use client";

import Link from "next/link";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import { GovernoIdeal } from "@/components/GovernoIdeal";
import { scoreGovernment } from "@/lib/governoFlow";
import {
  IN_PROGRESS_UNREADY,
  clearGovernmentProgress,
  getGovernmentSessionServerSnapshot,
  getGovernmentSessionSnapshot,
  getSavedGovernmentServerSnapshot,
  getSavedGovernmentSnapshot,
  parseGovernmentSession,
  parseSavedGovernment,
  saveSavedGovernment,
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
  const result = useMemo(
    () => (choiceIds.length > 0 ? scoreGovernment(choiceIds) : null),
    [choiceIds],
  );

  useEffect(() => {
    if (!ready || !fromSession || !result) return;
    if (!saved) {
      saveSavedGovernment({
        choiceIds: session.choiceIds,
        savedAt: new Date().toISOString(),
        countryName: session.countryName,
      });
    }
    clearGovernmentProgress();
  }, [ready, fromSession, result, saved, session.choiceIds, session.countryName]);

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
