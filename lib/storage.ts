import type { TestModeId } from "@/lib/testModes";

const STORAGE_KEY = "rosa-politica-choices";
const SAVED_RESULT_KEY = "rosa-politica-saved-result";
const IN_PROGRESS_KEY = "rosa-politica-in-progress";
const GOVERNO_SESSION_KEY = "rosa-politica-governo-choices";
const GOVERNO_RESULT_KEY = "rosa-politica-governo-result";
const GOVERNO_PROGRESS_KEY = "rosa-politica-governo-progress";

export interface SavedResult {
  /** Positioning answers only. Government dilemmas live in {@link SavedGovernment}. */
  choiceIds: string[];
  mode: TestModeId;
  savedAt: string;
}

/** Finished ideal-government quiz. Independent of {@link SavedResult}. */
export interface SavedGovernment {
  choiceIds: string[];
  savedAt: string;
  /** Name the player gave the country being founded. */
  countryName?: string;
}

/** Unfinished ideal-government quiz. Not stored with the positioning modes. */
export interface GovernmentProgress {
  choiceIds: string[];
  index: number;
  updatedAt: string;
  /** Set once the player confirms the country name, even before the first dilemma. */
  countryName?: string;
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

export function parseChoiceIds(raw: string): string[] {
  if (!raw || raw === IN_PROGRESS_UNREADY) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

export function getChoicesSnapshot(): string {
  return sessionStorage.getItem(STORAGE_KEY) ?? "";
}

export function getChoicesServerSnapshot(): string {
  return IN_PROGRESS_UNREADY;
}

export function loadChoices(): string[] {
  if (typeof window === "undefined") return [];
  return parseChoiceIds(sessionStorage.getItem(STORAGE_KEY) ?? "");
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

export function getSavedResultSnapshot(): string {
  return localStorage.getItem(SAVED_RESULT_KEY) ?? "";
}

export function getSavedResultServerSnapshot(): string {
  return IN_PROGRESS_UNREADY;
}

export function parseSavedResult(raw: string): SavedResult | null {
  if (!raw || raw === IN_PROGRESS_UNREADY) return null;
  try {
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

export function loadSavedResult(): SavedResult | null {
  if (typeof window === "undefined") return null;
  return parseSavedResult(localStorage.getItem(SAVED_RESULT_KEY) ?? "");
}

export function saveSavedResult(result: SavedResult): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SAVED_RESULT_KEY, JSON.stringify(result));
}

export function clearSavedResult(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SAVED_RESULT_KEY);
}

export interface GovernmentSession {
  choiceIds: string[];
  countryName?: string;
}

export function parseGovernmentSession(raw: string): GovernmentSession {
  if (!raw || raw === IN_PROGRESS_UNREADY) return { choiceIds: [] };
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return {
        choiceIds: parsed.filter((id): id is string => typeof id === "string"),
      };
    }
    if (!parsed || typeof parsed !== "object") return { choiceIds: [] };
    const record = parsed as Record<string, unknown>;
    const choiceIds = Array.isArray(record.choiceIds)
      ? record.choiceIds.filter((id): id is string => typeof id === "string")
      : [];
    const countryName =
      typeof record.countryName === "string" ? record.countryName : undefined;
    return { choiceIds, countryName };
  } catch {
    return { choiceIds: [] };
  }
}

export function loadGovernmentChoices(): string[] {
  if (typeof window === "undefined") return [];
  return parseGovernmentSession(sessionStorage.getItem(GOVERNO_SESSION_KEY) ?? "")
    .choiceIds;
}

export function saveGovernmentChoices(
  choiceIds: string[],
  countryName?: string,
): void {
  sessionStorage.setItem(
    GOVERNO_SESSION_KEY,
    JSON.stringify({ choiceIds, countryName }),
  );
}

export function clearGovernmentChoices(): void {
  sessionStorage.removeItem(GOVERNO_SESSION_KEY);
}

