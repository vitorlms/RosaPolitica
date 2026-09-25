import archetypesData from "@/content/archetypes.json";
import storyData from "@/content/story.json";
import {
  AXIS_IDS,
  type Archetype,
  type AxisId,
  type AxisProfile,
  type AxisSalience,
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
    environment: 0,
    security: 0,
    global: 0,
    technology: 0,
    body: 0,
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

/**
 * Average salience per axis across choices that mention it.
 * Axes never touched stay 0.
 */
export function essentialityFromChoices(
  choiceIds: string[],
): Record<AxisId, number> {
  const sum = emptyScores();
  const count = emptyScores();

  for (const scene of story.scenes) {
    const choice = scene.choices.find((c) => choiceIds.includes(c.id));
    if (!choice) continue;

    const salience = choice.salience ?? deriveSalienceFromWeights(choice.weights);
    for (const axis of AXIS_IDS) {
      const s = salience[axis];
      if (typeof s === "number") {
        sum[axis] += clamp(s, 0, 1);
        count[axis] += 1;
      }
    }
  }

  const out = emptyScores();
  for (const axis of AXIS_IDS) {
    out[axis] = count[axis] > 0 ? sum[axis] / count[axis] : 0;
  }
  return out;
}

/** Fallback: stronger |weight| ⇒ slightly higher implied salience. */
function deriveSalienceFromWeights(weights: AxisWeights): AxisSalience {
  const salience: AxisSalience = {};
  for (const axis of AXIS_IDS) {
    const w = weights[axis];
    if (typeof w === "number" && w !== 0) {
      salience[axis] = clamp(0.35 + Math.abs(w) * 1.2, 0.2, 0.85);
    }
  }
  return salience;
}

export function toDisplay(scores: AxisScores): Record<AxisId, number> {
  const display = {} as Record<AxisId, number>;
  for (const axis of AXIS_IDS) {
    display[axis] = Math.round(((scores[axis] + 1) / 2) * 100);
  }
  return display;
}

export function toEssentialityDisplay(
  raw: Record<AxisId, number>,
): Record<AxisId, number> {
  const display = {} as Record<AxisId, number>;
  for (const axis of AXIS_IDS) {
    display[axis] = Math.round(raw[axis] * 100);
  }
  return display;
}

function tierFor(essentiality01: number, touched: boolean): AxisProfile["tier"] {
  if (!touched) return "untouched";
  if (essentiality01 >= 0.7) return "essential";
  if (essentiality01 >= 0.4) return "moderate";
  return "peripheral";
}

export function buildProfiles(
  display: Record<AxisId, number>,
  essentiality: Record<AxisId, number>,
  rawEssentiality: Record<AxisId, number>,
): Record<AxisId, AxisProfile> {
  const profiles = {} as Record<AxisId, AxisProfile>;
  for (const axis of AXIS_IDS) {
    const e = rawEssentiality[axis];
    profiles[axis] = {
      position: display[axis],
      essentiality: essentiality[axis],
      tier: tierFor(e, e > 0),
    };
  }
  return profiles;
}

function euclidean(a: AxisScores, b: AxisScores): number {
  let sum = 0;
  for (const axis of AXIS_IDS) {
    const d = a[axis] - (b[axis] ?? 0);
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
  const rawEssentiality = essentialityFromChoices(choiceIds);
  const display = toDisplay(scores);
  const essentiality = toEssentialityDisplay(rawEssentiality);
  const profiles = buildProfiles(display, essentiality, rawEssentiality);
  const rankedByEssentiality = [...AXIS_IDS]
    .filter((axis) => rawEssentiality[axis] > 0)
    .sort((a, b) => rawEssentiality[b] - rawEssentiality[a]);
  const { archetype, distance } = nearestArchetype(scores);
  return {
    scores,
    display,
    essentiality,
    profiles,
    rankedByEssentiality,
    archetype,
    distance,
  };
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
