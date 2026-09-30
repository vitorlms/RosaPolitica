"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import {
  IN_PROGRESS_UNREADY,
  getSavedGovernmentServerSnapshot,
  getSavedGovernmentSnapshot,
  getSavedResultServerSnapshot,
  getSavedResultSnapshot,
  parseSavedGovernment,
  parseSavedResult,
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

export default function MeuResultadoPage() {
  const perfilRaw = useSyncExternalStore(
    subscribe,
    getSavedResultSnapshot,
    getSavedResultServerSnapshot,
  );
  const estadoRaw = useSyncExternalStore(
    subscribe,
    getSavedGovernmentSnapshot,
    getSavedGovernmentServerSnapshot,
  );
  const ready =
    perfilRaw !== IN_PROGRESS_UNREADY && estadoRaw !== IN_PROGRESS_UNREADY;
  const perfil = useMemo(() => parseSavedResult(perfilRaw), [perfilRaw]);
  const estado = useMemo(() => parseSavedGovernment(estadoRaw), [estadoRaw]);

  if (!ready) {
    return (
      <p className="mx-auto text-[var(--muted)]" aria-live="polite">
        Carregando…
      </p>
    );
  }

  const perfilLine = perfil
    ? `Modo ${TEST_MODES[perfil.mode].label} · salvo em ${formatSavedAt(perfil.savedAt)}`
    : null;
  const estadoLine = estado
    ? `Salvo em ${formatSavedAt(estado.savedAt)}${
        estado.countryName?.trim() ? ` · ${estado.countryName.trim()}` : ""
      }`
    : null;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col pb-16">
      <p className="text-sm tracking-wide text-[var(--accent)] uppercase">
        Dois resultados
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-[var(--ink)] sm:text-4xl">
        Meu Perfil e Meu Estado Ideal
      </h1>
      <p className="mt-4 text-[var(--ink-soft)]">
        Cada teste tem a própria página. Terminar um não exige o outro. Os dois
        ficam neste navegador, sem conta.
      </p>

      <ul className="mt-8 flex flex-col gap-4">
        <li className="rounded-lg border border-[var(--line)] px-5 py-4">
          <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
            Meu Perfil
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {perfilLine ?? "Nada salvo. O teste é em Valmora, nos dez eixos."}
          </p>
          <Link
            href={perfilLine ? "/perfil" : "/#modos"}
            className="mt-4 inline-flex rounded-lg bg-[var(--accent)] px-5 py-2.5 font-semibold text-[var(--ink)]"
          >
            {perfilLine ? "Abrir Meu Perfil" : "Fazer Meu Perfil"}
          </Link>
        </li>
        <li className="rounded-lg border border-[var(--line)] px-5 py-4">
          <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
            Meu Estado Ideal
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {estadoLine ??
              "Nada salvo. Você escreve as primeiras regras de um país novo, longe de Valmora."}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={estadoLine ? "/estado/resultado" : "/estado"}
              className="inline-flex rounded-lg bg-[var(--accent)] px-5 py-2.5 font-semibold text-[var(--ink)]"
            >
              {estadoLine ? "Abrir Meu Estado Ideal" : "Fazer Meu Estado"}
            </Link>
            <Link
              href="/organizacoes"
              className="inline-flex rounded-lg border border-[var(--line)] px-5 py-2.5 font-medium text-[var(--ink)]"
            >
              Ver organizações
            </Link>
          </div>
        </li>
      </ul>
    </div>
  );
}
