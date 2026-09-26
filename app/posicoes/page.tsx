import type { Metadata } from "next";
import Link from "next/link";
import { archetypes } from "@/lib/scoring";
import { AXIS_IDS, AXIS_LABELS, type AxisId, type AxisScores } from "@/lib/types";

export const metadata: Metadata = {
  title: "Posições possíveis — Rosa Política",
  description:
    "Como o Rosa Política define o perfil e quais arquétipos o teste pode atribuir.",
};

function leanPhrase(axis: AxisId, value: number): string {
  const meta = AXIS_LABELS[axis];
  if (value >= 0.35) return `${meta.name}: ${meta.high}`;
  if (value <= -0.35) return `${meta.name}: ${meta.low}`;
  return `${meta.name}: perto do centro`;
}

/** Strongest absolute leans in the archetype centroid. */
function topLeans(centroid: AxisScores, limit = 3): string[] {
  return [...AXIS_IDS]
    .map((axis) => ({ axis, value: centroid[axis] ?? 0 }))
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    .filter((item) => Math.abs(item.value) >= 0.25)
    .slice(0, limit)
    .map((item) => leanPhrase(item.axis, item.value));
}

export default function PosicoesPage() {
  return (
    <div className="mx-auto w-full max-w-2xl pb-16">
      <p className="text-sm tracking-wide text-[var(--accent)] uppercase">
        Como o resultado funciona
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-[var(--ink)] sm:text-4xl">
        Posições possíveis
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-[var(--ink-soft)]">
        No fim do teste, suas escolhas viram um perfil em dez eixos. O sistema
        compara esse perfil com posições de referência e mostra a mais próxima —
        o arquétipo — além do quanto cada tema pesou nas suas respostas.
      </p>
      <p className="mt-3 text-[var(--muted)]">
        Não é um rótulo moral nem um diagnóstico fechado. É um resumo da
        direção das suas escolhas neste conjunto de dilemas.
      </p>

      <section className="mt-12">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
          Os dez eixos
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Cada eixo vai de um pólo ao outro. A posição mostra para onde você
          inclina; a essencialidade mostra o quanto o tema pesou de verdade.
        </p>
        <ul className="mt-6 flex flex-col">
          {AXIS_IDS.map((axis) => {
            const meta = AXIS_LABELS[axis];
            return (
              <li
                key={axis}
                className="border-b border-[var(--line)] py-3 first:border-t"
              >
                <p className="font-medium text-[var(--ink)]">{meta.name}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {meta.low} ↔ {meta.high}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-14">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
          Arquétipos que o teste pode atribuir
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          São {archetypes.length} posições de referência. O resultado é a que
          fica mais perto do seu perfil nos eixos. Os nomes de pessoas abaixo
          são só ilustrações aproximadas — ninguém cabe inteiro num arquétipo.
        </p>

        <ol className="mt-8 flex flex-col gap-10">
          {archetypes.map((arch, index) => {
            const leans = topLeans(arch.centroid);
            const examples = arch.examples ?? [];
            return (
              <li key={arch.id} id={arch.id} className="scroll-mt-8">
                <p className="text-sm tabular-nums text-[var(--muted)]">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-1 font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
                  {arch.name}
                </h3>
                <p className="mt-3 leading-relaxed text-[var(--ink-soft)]">
                  {arch.description}
                </p>
                {leans.length > 0 ? (
                  <ul className="mt-4 flex flex-col gap-1.5">
                    {leans.map((line) => (
                      <li
                        key={line}
                        className="text-sm text-[var(--muted)] before:mr-2 before:text-[var(--accent)] before:content-['·']"
                      >
                        {line}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {examples.length > 0 ? (
                  <div className="mt-5">
                    <p className="text-sm font-medium text-[var(--ink)]">
                      Exemplos ilustrativos
                    </p>
                    <ul className="mt-2 flex flex-col gap-2">
                      {examples.map((ex) => (
                        <li key={ex.name} className="text-sm text-[var(--ink-soft)]">
                          <span className="text-[var(--ink)]">{ex.name}</span>
                          <span className="text-[var(--muted)]"> — {ex.note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      </section>

      <div className="mt-14 flex flex-wrap gap-3">
        <Link
          href="/play"
          className="inline-flex rounded-lg bg-[var(--accent)] px-5 py-2.5 font-semibold text-[var(--ink)] transition-opacity hover:opacity-90"
        >
          Fazer o teste
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
