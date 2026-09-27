import type { TestModeId } from "@/lib/testModes";

const STORAGE_KEY = "rosa-politica-choices";
const SAVED_RESULT_KEY = "rosa-politica-saved-result";

export interface SavedResult {
  choiceIds: string[];
  mode: TestModeId;
  savedAt: string;
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
