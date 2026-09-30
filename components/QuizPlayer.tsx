"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChoiceButton } from "@/components/ChoiceButton";
import { SceneCard } from "@/components/SceneCard";
import { assessInProgress } from "@/lib/storage";
import type { Scene } from "@/lib/types";

/** Pause so the selected answer is readable before the scene fades. */
const SELECT_HOLD_MS = 650;
const EXIT_MS = 650;
const ENTER_MS = 550;

type Phase = "idle" | "exiting" | "entering";

export interface QuizProgress {
  choiceIds: string[];
  index: number;
}

interface QuizPlayerProps {
  scenes: Scene[];
  /** Line above the card, e.g. "Modo Rápido · 5 dilemas". */
  eyebrow: string;
  /**
   * `undefined` while storage cannot be read yet.
   * `null` when this track has no saved run.
   */
  saved: QuizProgress | null | undefined;
  onSave: (progress: QuizProgress) => void;
  onClear: () => void;
  onFinish: (choiceIds: string[], options?: { retainProgress?: boolean }) => void;
  resultHref: string;
}

export function QuizPlayer({
  scenes,
  eyebrow,
  saved,
  onSave,
  onClear,
  onFinish,
  resultHref,
}: QuizPlayerProps) {
  const router = useRouter();
  const [pendingChoice, setPendingChoice] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [done, setDone] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const onClearRef = useRef(onClear);
  const onFinishRef = useRef(onFinish);

  function clearTimers() {
    for (const id of timers.current) clearTimeout(id);
    timers.current = [];
  }

  function later(ms: number, fn: () => void) {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
  }

  useEffect(() => {
    return () => clearTimers();
  }, []);

  useEffect(() => {
    if (locked || phase !== "idle") return;
    if (saved == null) return;
    const status = assessInProgress(saved, scenes);
    if (status === "invalid") {
      onClearRef.current();
      return;
    }
    if (status === "complete") {
      onFinishRef.current(saved.choiceIds, { retainProgress: true });
      router.replace(resultHref);
    }
  }, [saved, scenes, router, locked, phase, resultHref]);

  const status =
    saved === undefined
      ? "loading"
      : saved === null
        ? "fresh"
        : assessInProgress(saved, scenes);
  const finishing =
    status === "complete" && (locked || phase !== "idle" || pendingChoice !== null);

  if (done || status === "loading" || (status === "complete" && !finishing)) {
    return (
      <p className="mx-auto text-[var(--muted)]" aria-live="polite">
        Preparando…
      </p>
    );
  }

  if (scenes.length === 0) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <p className="text-[var(--ink-soft)]">Nenhum dilema disponível.</p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-lg bg-[var(--accent)] px-5 py-2.5 font-semibold"
        >
          Voltar ao início
        </Link>
      </div>
    );
  }

  const restored =
    saved && (status === "resume" || status === "complete") ? saved : null;
  const index = restored ? restored.index : 0;
  const answers = restored ? restored.choiceIds : [];
  const selected =
    pendingChoice ?? (index < answers.length ? answers[index] : null);
  const scene = scenes[index];
  const isFirst = index === 0;
  const isLast = index === scenes.length - 1;

  if (!scene) {
    return (
      <p className="mx-auto text-[var(--muted)]" aria-live="polite">
        Preparando…
      </p>
    );
  }

  function selectChoice(choiceId: string) {
    if (locked) return;
    setLocked(true);
    setPendingChoice(choiceId);

    const nextAnswers = [...answers.slice(0, index), choiceId];
    onSave({ choiceIds: nextAnswers, index });

    later(SELECT_HOLD_MS, () => {
      setPhase("exiting");
      later(EXIT_MS, () => {
        if (isLast) {
          setDone(true);
          onFinish(nextAnswers);
          router.push(resultHref);
          return;
        }
        onSave({ choiceIds: nextAnswers, index: index + 1 });
        setPendingChoice(null);
        setPhase("entering");
        later(ENTER_MS, () => {
          setPhase("idle");
          setLocked(false);
        });
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
    const nextIndex = index - 1;
    later(EXIT_MS, () => {
      if (answers.length > 0) {
        onSave({ choiceIds: answers, index: nextIndex });
      }
      setPendingChoice(null);
      setPhase("entering");
      later(ENTER_MS, () => {
        setPhase("idle");
        setLocked(false);
      });
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
      <p className="mx-auto mb-4 w-full max-w-2xl text-sm text-[var(--muted)]">
        {eyebrow}
      </p>
      <div key={scene.id} className={sceneMotion} data-phase={phase}>
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
