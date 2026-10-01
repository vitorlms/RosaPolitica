"use client";

import { useState } from "react";
import { ChoiceButton } from "@/components/ChoiceButton";
import { SceneCard } from "@/components/SceneCard";
import {
  SKIPPED_BACK,
  SKIPPED_BODY,
  SKIPPED_DISMISS,
  SKIPPED_DONE,
  SKIPPED_HEADING,
  SKIPPED_INCLUDED,
  SKIPPED_KICKER,
  SKIPPED_REOPEN,
  answeredSkipped,
  skippedQuestions,
  skippedScene,
} from "@/lib/governoFlow";
import type { Choice } from "@/lib/types";

interface SkippedQuestionsProps {
  choiceIds: readonly string[];
  extraChoiceIds: readonly string[];
  countryName?: string;
  dismissed: boolean;
  onAnswer: (choiceId: string) => void;
  onDismiss: () => void;
  onReopen: () => void;
}

function toChoice(choice: { id: string; label: string; hint: string }): Choice {
  return {
    id: choice.id,
    label: choice.label,
    hint: choice.hint,
    weights: {},
  };
}

export function SkippedQuestions({
  choiceIds,
  extraChoiceIds,
  countryName,
  dismissed,
  onAnswer,
  onDismiss,
  onReopen,
}: SkippedQuestionsProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const remaining = skippedQuestions(choiceIds, extraChoiceIds);
  const answered = answeredSkipped(choiceIds, extraChoiceIds);

  if (remaining.length === 0 && extraChoiceIds.length === 0) return null;

  if (dismissed && remaining.length > 0) {
    return (
      <div className="mx-auto mt-10 w-full max-w-xl text-center">
        <button
          type="button"
          onClick={onReopen}
          className="text-sm font-medium text-[var(--accent)] underline decoration-[var(--line)] underline-offset-4 hover:decoration-[var(--accent)]"
        >
          {SKIPPED_REOPEN}
        </button>
      </div>
    );
  }

  const open = openId ? skippedScene(choiceIds, extraChoiceIds, openId, countryName) : null;

  return (
    <section className="mx-auto mt-12 w-full max-w-2xl border-t border-[var(--line)] pt-10">
      <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
        {SKIPPED_HEADING}
      </h2>
      {remaining.length === 0 ? (
        <p className="mt-3 text-sm leading-relaxed text-[var(--ink-soft)]">{SKIPPED_DONE}</p>
      ) : (
        <p className="mt-3 text-sm leading-relaxed text-[var(--ink-soft)]">{SKIPPED_BODY}</p>
      )}
      {answered.length > 0 && remaining.length > 0 ? (
        <p className="mt-3 text-sm text-[var(--muted)]">
          {SKIPPED_INCLUDED} {answered.map((item) => item.title).join(" · ")}
        </p>
      ) : null}

      {open ? (
        <div className="mt-8">
          <SceneCard scene={toScene(open)} index={0} total={null} kicker={SKIPPED_KICKER}>
            {open.choices.map((choice) => (
              <ChoiceButton
                key={choice.id}
                choice={toChoice(choice)}
                selected={false}
                onSelect={(choiceId) => {
                  setOpenId(null);
                  onAnswer(choiceId);
                }}
              />
            ))}
          </SceneCard>
          <button
            type="button"
            onClick={() => setOpenId(null)}
            className="mt-6 rounded-lg border border-[var(--line)] px-6 py-3 font-medium text-[var(--ink)] transition-colors hover:border-[var(--accent-muted)]"
          >
            {SKIPPED_BACK}
          </button>
        </div>
      ) : remaining.length > 0 ? (
        <ul className="mt-6 flex list-none flex-col gap-2 p-0">
          {remaining.map((question) => (
            <li key={question.id}>
              <button
                type="button"
                onClick={() => setOpenId(question.id)}
                className="w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-left text-[var(--ink)] transition-colors hover:border-[var(--accent-muted)]"
              >
                {question.title}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {remaining.length > 0 && !open ? (
        <button
          type="button"
          onClick={onDismiss}
          className="mt-6 text-sm font-medium text-[var(--muted)] underline decoration-[var(--line)] underline-offset-4 hover:text-[var(--ink)]"
        >
          {SKIPPED_DISMISS}
        </button>
      ) : null}
    </section>
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
