import Link from "next/link";
import { ORGANIZATIONS, ORGANIZATIONS_DISCLAIMER } from "@/lib/organizacoes";

export default function OrganizacoesPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col pb-16">
      <p className="text-sm tracking-wide text-[var(--accent)] uppercase">
        Meu Estado
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-[var(--ink)] sm:text-4xl">
        Organizações
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--ink-soft)]">
        Os nove arranjos que o teste pode desenhar. Cada um é um jeito de
        decidir quem manda, até quando, e quem pode desfazer.
      </p>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
        {ORGANIZATIONS_DISCLAIMER}
      </p>

      <nav aria-label="As nove organizações" className="mt-8">
        <ul className="flex flex-col gap-2">
          {ORGANIZATIONS.map((org) => (
            <li key={org.id}>
              <Link
                href={`#${org.id}`}
                className="text-[var(--ink)] underline decoration-[var(--line)] underline-offset-4 hover:decoration-[var(--accent)]"
              >
                {org.classroomName}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-10 flex flex-col gap-8">
        {ORGANIZATIONS.map((org) => (
          <article
            key={org.id}
            id={org.id}
            className="scroll-mt-8 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-5 py-5"
          >
            <p className="text-sm text-[var(--accent)]">{org.classroomName}</p>
            <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl leading-snug text-[var(--ink)]">
              {org.title}
            </h2>
            <p className="mt-4 leading-relaxed text-[var(--ink-soft)]">
              {org.mechanism}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[var(--ink-soft)]">
              <span className="text-[var(--muted)]">Problema. </span>
              {org.problem}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--ink-soft)]">
              <span className="text-[var(--muted)]">Preço. </span>
              {org.cost}
            </p>
            <h3 className="mt-5 text-sm font-semibold text-[var(--ink)]">
              Como difere do vizinho
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-[var(--ink-soft)]">
              {org.differs}
            </p>
            <h3 className="mt-5 text-sm font-semibold text-[var(--ink)]">
              Perto disso hoje
            </h3>
            <ul className="mt-2 flex list-none flex-col gap-3 p-0">
              {org.examples.map((example) => (
                <li key={example.place} className="text-sm leading-relaxed">
                  <span className="text-[var(--ink)]">{example.place}</span>
                  <span className="text-[var(--ink-soft)]"> — {example.note}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link
          href="/estado"
          className="inline-flex rounded-lg bg-[var(--accent)] px-5 py-2.5 font-semibold text-[var(--ink)]"
        >
          Fazer Meu Estado
        </Link>
        <Link
          href="/estado/resultado"
          className="inline-flex rounded-lg border border-[var(--line)] px-5 py-2.5 font-medium text-[var(--ink)]"
        >
          Meu Estado Ideal
        </Link>
      </div>
    </div>
  );
}
