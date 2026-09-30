import type { TestModeId } from "@/lib/testModes";

const STORAGE_KEY = "rosa-politica-choices";
const SAVED_RESULT_KEY = "rosa-politica-saved-result";
const IN_PROGRESS_KEY = "rosa-politica-in-progress";

export interface SavedResult {
  /**
   * Answers in play order: positioning scenes, then government dilemmas.
   * Meu resultado recomputes both profiles from these ids.
   */
  choiceIds: string[];
  mode: TestModeId;
  savedAt: string;
}

/** Unfinished quiz for one mode on this browser. Modes are stored separately. */
export interface InProgressQuiz {
  mode: TestModeId;
  /** Choice ids aligned with that mode’s scene order. */
  choiceIds: string[];
  /** Scene index to show when the player comes back. */
  index: number;
  updatedAt: string;
}

export type InProgressStatus = "resume" | "complete" | "invalid";

interface ProgressScene {
  choices: readonly { id: string }[];
}

export function loadChoices(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

export function saveChoices(choiceIds: string[]): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(choiceIds));
}

export function clearChoices(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

function isTestModeId(value: unknown): value is TestModeId {
  return value === "rapido" || value === "padrao" || value === "completo";
}

export function loadSavedResult(): SavedResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SAVED_RESULT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const record = parsed as Record<string, unknown>;
    if (!Array.isArray(record.choiceIds)) return null;
    const choiceIds = record.choiceIds.filter(
      (id): id is string => typeof id === "string",
    );
    if (choiceIds.length === 0) return null;
    if (!isTestModeId(record.mode)) return null;
    if (typeof record.savedAt !== "string") return null;
    return { choiceIds, mode: record.mode, savedAt: record.savedAt };
  } catch {
    return null;
  }
}

export function saveSavedResult(result: SavedResult): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SAVED_RESULT_KEY, JSON.stringify(result));
}

export function clearSavedResult(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SAVED_RESULT_KEY);
}

const PROGRESS_MODES: TestModeId[] = ["rapido", "padrao", "completo"];

/** Snapshot while the server (and hydration) cannot read localStorage. */
export const IN_PROGRESS_UNREADY = "\u0000";

const progressListeners = new Set<() => void>();

function notifyProgress(): void {
  for (const listener of progressListeners) listener();
}

export function subscribeInProgress(listener: () => void): () => void {
  progressListeners.add(listener);
  if (typeof window === "undefined") {
    return () => progressListeners.delete(listener);
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === IN_PROGRESS_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    progressListeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function getInProgressSnapshot(): string {
  return localStorage.getItem(IN_PROGRESS_KEY) ?? "";
}

export function getInProgressServerSnapshot(): string {
  return IN_PROGRESS_UNREADY;
}

interface StoredProgress {
  choiceIds: string[];
  index: number;
  updatedAt: string;
}

function parseStoredProgress(value: unknown): StoredProgress | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (!Array.isArray(record.choiceIds)) return null;
  if (!record.choiceIds.every((id) => typeof id === "string")) return null;
  if (
    typeof record.index !== "number" ||
    !Number.isInteger(record.index) ||
    record.index < 0
  ) {
    return null;
  }
  if (typeof record.updatedAt !== "string") return null;
  return {
    choiceIds: record.choiceIds as string[],
    index: record.index,
    updatedAt: record.updatedAt,
  };
}

export function quizzesFromSnapshot(raw: string): InProgressQuiz[] {
  if (!raw || raw === IN_PROGRESS_UNREADY) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return [];
    const record = parsed as Record<string, unknown>;
    const items: InProgressQuiz[] = [];
    for (const mode of PROGRESS_MODES) {
      const stored = parseStoredProgress(record[mode]);
      if (!stored) continue;
      items.push({ mode, ...stored });
    }
    items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return items;
  } catch {
    return [];
  }
}

function readProgressMap(): Partial<Record<TestModeId, InProgressQuiz>> {
  if (typeof window === "undefined") return {};
  const map: Partial<Record<TestModeId, InProgressQuiz>> = {};
  for (const item of quizzesFromSnapshot(getInProgressSnapshot())) {
    map[item.mode] = item;
  }
  return map;
}

function writeProgressMap(
  map: Partial<Record<TestModeId, InProgressQuiz>>,
): void {
  const stored: Partial<Record<TestModeId, StoredProgress>> = {};
  for (const mode of PROGRESS_MODES) {
    const item = map[mode];
    if (!item) continue;
    stored[mode] = {
      choiceIds: item.choiceIds,
      index: item.index,
      updatedAt: item.updatedAt,
    };
  }
  if (Object.keys(stored).length === 0) {
    localStorage.removeItem(IN_PROGRESS_KEY);
  } else {
    localStorage.setItem(IN_PROGRESS_KEY, JSON.stringify(stored));
  }
  notifyProgress();
}

export function loadInProgress(mode: TestModeId): InProgressQuiz | null {
  return readProgressMap()[mode] ?? null;
}

/** Newest update first. */
export function loadAllInProgress(): InProgressQuiz[] {
  if (typeof window === "undefined") return [];
  return quizzesFromSnapshot(getInProgressSnapshot());
}

export function saveInProgress(
  progress: Pick<InProgressQuiz, "mode" | "choiceIds" | "index">,
): void {
  if (typeof window === "undefined") return;
  if (progress.choiceIds.length === 0) return;
  const map = readProgressMap();
  map[progress.mode] = {
    mode: progress.mode,
    choiceIds: progress.choiceIds,
    index: progress.index,
    updatedAt: new Date().toISOString(),
  };
  writeProgressMap(map);
}

export function clearInProgress(mode: TestModeId): void {
  if (typeof window === "undefined") return;
  const map = readProgressMap();
  delete map[mode];
  writeProgressMap(map);
}

/**
 * Whether saved answers still line up with this mode’s scenes.
 * `complete` means every scene has an answer (finish, don’t resume).
 */
export function assessInProgress(
  progress: InProgressQuiz,
  scenes: readonly ProgressScene[],
): InProgressStatus {
  const { index, choiceIds } = progress;
  if (scenes.length === 0) return "invalid";
  if (choiceIds.length === 0 || choiceIds.length > scenes.length) return "invalid";
  if (!Number.isInteger(index) || index < 0) return "invalid";

  for (let i = 0; i < choiceIds.length; i++) {
    const scene = scenes[i];
    if (!scene.choices.some((choice) => choice.id === choiceIds[i])) {
      return "invalid";
    }
  }

  if (choiceIds.length === scenes.length) return "complete";
  if (index >= scenes.length || choiceIds.length < index) return "invalid";
  return "resume";
}

/**
 * Persist the finished run.
 * `retainProgress` keeps the mid-quiz snapshot until `/result` clears it,
 * so the play screen does not jump back to the first scene while navigating.
 */
export function finishQuiz(
  choiceIds: string[],
  mode: TestModeId,
  options?: { retainProgress?: boolean },
): void {
  saveChoices(choiceIds);
  saveSavedResult({
    choiceIds,
    mode,
    savedAt: new Date().toISOString(),
  });
  if (!options?.retainProgress) clearInProgress(mode);
}
