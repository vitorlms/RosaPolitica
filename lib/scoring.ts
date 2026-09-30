import archetypesData from "@/content/archetypes.json";
import storyData from "@/content/story.json";
import { institutionDraft } from "@/lib/institutions";
import {
  AGENDA_THRESHOLD,
  AXIS_IDS,
  AXIS_LABELS,
  type Archetype,
  type AxisId,
  type AxisProfile,
  type AxisSalience,
  type AxisScores,
  type AxisWeights,
  type Choice,
  type ProfileDriver,
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

/**
 * Positioning scenes, then arrangement dilemmas.
 * Only weights are read. Leans are scored in lib/institutions.ts.
 * Unknown choice ids are skipped, so a save from before those dilemmas
 * still scores the ten axes as it did then.
 */
function axisScenes(): Story["scenes"] {
  return [...story.scenes, ...institutionDraft.scenes];
}

/** Sum choice weights in scene order; missing choiceIds are skipped. */
export function scoreFromChoices(choiceIds: string[]): AxisScores {
  let scores = emptyScores();
  for (const scene of axisScenes()) {
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

  for (const scene of axisScenes()) {
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
  const drivers = profileDrivers(choiceIds, {
    centroid: archetype.centroid,
    distance,
    essentiality,
    rankedByEssentiality,
  });
  return {
    scores,
    display,
    essentiality,
    profiles,
    rankedByEssentiality,
    archetype,
    distance,
    drivers,
  };
}

/** How many attributed choices to show. A third is kept only if it is close. */
const DRIVER_LIMIT = 3;
const DRIVER_THIRD_RATIO = 0.45;
/** Signature-axis pull vs agenda after each signal is scaled by its own max. */
const PULL_BLEND = 0.6;
const AGENDA_BLEND = 0.4;
/**
 * A centroid has to lean at least this far before an axis counts as part of
 * the archetype’s signature. Near-zero poles are shared by several profiles.
 */
const SIGNATURE_LEAN = 0.15;

interface DriverContext {
  centroid: AxisScores;
  distance: number;
  essentiality: Record<AxisId, number>;
  rankedByEssentiality: AxisId[];
}

/**
 * Choices that most explain the matched archetype and the political agenda.
 *
 * Heuristic, per answered choice:
 * 1. Signature pull — leave-one-out drop in squared distance to the
 *    matched centroid, summed only on axes where this archetype actually
 *    leans (|centroid| ≥ 0.15) and the choice pushed the same way.
 *    Each axis is weighted by how far that lean sits from the other
 *    archetypes, so a shared near-zero pole does not explain the match.
 *    Clamping means this is a counterfactual on the real score.
 * 2. Agenda — salience × |weight| on axes that cleared the agenda
 *    threshold. If none did, the two strongest essentiality axes stand in
 *    so a short quiz still has a story. Copy says “agenda” only when the
 *    axis actually cleared the threshold.
 *
 * If no choice has a signature pull (typical of a near-center profile),
 * step 1 falls back to the drop in full Euclidean distance.
 *
 * Each signal is divided by its max, then blended (60% pull, 40% agenda).
 * The top two with any signal are kept; a third is added when it is at
 * least about half as strong as the first.
 */
function profileDrivers(
  choiceIds: string[],
  ctx: DriverContext,
): ProfileDriver[] {
  const answered = answeredChoices(choiceIds);
  if (answered.length === 0) return [];

  const officialAgenda = ctx.rankedByEssentiality.filter(
    (axis) => ctx.essentiality[axis] >= AGENDA_THRESHOLD,
  );
  const storyAxes =
    officialAgenda.length > 0
      ? officialAgenda
      : ctx.rankedByEssentiality.slice(0, 2);

  const distinct = axisDistinctiveness(ctx.centroid);

  const rows = answered.map(({ scene, choice }, sceneOrder) => {
    const effect = choiceEffect(
      choiceIds,
      choice.id,
      ctx.centroid,
      ctx.distance,
    );
    const marks = agendaMarks(choice, new Set(storyAxes));
    const signatureByAxis = signatureMarks(
      choice,
      effect.closer,
      ctx.centroid,
      distinct,
    );
    return {
      scene,
      choice,
      sceneOrder,
      pull: Math.max(0, effect.pull),
      signature: sumValues(signatureByAxis),
      signatureByAxis,
      agenda: sumValues(marks),
      // Only name “agenda” when the axis cleared the real threshold.
      agendaByAxis: officialAgenda.length > 0 ? marks : {},
    };
  });

  const maxSignature = Math.max(...rows.map((row) => row.signature), 0);
  const maxPull = Math.max(...rows.map((row) => row.pull), 0);
  const maxAgenda = Math.max(...rows.map((row) => row.agenda), 0);
  const useSignature = maxSignature > 1e-9;

  const ranked = rows
    .map((row) => {
      const pullNorm = useSignature
        ? row.signature / maxSignature
        : maxPull > 1e-9
          ? row.pull / maxPull
          : 0;
      const agendaNorm = maxAgenda > 1e-9 ? row.agenda / maxAgenda : 0;
      return {
        ...row,
        combined: PULL_BLEND * pullNorm + AGENDA_BLEND * agendaNorm,
      };
    })
    .filter((row) => row.combined > 1e-6)
    .sort((a, b) => {
      if (b.combined !== a.combined) return b.combined - a.combined;
      return a.sceneOrder - b.sceneOrder;
    });

  if (ranked.length === 0) return [];

  const picked = ranked.slice(0, 2);
  const third = ranked[2];
  if (
    third &&
    picked.length < DRIVER_LIMIT &&
    third.combined >= ranked[0].combined * DRIVER_THIRD_RATIO
  ) {
    picked.push(third);
  }

  return picked.map((row) => ({
    choiceId: row.choice.id,
    sceneTitle: row.scene.title,
    choiceLabel: row.choice.label,
    reason: driverReason(
      row.choice,
      useSignature ? row.signatureByAxis : {},
      row.agendaByAxis,
      row.pull > 1e-6,
    ),
  }));
}

function answeredChoices(choiceIds: string[]): {
  scene: Story["scenes"][number];
  choice: Choice;
}[] {
  const ids = new Set(choiceIds);
  const out: { scene: Story["scenes"][number]; choice: Choice }[] = [];
  for (const scene of axisScenes()) {
    const choice = scene.choices.find((c) => ids.has(c.id));
    if (choice) out.push({ scene, choice });
  }
  return out;
}

/**
 * How this answer changed the match.
 * `pull` is the drop in Euclidean distance (positive = closer).
 * `closer[axis]` is the drop in squared distance on that axis.
 */
function choiceEffect(
  choiceIds: string[],
  choiceId: string,
  centroid: AxisScores,
  fullDistance: number,
): { pull: number; closer: Partial<Record<AxisId, number>> } {
  const withScores = scoreFromChoices(choiceIds);
  const withoutScores = scoreFromChoices(
    choiceIds.filter((id) => id !== choiceId),
  );
  const closer: Partial<Record<AxisId, number>> = {};
  for (const axis of AXIS_IDS) {
    const target = centroid[axis] ?? 0;
    const withDelta = withScores[axis] - target;
    const withoutDelta = withoutScores[axis] - target;
    const reduced = withoutDelta * withoutDelta - withDelta * withDelta;
    if (reduced > 1e-8) closer[axis] = reduced;
  }
  return {
    pull: euclidean(withoutScores, centroid) - fullDistance,
    closer,
  };
}

function agendaMarks(
  choice: Choice,
  axes: Set<AxisId>,
): Partial<Record<AxisId, number>> {
  const marks: Partial<Record<AxisId, number>> = {};
  if (axes.size === 0) return marks;
  const salience = choice.salience ?? deriveSalienceFromWeights(choice.weights);
  for (const axis of axes) {
    const s = salience[axis];
    const w = choice.weights[axis];
    if (typeof s === "number" && typeof w === "number" && w !== 0) {
      const mark = clamp(s, 0, 1) * Math.abs(w);
      if (mark > 0) marks[axis] = mark;
    }
  }
  return marks;
}

/** How far this centroid sits from the other archetypes, per axis. */
function axisDistinctiveness(centroid: AxisScores): Record<AxisId, number> {
  const others = archetypes.filter((arch) => arch.centroid !== centroid);
  const basis = others.length > 0 ? others : archetypes;
  const out = {} as Record<AxisId, number>;
  for (const axis of AXIS_IDS) {
    let sum = 0;
    for (const arch of basis) sum += arch.centroid[axis] ?? 0;
    const mean = sum / basis.length;
    out[axis] = Math.abs((centroid[axis] ?? 0) - mean);
  }
  return out;
}

/**
 * Squared-distance reduction on axes that define this archetype and that
 * the choice pushed in the same direction.
 */
function signatureMarks(
  choice: Choice,
  closer: Partial<Record<AxisId, number>>,
  centroid: AxisScores,
  distinct: Record<AxisId, number>,
): Partial<Record<AxisId, number>> {
  const marks: Partial<Record<AxisId, number>> = {};
  for (const axis of AXIS_IDS) {
    const moved = closer[axis] ?? 0;
    if (moved <= 0) continue;
    const lean = centroid[axis] ?? 0;
    const weight = choice.weights[axis] ?? 0;
    if (weight * lean <= 0 || Math.abs(lean) < SIGNATURE_LEAN) continue;
    const mark = moved * distinct[axis];
    if (mark > 0) marks[axis] = mark;
  }
  return marks;
}

function sumValues(marks: Partial<Record<AxisId, number>>): number {
  let total = 0;
  for (const axis of AXIS_IDS) total += marks[axis] ?? 0;
  return total;
}

function strongestAxis(
  marks: Partial<Record<AxisId, number>>,
): AxisId | null {
  let best: AxisId | null = null;
  let bestVal = 0;
  for (const axis of AXIS_IDS) {
    const value = marks[axis] ?? 0;
    if (value > bestVal) {
      best = axis;
      bestVal = value;
    }
  }
  return best;
}

function driverReason(
  choice: Choice,
  signatureByAxis: Partial<Record<AxisId, number>>,
  agendaByAxis: Partial<Record<AxisId, number>>,
  pulledCloser: boolean,
): string {
  const pullAxis = strongestAxis(signatureByAxis);
  const agendaAxis = strongestAxis(agendaByAxis);

  if (pullAxis && agendaAxis && pullAxis !== agendaAxis) {
    return `${leanSentence(choice, pullAxis)} — isso aproxima este perfil. Também pesou na agenda em ${themePhrase(choice, agendaAxis)}.`;
  }
  if (pullAxis && agendaAxis) {
    return `${leanSentence(choice, pullAxis)} — isso aproxima este perfil e pesa na agenda.`;
  }
  if (pullAxis) {
    return `${leanSentence(choice, pullAxis)} — isso aproxima este perfil.`;
  }
  if (agendaAxis) {
    return `${leanSentence(choice, agendaAxis)} — e o tema pesa na agenda.`;
  }
  if (pulledCloser) {
    return "No conjunto, esta escolha deixou o resultado mais perto deste perfil.";
  }

  const fallback = strongestWeightAxis(choice);
  if (fallback) return `${leanSentence(choice, fallback)}.`;
  return "Esta escolha entrou na conta do perfil.";
}

function leanSentence(choice: Choice, axis: AxisId): string {
  const meta = AXIS_LABELS[axis];
  return `No tema ${meta.name}, você pendeu para ${poleLabel(choice, axis)}`;
}

function themePhrase(choice: Choice, axis: AxisId): string {
  const meta = AXIS_LABELS[axis];
  return `${meta.name} (${poleLabel(choice, axis)})`;
}

function poleLabel(choice: Choice, axis: AxisId): string {
  const meta = AXIS_LABELS[axis];
  const weight = choice.weights[axis] ?? 0;
  const raw = weight > 0 ? meta.high : meta.low;
  return raw.charAt(0).toLowerCase() + raw.slice(1);
}

function strongestWeightAxis(choice: Choice): AxisId | null {
  let best: AxisId | null = null;
  let bestAbs = 0;
  for (const axis of AXIS_IDS) {
    const weight = choice.weights[axis];
    if (typeof weight !== "number") continue;
    const abs = Math.abs(weight);
    if (abs > bestAbs) {
      best = axis;
      bestAbs = abs;
    }
  }
  return best;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
