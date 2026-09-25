"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChoiceButton } from "@/components/ChoiceButton";
import { SceneCard } from "@/components/SceneCard";
import { story } from "@/lib/scoring";
import { clearChoices, saveChoices } from "@/lib/storage";

export default function PlayPage() {
  const router = useRouter();
  const scenes = story.scenes;
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [choices, setChoices] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    clearChoices();
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <p className="mx-auto text-[var(--muted)]" aria-live="polite">
        Preparando…
      </p>
    );
  }

  const scene = scenes[index];
  const isLast = index === scenes.length - 1;

  function advance() {
    if (!selected) return;
    const nextChoices = [...choices, selected];
    if (isLast) {
      saveChoices(nextChoices);
      router.push("/result");
      return;
    }
    setChoices(nextChoices);
    setSelected(null);
    setIndex((i) => i + 1);
  }

  return (
    <div className="flex flex-1 flex-col">
      <SceneCard scene={scene} index={index} total={scenes.length}>
        {scene.choices.map((choice) => (
          <ChoiceButton
            key={choice.id}
            choice={choice}
            selected={selected === choice.id}
            onSelect={setSelected}
          />
        ))}
      </SceneCard>
      <div className="mx-auto mt-8 w-full max-w-2xl">
        <button
          type="button"
          disabled={!selected}
          onClick={advance}
          className="rounded-lg bg-[var(--accent)] px-6 py-3 font-semibold text-[var(--ink)] transition-opacity enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isLast ? "Ver resultado" : "Continuar"}
        </button>
      </div>
    </div>
  );
}
