"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChoiceButton } from "@/components/ChoiceButton";
import { SceneCard } from "@/components/SceneCard";
import {
  COUNTRY_NAME_BODY,
  COUNTRY_NAME_BUTTON,
  COUNTRY_NAME_TITLE,
  DEFAULT_COUNTRY_NAME,
  assessGovernment,
  choiceCompletes,
  sanitizeCountryName,
  sceneAt,
} from "@/lib/governoFlow";
import type { Choice } from "@/lib/types";

interface FlowProgress {
  choiceIds: string[];
  index: number;
  countryName?: string;
}

const SELECT_HOLD_MS = 650;
const EXIT_MS = 650;
const ENTER_MS = 550;

type Phase = "idle" | "exiting" | "entering";

interface GovernoPlayerProps {
  saved: FlowProgress | null | undefined;
  onSave: (progress: FlowProgress) => void;
  onClear: () => void;
  onFinish: (
    choiceIds: string[],
    options?: { retainProgress?: boolean; countryName?: string },
  ) => void;
  resultHref: string;
}

export function GovernoPlayer({
  saved,
  onSave,
  onClear,
  onFinish,
  resultHref,
}: GovernoPlayerProps) {
  const router = useRouter();
  const [pendingChoice, setPendingChoice] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [done, setDone] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState(DEFAULT_COUNTRY_NAME);
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
    const status = assessGovernment(saved);
    if (status === "invalid") {
      onClearRef.current();
      return;
    }
    if (status === "complete") {
      onFinishRef.current(saved.choiceIds, {
        retainProgress: true,
        countryName: saved.countryName,
      });
      router.replace(resultHref);
    }
  }, [saved, router, locked, phase, resultHref]);

  const status =
    saved === undefined
      ? "loading"
      : saved === null
        ? "fresh"
        : assessGovernment(saved);
  const finishing =
    status === "complete" && (locked || phase !== "idle" || pendingChoice !== null);

  if (done || status === "loading" || (status === "complete" && !finishing)) {
    return (
      <p className="mx-auto text-[var(--muted)]" aria-live="polite">
        Preparando…
      </p>
    );
  }

  const restored =
    saved && (status === "resume" || status === "complete") ? saved : null;
  const index = restored ? restored.index : 0;
  const answers = restored ? restored.choiceIds : [];
  const countryName = saved?.countryName;
  const showName = status === "fresh" || editingName;

  if (showName) {
    return (
      <NameStep
        draftName={draftName}
        onDraftName={setDraftName}
        onStart={() => {
          const name = sanitizeCountryName(draftName);
          onSave({
            choiceIds: answers,
            index: 0,
            countryName: name,
          });
          setEditingName(false);
        }}
      />
    );
  }

  const scene = sceneAt(answers, index, countryName);
  const selected =
    pendingChoice ?? (index < answers.length ? answers[index] : null);
  const isFirst = index === 0;

  if (!scene) {
    return (
      <p className="mx-auto text-[var(--muted)]" aria-live="polite">
        Preparando…
      </p>
    );
  }

  function selectChoice(choiceId: string) {
    if (locked || !scene) return;
    setLocked(true);
    setPendingChoice(choiceId);

    const unchanged = answers[index] === choiceId;
    const nextAnswers = unchanged
      ? answers
      : [...answers.slice(0, index), choiceId];
    const finished = choiceCompletes(answers, index, choiceId);
    onSave({ choiceIds: nextAnswers, index, countryName });

    later(SELECT_HOLD_MS, () => {
      setPhase("exiting");
      later(EXIT_MS, () => {
        if (finished) {
          setDone(true);
          onFinish(nextAnswers, { countryName });
          router.push(resultHref);
          return;
        }
        onSave({ choiceIds: nextAnswers, index: index + 1, countryName });
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
      setDraftName(countryName || DEFAULT_COUNTRY_NAME);
      setEditingName(true);
      return;
    }

    clearTimers();
    setLocked(true);
    setPhase("exiting");
    const nextIndex = index - 1;
    later(EXIT_MS, () => {
      if (answers.length > 0) {
        onSave({ choiceIds: answers, index: nextIndex, countryName });
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
        Meu Estado · fundando {sanitizeCountryName(countryName)}
      </p>
      <div key={`${index}-${scene.id}`} className={sceneMotion} data-phase={phase}>
        <SceneCard scene={toScene(scene)} index={index} total={null}>
          {scene.choices.map((choice) => (
            <ChoiceButton
              key={choice.id}
              choice={toChoice(choice)}
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

function toScene(scene: {
  id: string;
  title: string;
  body: string;
  choices: { id: string; label: string; hint: string }[];
}) {
  return {
    id: scene.id,
    title: scene.title,
    body: scene.body,
    choices: scene.choices.map(toChoice),
  };
}

function NameStep({
  draftName,
  onDraftName,
  onStart,
}: {
  draftName: string;
  onDraftName: (value: string) => void;
  onStart: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
      <p className="mb-4 text-sm text-[var(--muted)]">Meu Estado</p>
      <h1 className="font-[family-name:var(--font-display)] text-3xl leading-tight text-[var(--ink)] sm:text-4xl">
        {COUNTRY_NAME_TITLE}
      </h1>
      <p className="mt-5 text-lg leading-relaxed text-[var(--ink-soft)]">
        {COUNTRY_NAME_BODY}
      </p>
      <label className="mt-8 block text-sm text-[var(--muted)]" htmlFor="country-name">
        Nome do país
      </label>
      <input
        id="country-name"
        value={draftName}
        onChange={(event) => onDraftName(event.target.value)}
        maxLength={40}
        autoComplete="off"
        className="mt-2 w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-lg text-[var(--ink)] outline-none focus:border-[var(--accent)]"
      />
      <button
        type="button"
        onClick={onStart}
        className="mt-6 inline-flex w-fit rounded-lg bg-[var(--accent)] px-6 py-3 font-semibold text-[var(--ink)]"
      >
        {COUNTRY_NAME_BUTTON}
      </button>
    </div>
  );
}

function toChoice(choice: { id: string; label: string; hint: string }): Choice {
  return {
    id: choice.id,
    label: choice.label,
    hint: choice.hint,
    weights: {},
  };
}
