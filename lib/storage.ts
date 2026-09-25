const STORAGE_KEY = "rosa-politica-choices";

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
