import Link from "next/link";
import type { ReactNode } from "react";
import { AxisBars } from "@/components/AxisBars";
import { AxisRadar } from "@/components/AxisRadar";
import { PoliticalAgenda } from "@/components/PoliticalAgenda";
import { ShareResult } from "@/components/ShareResult";
import type { ScoreResult } from "@/lib/types";

export interface ResultViewProps {
  result: ScoreResult;
  /** Optional line under the eyebrow (e.g. saved date / mode). */
  meta?: ReactNode;
  /** Footer actions; defaults to posições + recomeçar. */
  actions?: ReactNode;
}

export function ResultView({ result, meta, actions }: ResultViewProps) {
  const examples = result.archetype.examples ?? [];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center pb-16">
      <p className="text-sm tracking-wide text-[var(--accent)] uppercase">
        Seu perfil
      </p>
      <h1 className="mt-2 text-center font-[family-name:var(--font-display)] text-3xl text-[var(--ink)] sm:text-4xl">
        {result.archetype.name}
      </h1>
      {meta ? (
        <p className="mt-2 text-center text-sm text-[var(--muted)]">{meta}</p>
      ) : null}
      <p className="mt-4 max-w-xl text-center text-lg leading-relaxed text-[var(--ink-soft)]">
        {result.archetype.description}
      </p>

      {examples.length > 0 ? (
        <section className="mt-8 w-full max-w-xl text-center sm:text-left">
          <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
            Exemplos ilustrativos
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Pessoas usadas só como referência aproximada — ninguém cabe inteiro
            neste arquétipo.
          </p>
          <ul className="mt-4 flex flex-col gap-2">
            {examples.map((ex) => (
              <li key={ex.name} className="text-sm text-[var(--ink-soft)]">
                <span className="text-[var(--ink)]">{ex.name}</span>
                <span className="text-[var(--muted)]"> — {ex.note}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {result.drivers.length > 0 ? (
        <section className="mt-10 w-full max-w-xl">
          <h2 className="text-center font-[family-name:var(--font-display)] text-xl text-[var(--ink)] sm:text-left">
            Por que este perfil?
          </h2>
          <p className="mt-1 text-center text-sm text-[var(--muted)] sm:text-left">
            As escolhas que mais puxaram este resultado.
          </p>
          <ol className="mt-4 flex list-none flex-col gap-3 p-0">
            {result.drivers.map((driver, index) => (
              <li
                key={driver.choiceId}
                className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-left"
              >
                <p className="text-sm text-[var(--accent)]">
                  <span className="mr-2 tabular-nums text-[var(--muted)]">
                    {index + 1}
                  </span>
                  {driver.sceneTitle}
                </p>
                <p className="mt-1.5 text-[0.95rem] leading-snug text-[var(--ink)]">
                  {driver.choiceLabel}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">
                  {driver.reason}
                </p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <div className="mt-10 w-full flex justify-center">
        <PoliticalAgenda
          ranked={result.rankedByEssentiality}
          profiles={result.profiles}
        />
      </div>

      <div className="mt-12">
        <AxisRadar values={result.display} />
      </div>

      <h2 className="mt-12 font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
        Dez eixos — posição
      </h2>
      <p className="mt-2 max-w-md text-center text-sm text-[var(--muted)]">
        Posição mostra para onde você inclina em cada tema. A agenda política
        (acima) traz as pautas mais relevantes das suas escolhas.
      </p>

      <div className="mt-8 w-full flex justify-center">
        <AxisBars profiles={result.profiles} />
      </div>

      <ShareResult result={result} />

      <div className="mt-12 flex flex-wrap justify-center gap-3">
        {actions ?? (
          <>
            <Link
              href="/posicoes"
              className="inline-flex rounded-lg border border-[var(--line)] px-5 py-2.5 font-medium text-[var(--ink)] transition-colors hover:border-[var(--accent-muted)]"
            >
              Ver todas as posições
            </Link>
            <Link
              href="/"
              className="inline-flex rounded-lg border border-[var(--line)] px-5 py-2.5 font-medium text-[var(--ink)] transition-colors hover:border-[var(--accent-muted)]"
            >
              Recomeçar
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
