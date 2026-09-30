"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { GovernoPlayer } from "@/components/GovernoPlayer";
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
    <GovernoPlayer
      saved={saved}
      onSave={saveGovernmentProgress}
      onClear={clearGovernmentProgress}
      onFinish={finishGovernment}
      resultHref="/governo/resultado"
    />
  );
}
