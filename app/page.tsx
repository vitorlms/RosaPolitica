import Link from "next/link";
import { story } from "@/lib/scoring";

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center">
      <p className="text-sm tracking-wide text-[var(--accent)] uppercase">
        Protótipo conceitual
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
        Não há respostas certas — só escolhas com trade-offs. Ao final, você vê
        um perfil em cinco eixos e um arquétipo de Valmora.
      </p>
      <div className="mt-10">
        <Link
          href="/play"
          className="inline-flex items-center rounded-lg bg-[var(--accent)] px-6 py-3 font-semibold text-[var(--ink)] transition-opacity hover:opacity-90"
        >
          Começar
        </Link>
      </div>
    </div>
  );
}
