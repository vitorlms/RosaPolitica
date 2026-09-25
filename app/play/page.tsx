"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChoiceButton } from "@/components/ChoiceButton";
import { SceneCard } from "@/components/SceneCard";
import { story } from "@/lib/scoring";
import { clearChoices, saveChoices } from "@/lib/storage";

const ADVANCE_MS = 180;

export default function PlayPage() {
  const router = useRouter();
  const scenes = story.scenes;
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [locked, setLocked] = useState(false);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    clearChoices();
    setReady(true);
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, []);

  if (!ready) {
    return (
      <p className="mx-auto text-[var(--muted)]" aria-live="polite">
        Preparando…
      </p>
    );
  }

  const scene = scenes[index];
  const isFirst = index === 0;
  const isLast = index === scenes.length - 1;

  function selectChoice(choiceId: string) {
    if (locked) return;
    setLocked(true);
    setSelected(choiceId);

    const nextAnswers = [...answers.slice(0, index), choiceId];
    setAnswers(nextAnswers);

    advanceTimer.current = setTimeout(() => {
      if (isLast) {
        saveChoices(nextAnswers);
        router.push("/result");
        return;
      }
      const nextIndex = index + 1;
      setIndex(nextIndex);
      setSelected(nextAnswers[nextIndex] ?? null);
      setLocked(false);
    }, ADVANCE_MS);
  }

  function goBack() {
    if (locked) return;
    if (advanceTimer.current) {
      clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
    setLocked(false);

    if (isFirst) {
      router.push("/");
      return;
    }

    const prevIndex = index - 1;
    setIndex(prevIndex);
    setSelected(answers[prevIndex] ?? null);
  }

  return (
    <div className="flex flex-1 flex-col">
      <SceneCard scene={scene} index={index} total={scenes.length}>
        {scene.choices.map((choice) => (
          <ChoiceButton
            key={choice.id}
            choice={choice}
            selected={selected === choice.id}
            onSelect={selectChoice}
          />
        ))}
      </SceneCard>
      <div className="mx-auto mt-8 flex w-full max-w-2xl gap-3">
        <button
          type="button"
          onClick={goBack}
          disabled={locked}
          className="rounded-lg border border-[var(--line)] px-6 py-3 font-medium text-[var(--ink)] transition-colors hover:border-[var(--accent-muted)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Voltar
        </button>
      </div>
    </div>
  );
}
