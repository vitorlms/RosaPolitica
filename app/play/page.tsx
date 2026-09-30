"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useSyncExternalStore } from "react";
import { QuizPlayer } from "@/components/QuizPlayer";
import {
  IN_PROGRESS_UNREADY,
  clearChoices,
  clearInProgress,
  finishQuiz,
  getInProgressServerSnapshot,
  getInProgressSnapshot,
  quizzesFromSnapshot,
  saveInProgress,
  subscribeInProgress,
} from "@/lib/storage";
import {
  TEST_MODES,
  parseTestMode,
  scenesForMode,
  type TestModeId,
} from "@/lib/testModes";

function PlayExperience({ mode }: { mode: TestModeId }) {
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

  useEffect(() => {
    clearChoices();
  }, []);

  const modeLabel = TEST_MODES[mode].label;

  return (
    <QuizPlayer
      scenes={scenes}
      eyebrow={`Modo ${modeLabel} · ${scenes.length} dilemas`}
      saved={saved}
      onSave={(progress) => saveInProgress({ mode, ...progress })}
      onClear={() => clearInProgress(mode)}
      onFinish={(choiceIds, options) => finishQuiz(choiceIds, mode, options)}
      resultHref="/perfil"
    />
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
