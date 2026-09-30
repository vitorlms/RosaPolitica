import Link from "next/link";
import { ResumeQuiz } from "@/components/ResumeQuiz";
import { story } from "@/lib/scoring";
import {
  TEST_MODE_ORDER,
  TEST_MODES,
  modeDurationMinutes,
  playHref,
  scenesForMode,
} from "@/lib/testModes";

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center">
      <p className="text-sm tracking-wide text-[var(--accent)] uppercase">
        Teste político
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl leading-tight text-[var(--ink)] sm:text-5xl">
        Rosa Política
      </h1>
      <p className="mt-2 font-[family-name:var(--font-display)] text-xl text-[var(--ink-soft)]">
        {story.world.name}
      </p>
      <p className="mt-6 text-lg leading-relaxed text-[var(--ink-soft)]">
        {story.world.summary}
      </p>
      <p className="mt-4 text-[var(--muted)]">
        Não há resposta certa — só escolhas com prós e contras. No fim, você vê
        um perfil em dez eixos (para onde inclina e o que pesou mais), um
        arquétipo resumido, e um segundo bloco: o arranjo de governo, sem nome
        de regime.
      </p>

      <ResumeQuiz />

      <section id="modos" className="mt-10 scroll-mt-8">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
          Escolha o teste
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Cada dilema leva cerca de 1 minuto. Nos modos rápido e padrão, o
          perfil usa as cenas de maior saliência. No fim de cada modo entram
          dilemas de governo ideal — separados dos dez eixos.
        </p>

        <ul className="mt-5 flex flex-col gap-3">
          {TEST_MODE_ORDER.map((id) => {
            const mode = TEST_MODES[id];
            const count = scenesForMode(id).length;
            const minutes = modeDurationMinutes(count);
            const primary = id === "padrao";

            return (
              <li key={id}>
                <Link
                  href={playHref(id)}
                  className={
                    primary
                      ? "flex flex-col gap-1 rounded-lg bg-[var(--accent)] px-5 py-4 text-[var(--ink)] transition-opacity hover:opacity-90 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
                      : "flex flex-col gap-1 rounded-lg border border-[var(--line)] px-5 py-4 text-[var(--ink)] transition-colors hover:border-[var(--accent-muted)] sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
                  }
                >
                  <span>
                    <span className="block font-semibold">{mode.label}</span>
                    <span
                      className={
                        primary
                          ? "mt-1 block text-sm opacity-90"
                          : "mt-1 block text-sm text-[var(--muted)]"
                      }
                    >
                      {mode.summary}
                    </span>
                  </span>
                  <span
                    className={
                      primary
                        ? "shrink-0 text-sm font-medium tabular-nums opacity-90"
                        : "shrink-0 text-sm tabular-nums text-[var(--muted)]"
                    }
                  >
                    {count} dilemas · ~{minutes} min
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="mt-8">
        <Link
          href="/posicoes"
          className="inline-flex items-center rounded-lg border border-[var(--line)] px-6 py-3 font-medium text-[var(--ink)] transition-colors hover:border-[var(--accent-muted)]"
        >
          Ver posições possíveis
        </Link>
      </div>
    </div>
  );
}
