"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { ChoiceButton } from "@/components/ChoiceButton";
import { SceneCard } from "@/components/SceneCard";
import { clearChoices, saveChoices, saveSavedResult } from "@/lib/storage";
import {
  TEST_MODES,
  parseTestMode,
  scenesForMode,
  type TestModeId,
} from "@/lib/testModes";

/** Pause so the selected answer is readable before the scene fades. */
const SELECT_HOLD_MS = 650;
const EXIT_MS = 650;
const ENTER_MS = 550;

type Phase = "idle" | "exiting" | "entering";

function PlayExperience() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode: TestModeId = parseTestMode(searchParams.get("modo"));
  const scenes = useMemo(() => scenesForMode(mode), [mode]);

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
    setIndex(0);
    setSelected(null);
    setAnswers([]);
    setLocked(false);
    setPhase("idle");
    setReady(true);
    return () => clearTimers();
  }, [mode]);

  if (!ready) {
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

  const scene = scenes[index];
  const isFirst = index === 0;
  const isLast = index === scenes.length - 1;
  const modeLabel = TEST_MODES[mode].label;

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
          saveSavedResult({
            choiceIds: nextAnswers,
            mode,
            savedAt: new Date().toISOString(),
          });
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
      <p className="mx-auto mb-4 w-full max-w-2xl text-sm text-[var(--muted)]">
        Modo {modeLabel}
        <span className="text-[var(--line)]"> · </span>
        {scenes.length} dilemas
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

export default function PlayPage() {
  return (
    <Suspense
      fallback={
        <p className="mx-auto text-[var(--muted)]" aria-live="polite">
          Preparando…
        </p>
      }
    >
      <PlayExperience />
    </Suspense>
  );
}
