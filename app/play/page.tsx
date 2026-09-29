"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { ChoiceButton } from "@/components/ChoiceButton";
import { SceneCard } from "@/components/SceneCard";
import {
  IN_PROGRESS_UNREADY,
  assessInProgress,
  clearChoices,
  finishQuiz,
  getInProgressServerSnapshot,
  getInProgressSnapshot,
  quizzesFromSnapshot,
  saveInProgress,
  subscribeInProgress,
  clearInProgress,
} from "@/lib/storage";
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

function PlayExperience({ mode }: { mode: TestModeId }) {
  const router = useRouter();
  const scenes = useMemo(() => scenesForMode(mode), [mode]);
  const snapshot = useSyncExternalStore(
    subscribeInProgress,
    getInProgressSnapshot,
    getInProgressServerSnapshot,
  );
  const saved = useMemo(() => {
    if (snapshot === IN_PROGRESS_UNREADY) return undefined;
    return quizzesFromSnapshot(snapshot).find((item) => item.mode === mode) ?? null;
  }, [snapshot, mode]);

  const [pendingChoice, setPendingChoice] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [done, setDone] = useState(false);
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
    return () => clearTimers();
  }, []);

  useEffect(() => {
    if (locked || phase !== "idle") return;
    if (saved == null) return;
    const status = assessInProgress(saved, scenes);
    if (status === "invalid") {
      clearInProgress(mode);
      return;
    }
    if (status === "complete") {
      finishQuiz(saved.choiceIds, mode, { retainProgress: true });
      router.replace("/result");
    }
  }, [saved, scenes, mode, router, locked, phase]);

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
    pendingChoice ??
    (index < answers.length ? answers[index] : null);
  const scene = scenes[index];
  const isFirst = index === 0;
  const isLast = index === scenes.length - 1;
  const modeLabel = TEST_MODES[mode].label;

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
    saveInProgress({ mode, choiceIds: nextAnswers, index });

    later(SELECT_HOLD_MS, () => {
      setPhase("exiting");
      later(EXIT_MS, () => {
        if (isLast) {
          setDone(true);
          finishQuiz(nextAnswers, mode);
          router.push("/result");
          return;
        }
        saveInProgress({
          mode,
          choiceIds: nextAnswers,
          index: index + 1,
        });
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
        saveInProgress({ mode, choiceIds: answers, index: nextIndex });
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

function PlayGate() {
  const searchParams = useSearchParams();
  const mode = parseTestMode(searchParams.get("modo"));
  return <PlayExperience key={mode} mode={mode} />;
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
      <PlayGate />
    </Suspense>
  );
}
