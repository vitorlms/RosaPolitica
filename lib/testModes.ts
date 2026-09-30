import { institutionPlayScenes } from "@/lib/institutions";
import { story } from "@/lib/scoring";
import type { Scene } from "@/lib/types";

/** ~1 minute per scene — used for duration copy. */
export const MINUTES_PER_SCENE = 1;

export type TestModeId = "rapido" | "padrao" | "completo";

export interface TestMode {
  id: TestModeId;
  label: string;
  /**
   * Target scene count. `null` = all scenes (completo).
   * Cap applied against `story.scenes.length` at runtime.
   */
  sceneCount: number | null;
  /** Short blurb for the home picker. */
  summary: string;
}

export const TEST_MODES: Record<TestModeId, TestMode> = {
  rapido: {
    id: "rapido",
    label: "Rápido",
    sceneCount: 5,
    summary:
      "As cenas de maior peso no perfil, e um dilema de governo por categoria.",
  },
  padrao: {
    id: "padrao",
    label: "Padrão",
    sceneCount: 15,
    summary: "Cobertura ampla do perfil, mais o governo ideal completo.",
  },
  completo: {
    id: "completo",
    label: "Completo",
    sceneCount: null,
    summary: "Todos os dilemas — perfil e governo ideal no detalhe.",
  },
};

/** Resolved scene count for a mode given how many scenes exist. */
export function resolvedSceneCount(
  mode: TestModeId,
  totalScenes: number = story.scenes.length,
): number {
  const target = TEST_MODES[mode].sceneCount;
  if (target == null) return totalScenes;
  return Math.min(target, totalScenes);
}

export const TEST_MODE_ORDER: TestModeId[] = ["rapido", "padrao", "completo"];

export function parseTestMode(value: string | null | undefined): TestModeId {
  if (value === "rapido" || value === "padrao" || value === "completo") {
    return value;
  }
  return "padrao";
}

/**
 * Average total salience across a scene’s choices — proxy for how much
 * that dilemma tends to move essentiality / agenda weight.
 */
export function sceneSalienceScore(scene: Scene): number {
  if (scene.choices.length === 0) return 0;
  let total = 0;
  for (const choice of scene.choices) {
    const values = Object.values(choice.salience ?? {});
    total += values.reduce((sum, s) => sum + (typeof s === "number" ? s : 0), 0);
  }
  return total / scene.choices.length;
}

/**
 * Positioning scenes for a mode. Rápido/padrão keep story order among the
 * highest-salience subset; completo returns every positioning scene.
 * Government dilemmas are not part of this selection.
 */
function positioningScenesForMode(
  mode: TestModeId,
  allScenes: Scene[],
): Scene[] {
  const total = allScenes.length;
  if (total === 0) return allScenes;

  const limit = resolvedSceneCount(mode, total);
  if (limit >= total) return allScenes;

  const ranked = [...allScenes].sort((a, b) => {
    const diff = sceneSalienceScore(b) - sceneSalienceScore(a);
    if (diff !== 0) return diff;
    return allScenes.indexOf(a) - allScenes.indexOf(b);
  });

  const selected = new Set(ranked.slice(0, limit).map((s) => s.id));
  return allScenes.filter((s) => selected.has(s.id));
}

/**
 * Scenes actually played. The positioning prefix matches the mode as before;
 * arrangement dilemmas are appended, so a mid-quiz save still lines up.
 */
export function scenesForMode(
  mode: TestModeId,
  allScenes: Scene[] = story.scenes,
): Scene[] {
  const positioning = positioningScenesForMode(mode, allScenes);
  if (allScenes !== story.scenes) return positioning;
  return [...positioning, ...institutionPlayScenes(mode)];
}

/** About one minute per scene the player will actually see. */
export function modeDurationMinutes(sceneCount: number): number {
  return Math.max(sceneCount * MINUTES_PER_SCENE, sceneCount);
}

export function playHref(mode: TestModeId): string {
  return `/play?modo=${mode}`;
}
