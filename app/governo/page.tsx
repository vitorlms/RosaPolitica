"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { QuizPlayer } from "@/components/QuizPlayer";
import { institutionPlayScenes } from "@/lib/institutions";
import {
  IN_PROGRESS_UNREADY,
  clearGovernmentChoices,
  clearGovernmentProgress,
  finishGovernment,
  getGovernmentProgressServerSnapshot,
  getGovernmentProgressSnapshot,
  governmentProgressFromSnapshot,
  saveGovernmentProgress,
  subscribeInProgress,
} from "@/lib/storage";

export default function GovernoPage() {
  const scenes = useMemo(() => institutionPlayScenes(), []);
  const snapshot = useSyncExternalStore(
    subscribeInProgress,
    getGovernmentProgressSnapshot,
    getGovernmentProgressServerSnapshot,
  );
  const saved = useMemo(() => {
    if (snapshot === IN_PROGRESS_UNREADY) return undefined;
    return governmentProgressFromSnapshot(snapshot);
  }, [snapshot]);

  useEffect(() => {
    clearGovernmentChoices();
  }, []);

  return (
    <QuizPlayer
      scenes={scenes}
      eyebrow={`Governo ideal · ${scenes.length} dilemas`}
      saved={saved}
      onSave={saveGovernmentProgress}
      onClear={clearGovernmentProgress}
      onFinish={finishGovernment}
      resultHref="/governo/resultado"
    />
  );
}
