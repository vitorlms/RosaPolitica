import archetypesData from "@/content/archetypes.json";
import storyData from "@/content/story.json";
import {
  AXIS_IDS,
  type Archetype,
  type AxisId,
  type AxisScores,
  type AxisWeights,
  type ScoreResult,
  type Story,
} from "@/lib/types";

export const story = storyData as Story;
export const archetypes = archetypesData as Archetype[];

export function emptyScores(): AxisScores {
  return {
    economy: 0,
    authority: 0,
    liberty: 0,
    equality: 0,
    tradition: 0,
  };
}

export function addWeights(
  scores: AxisScores,
  weights: AxisWeights,
): AxisScores {
  const next = { ...scores };
  for (const axis of AXIS_IDS) {
    const w = weights[axis];
    if (typeof w === "number") {
      next[axis] = clamp(next[axis] + w, -1, 1);
    }
  }
  return next;
}

/** Sum choice weights in scene order; missing choiceIds are skipped. */
export function scoreFromChoices(choiceIds: string[]): AxisScores {
  let scores = emptyScores();
  for (const scene of story.scenes) {
    const choice = scene.choices.find((c) => choiceIds.includes(c.id));
    if (choice) {
      scores = addWeights(scores, choice.weights);
    }
  }
  return scores;
}

export function toDisplay(scores: AxisScores): Record<AxisId, number> {
  const display = {} as Record<AxisId, number>;
  for (const axis of AXIS_IDS) {
    // Map -1..+1 → 0..100
    display[axis] = Math.round(((scores[axis] + 1) / 2) * 100);
  }
  return display;
}

function euclidean(a: AxisScores, b: AxisScores): number {
  let sum = 0;
  for (const axis of AXIS_IDS) {
    const d = a[axis] - b[axis];
    sum += d * d;
  }
  return Math.sqrt(sum);
}

export function nearestArchetype(scores: AxisScores): {
  archetype: Archetype;
  distance: number;
} {
  let best = archetypes[0];
  let bestDist = Infinity;
  for (const arch of archetypes) {
    const d = euclidean(scores, arch.centroid);
    if (d < bestDist) {
      bestDist = d;
      best = arch;
    }
  }
  return { archetype: best, distance: bestDist };
}

export function computeResult(choiceIds: string[]): ScoreResult {
  const scores = scoreFromChoices(choiceIds);
  const { archetype, distance } = nearestArchetype(scores);
  return {
    scores,
    display: toDisplay(scores),
    archetype,
    distance,
  };
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
