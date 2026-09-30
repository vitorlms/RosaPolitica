import { institutionCatalog } from "@/lib/institutions";
import type { InstitutionOption, InstitutionPick } from "@/lib/types";

interface GovernoIdealProps {
  picks: InstitutionPick[];
}

function optionById(
  options: InstitutionOption[],
  optionId: string | null | undefined,
): InstitutionOption | null {
  if (!optionId) return null;
  return options.find((option) => option.id === optionId) ?? null;
}

/**
 * Second result block. Labels name a mechanism, a problem, and a cost —
 * never a regime, party, or ideology.
 */
export function GovernoIdeal({ picks }: GovernoIdealProps) {
  const byCategory = new Map(picks.map((pick) => [pick.categoryId, pick]));
  const anySupport = picks.some((pick) => (pick.support ?? 0) > 0);

  return (
    <section
      aria-labelledby="governo-ideal-title"
      data-block="governo-ideal"
      className="mt-16 w-full border-t border-[var(--line)] pt-12"
    >
      <p className="text-center text-sm tracking-wide text-[var(--accent)] uppercase">
        Arranjo
      </p>
      <h2
        id="governo-ideal-title"
        className="mt-2 text-center font-[family-name:var(--font-display)] text-2xl text-[var(--ink)] sm:text-3xl"
      >
        {institutionCatalog.resultTitle}
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-center text-sm leading-relaxed text-[var(--muted)]">
        {institutionCatalog.resultLead} Os dez eixos acima não entram nesta
        conta.
      </p>

      {anySupport ? (
        <ul className="mx-auto mt-8 flex w-full max-w-xl list-none flex-col gap-3 p-0">
          {institutionCatalog.categories.map((category) => {
            const pick = byCategory.get(category.id);
            const open = !pick || pick.open !== false;
            const winner = open
              ? null
              : optionById(category.options, pick?.optionId);
            const leader = optionById(category.options, pick?.optionId);
            const runnerUp = optionById(
              category.options,
              pick?.runnerUpOptionId,
            );
            const untouched = !leader;

            return (
              <li
                key={category.id}
                data-category={category.id}
                data-open={open ? "true" : "false"}
                className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-4 py-4 text-left"
              >
                <p className="text-sm text-[var(--accent)]">{category.name}</p>
                <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
                  {category.question}
                </p>
                {winner ? (
                  <>
                    <p className="mt-3 text-[1.05rem] leading-snug font-semibold text-[var(--ink)]">
                      {winner.label}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-[var(--ink-soft)]">
                      <span className="text-[var(--muted)]">Problema. </span>
                      {winner.solves}
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-[var(--ink-soft)]">
                      <span className="text-[var(--muted)]">Preço. </span>
                      {winner.tradeoff}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="mt-3 text-[1.05rem] leading-snug font-semibold text-[var(--ink)]">
                      Em aberto
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">
                      {untouched
                        ? "Nenhuma escolha deste teste separou um arranjo aqui."
                        : runnerUp && leader
                          ? `Ficou perto entre “${leader.label}” e “${runnerUp.label}”. Sem margem para indicar um só.`
                          : "Sem margem para indicar um arranjo."}
                    </p>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mx-auto mt-6 max-w-xl text-center text-sm leading-relaxed text-[var(--ink-soft)]">
          As escolhas salvas não incluem os dilemas de arranjo. Um teste novo
          preenche esta parte.
        </p>
      )}
    </section>
  );
}