export function getGovernmentSessionSnapshot(): string {
  return sessionStorage.getItem(GOVERNO_SESSION_KEY) ?? "";
}

export function getGovernmentSessionServerSnapshot(): string {
  return IN_PROGRESS_UNREADY;
}

export function getSavedGovernmentSnapshot(): string {
  return localStorage.getItem(GOVERNO_RESULT_KEY) ?? "";
}

export function getSavedGovernmentServerSnapshot(): string {
  return IN_PROGRESS_UNREADY;
}

export function parseSavedGovernment(raw: string): SavedGovernment | null {
  if (!raw || raw === IN_PROGRESS_UNREADY) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const record = parsed as Record<string, unknown>;
    if (!Array.isArray(record.choiceIds)) return null;
    const choiceIds = record.choiceIds.filter(
      (id): id is string => typeof id === "string",
    );
    if (choiceIds.length === 0) return null;
    if (typeof record.savedAt !== "string") return null;
    const countryName =
      typeof record.countryName === "string" ? record.countryName : undefined;
    return { choiceIds, savedAt: record.savedAt, countryName };
  } catch {
    return null;
  }
}

export function loadSavedGovernment(): SavedGovernment | null {
  if (typeof window === "undefined") return null;
  return parseSavedGovernment(localStorage.getItem(GOVERNO_RESULT_KEY) ?? "");
}

export function saveSavedGovernment(result: SavedGovernment): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GOVERNO_RESULT_KEY, JSON.stringify(result));
}

export function clearSavedGovernment(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GOVERNO_RESULT_KEY);
}

/** Drops both finished results. Does not touch an in-progress quiz. */
export function clearAllSavedResults(): void {
  clearSavedResult();
  clearSavedGovernment();
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
    if (
      event.key === null ||
      event.key === IN_PROGRESS_KEY ||
      event.key === GOVERNO_PROGRESS_KEY
    ) {
      listener();
    }
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
  countryName?: string;
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
  const countryName =
    typeof record.countryName === "string" ? record.countryName : undefined;
  return {
    choiceIds: record.choiceIds as string[],
    index: record.index,
    updatedAt: record.updatedAt,
    countryName,
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
  progress: { index: number; choiceIds: string[] },
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

export function getGovernmentProgressSnapshot(): string {
  return localStorage.getItem(GOVERNO_PROGRESS_KEY) ?? "";
}

export function getGovernmentProgressServerSnapshot(): string {
  return IN_PROGRESS_UNREADY;
}

export function governmentProgressFromSnapshot(
  raw: string,
): GovernmentProgress | null {
  if (!raw || raw === IN_PROGRESS_UNREADY) return null;
  try {
    return parseStoredProgress(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

export function saveGovernmentProgress(
  progress: Pick<GovernmentProgress, "choiceIds" | "index" | "countryName">,
): void {
  if (typeof window === "undefined") return;
  if (progress.choiceIds.length === 0 && !progress.countryName?.trim()) return;
  const stored: GovernmentProgress = {
    choiceIds: progress.choiceIds,
    index: progress.index,
    updatedAt: new Date().toISOString(),
    countryName: progress.countryName,
  };
  localStorage.setItem(GOVERNO_PROGRESS_KEY, JSON.stringify(stored));
  notifyProgress();
}

export function clearGovernmentProgress(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GOVERNO_PROGRESS_KEY);
  notifyProgress();
}

/**
 * Persist a finished ideal-government run without touching the positioning save.
 * `retainProgress` keeps the mid-quiz snapshot until the result page clears it.
 */
export function finishGovernment(
  choiceIds: string[],
  options?: { retainProgress?: boolean; countryName?: string },
): void {
  saveGovernmentChoices(choiceIds, options?.countryName);
  saveSavedGovernment({
    choiceIds,
    savedAt: new Date().toISOString(),
    countryName: options?.countryName,
  });
  if (!options?.retainProgress) clearGovernmentProgress();
}
