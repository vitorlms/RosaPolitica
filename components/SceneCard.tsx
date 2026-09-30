import type { ReactNode } from "react";
import type { Scene } from "@/lib/types";

interface SceneCardProps {
  scene: Scene;
  index: number;
  total: number;
  /** Short chapter label above the situation counter. */
  kicker?: string;
  children: ReactNode;
}

export function SceneCard({
  scene,
  index,
  total,
  kicker,
  children,
}: SceneCardProps) {
  return (
    <article className="mx-auto w-full max-w-2xl">
      {kicker ? (
        <p className="mb-1 text-sm tracking-wide text-[var(--accent)] uppercase">
          {kicker}
        </p>
      ) : null}
      <p className="mb-3 text-sm tracking-wide text-[var(--muted)] uppercase">
        Situação {index + 1} de {total}
      </p>
      <h1 className="font-[family-name:var(--font-display)] text-3xl leading-tight text-[var(--ink)] sm:text-4xl">
        {scene.title}
      </h1>
      <p className="mt-5 text-lg leading-relaxed text-[var(--ink-soft)]">
        {scene.body}
      </p>
      <div className="mt-8 flex flex-col gap-3">{children}</div>
    </article>
  );
}
