import Link from "next/link";
import { ResumeQuiz } from "@/components/ResumeQuiz";
import { story } from "@/lib/scoring";
import {
  TEST_MODE_ORDER,
  TEST_MODES,
  modeDurationMinutes,
  playHref,
  resolvedSceneCount,
} from "@/lib/testModes";

export default function HomePage() {
  const totalScenes = story.scenes.length;

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
        Não há resposta certa — só escolhas com prós e contras. Há dois testes
        independentes: Meu Perfil, em Valmora, e Meu Estado, a fundação de um
        país novo.
      </p>

      <ResumeQuiz />

      <section id="modos" className="mt-10 scroll-mt-8">
        <p className="text-sm tracking-wide text-[var(--accent)] uppercase">
          Valmora
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
          Meu Perfil
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Dez eixos, essencialidade e arquétipo. Cada dilema leva cerca de 1
          minuto. Nos modos rápido e padrão, entram primeiro as cenas de maior
          saliência — as que mais pesam no resultado.
        </p>

        <ul className="mt-5 flex flex-col gap-3">
          {TEST_MODE_ORDER.map((id) => {
            const mode = TEST_MODES[id];
            const count = resolvedSceneCount(id, totalScenes);
            const minutes = modeDurationMinutes(id, count);
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

      <section id="meu-estado" className="mt-14 scroll-mt-8 border-t border-[var(--line)] pt-10">
        <p className="text-sm tracking-wide text-[var(--accent)] uppercase">
          Outro teste
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
          Meu Estado
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Você ajuda a escrever as primeiras regras de um país novo, longe de
          Valmora. Cada resposta muda a pergunta seguinte. No fim, Meu Estado
          Ideal mostra o que esse jeito de mandar resolve e o que cobra. Não
          muda Meu Perfil.
        </p>
        <Link
          href="/estado"
          className="mt-5 flex flex-col gap-1 rounded-lg border border-[var(--line)] px-5 py-4 text-[var(--ink)] transition-colors hover:border-[var(--accent-muted)] sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
        >
          <span>
            <span className="block font-semibold">Meu Estado</span>
            <span className="mt-1 block text-sm text-[var(--muted)]">
              Fundar um país novo. Cada resposta muda a próxima pergunta.
            </span>
          </span>
          <span className="shrink-0 text-sm tabular-nums text-[var(--muted)]">
            Cerca de 13 a 16 dilemas · ~15 min
          </span>
        </Link>
        <Link
          href="/organizacoes"
          className="mt-4 inline-flex rounded-lg border border-[var(--line)] px-5 py-2.5 font-medium text-[var(--ink)] transition-colors hover:border-[var(--accent-muted)]"
        >
          Ver organizações
        </Link>
      </section>
    </div>
  );
}
