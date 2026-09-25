"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChoiceButton } from "@/components/ChoiceButton";
import { SceneCard } from "@/components/SceneCard";
import { story } from "@/lib/scoring";
import { clearChoices, saveChoices } from "@/lib/storage";

/** Brief pause so the selected answer is readable before the scene fades. */
const SELECT_HOLD_MS = 420;
const EXIT_MS = 300;
const ENTER_MS = 420;

type Phase = "idle" | "exiting" | "entering";

export default function PlayPage() {
  const router = useRouter();
  const scenes = story.scenes;
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [locked, setLocked] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  function clearTimers() {
    for (const id of timers.current) clearTimeout(id);
    timers.current = [];
  }

  function later(ms: number, fn: () => void) {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
  }

  useEffect(() => {
    clearChoices();
    setReady(true);
    return () => clearTimers();
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

  function advanceTo(nextIndex: number, nextAnswers: string[]) {
    setIndex(nextIndex);
    setSelected(nextAnswers[nextIndex] ?? null);
    setPhase("entering");
    later(ENTER_MS, () => {
      setPhase("idle");
      setLocked(false);
    });
  }

  function selectChoice(choiceId: string) {
    if (locked) return;
    setLocked(true);
    setSelected(choiceId);

    const nextAnswers = [...answers.slice(0, index), choiceId];
    setAnswers(nextAnswers);

    later(SELECT_HOLD_MS, () => {
      setPhase("exiting");
      later(EXIT_MS, () => {
        if (isLast) {
          saveChoices(nextAnswers);
          router.push("/result");
          return;
        }
        advanceTo(index + 1, nextAnswers);
      });
    });
  }

  function goBack() {
    if (locked) return;

    if (isFirst) {
      router.push("/");
      return;
    }

    clearTimers();
    setLocked(true);
    setPhase("exiting");
    later(EXIT_MS, () => {
      advanceTo(index - 1, answers);
    });
  }

  const sceneMotion =
    phase === "exiting"
      ? "scene-exit"
      : phase === "entering"
        ? "scene-enter"
        : undefined;

  return (
    <div className="flex flex-1 flex-col">
      <div key={scene.id} className={sceneMotion}>
        <SceneCard scene={scene} index={index} total={scenes.length}>
          {scene.choices.map((choice) => (
            <ChoiceButton
              key={choice.id}
              choice={choice}
              selected={selected === choice.id}
              dimmed={locked && selected !== choice.id}
              onSelect={selectChoice}
            />
          ))}
        </SceneCard>
      </div>
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
