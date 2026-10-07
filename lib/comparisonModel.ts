import archetypesData from "@/content/archetypes.json";
import { classroomNameFor } from "@/lib/organizacoes";
import {
  COMPARISON_RATE_MS,
  MIN_COMPARISON,
  type AxisAverage,
  type EstadoComparison,
  type PerfilComparison,
  type ShareRow,
} from "@/lib/comparisonTypes";
import { PROFILE_IDS } from "@/lib/governoFlow";
import {
  AXIS_IDS,
  AXIS_LABELS,
  type Archetype,
  type AxisScores,
} from "@/lib/types";

const archetypes = archetypesData as Archetype[];

const ARCHETYPE_NAMES = new Map(archetypes.map((item) => [item.id, item.name]));

const ORG_ITEMS = PROFILE_IDS.map((id) => {
  const name = classroomNameFor(id);
  if (!name) throw new Error(`Organização sem nome de aula: ${id}`);
  return { id, name };
});

const BROWSER_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Soft cap on remembered browsers. New ids are refused; existing ones can still update. */
const MAX_SEEN = 100_000;

export interface PerfilInput {
  browserId: string;
  scores: AxisScores;
  archetypeId: string;
}

export interface EstadoInput {
  browserId: string;
  primaryId: string;
  secondaryId: string | null;
}

interface SeenPerfil {
  scores: AxisScores;
  archetypeId: string;
  at: number;
}

interface SeenEstado {
  primaryId: string;
  secondaryId: string | null;
  at: number;
}

export interface ComparisonData {
  version: 1;
  perfil: {
    count: number;
    axisSums: AxisScores;
    archetypes: Record<string, number>;
    seen: Record<string, SeenPerfil>;
  };
  estado: {
    count: number;
    primary: Record<string, number>;
    secondary: Record<string, number>;
    secondaryPeople: number;
    seen: Record<string, SeenEstado>;
  };
}

export interface SubmitResult<T> {
  data: ComparisonData;
  view: T;
  /** False when the write was skipped. The previous aggregate is unchanged. */
  accepted: boolean;
  unchanged: boolean;
  reason?: "throttle" | "full";
}

export function emptyComparison(): ComparisonData {
  return {
    version: 1,
    perfil: {
      count: 0,
      axisSums: zeroScores(),
      archetypes: {},
      seen: {},
    },
    estado: {
      count: 0,
      primary: {},
      secondary: {},
      secondaryPeople: 0,
      seen: {},
    },
  };
}

export function parsePerfilBody(value: unknown): PerfilInput | null {
  if (!isPlain(value)) return null;
  if (!isBrowserId(value.browserId) || typeof value.archetypeId !== "string") {
    return null;
  }
  if (!ARCHETYPE_NAMES.has(value.archetypeId)) return null;
  const scores = parseScores(value.scores);
  if (!scores) return null;
  return {
    browserId: value.browserId,
    scores,
    archetypeId: value.archetypeId,
  };
}

export function parseEstadoBody(value: unknown): EstadoInput | null {
  if (!isPlain(value) || !isBrowserId(value.browserId)) return null;
  if (!isProfileId(value.primaryId)) return null;
  let secondaryId: string | null = null;
  if (value.secondaryId != null) {
    if (!isProfileId(value.secondaryId)) return null;
    if (value.secondaryId !== value.primaryId) secondaryId = value.secondaryId;
  }
  return {
    browserId: value.browserId,
    primaryId: value.primaryId,
    secondaryId,
  };
}

export function parseBrowserIdBody(value: unknown): string | null {
  if (!isPlain(value) || !isBrowserId(value.browserId)) return null;
  return value.browserId;
}

export function submitPerfil(
  data: ComparisonData,
  input: PerfilInput,
  now: number,
): SubmitResult<PerfilComparison> {
  const prev = data.perfil.seen[input.browserId];
  if (prev && samePerfil(prev, input)) {
    return done(data, true, true);
  }
  if (prev && now - prev.at < COMPARISON_RATE_MS) {
    return done(data, false, true, "throttle");
  }
  if (!prev && Object.keys(data.perfil.seen).length >= MAX_SEEN) {
    return done(data, false, true, "full");
  }

  const next = clone(data);
  if (prev) {
    next.perfil.count = Math.max(0, next.perfil.count - 1);
    subScores(next.perfil.axisSums, prev.scores);
    dec(next.perfil.archetypes, prev.archetypeId);
  }
  next.perfil.count += 1;
  addScores(next.perfil.axisSums, input.scores);
  inc(next.perfil.archetypes, input.archetypeId);
  next.perfil.seen[input.browserId] = {
    scores: input.scores,
    archetypeId: input.archetypeId,
    at: now,
  };
  if (next.perfil.count === 0) {
    next.perfil.axisSums = zeroScores();
    next.perfil.archetypes = {};
  }
  return done(next, true, false);
}

export function submitEstado(
  data: ComparisonData,
  input: EstadoInput,
  now: number,
): SubmitResult<EstadoComparison> {
  const prev = data.estado.seen[input.browserId];
  if (prev && sameEstado(prev, input)) {
    return doneEstado(data, true, true);
  }
  if (prev && now - prev.at < COMPARISON_RATE_MS) {
    return doneEstado(data, false, true, "throttle");
  }
  if (!prev && Object.keys(data.estado.seen).length >= MAX_SEEN) {
    return doneEstado(data, false, true, "full");
  }

  const next = clone(data);
  if (prev) {
    next.estado.count = Math.max(0, next.estado.count - 1);
    dec(next.estado.primary, prev.primaryId);
    if (prev.secondaryId) {
      next.estado.secondaryPeople = Math.max(0, next.estado.secondaryPeople - 1);
      dec(next.estado.secondary, prev.secondaryId);
    }
  }
  next.estado.count += 1;
  inc(next.estado.primary, input.primaryId);
  if (input.secondaryId) {
    next.estado.secondaryPeople += 1;
    inc(next.estado.secondary, input.secondaryId);
  }
  next.estado.seen[input.browserId] = {
    primaryId: input.primaryId,
    secondaryId: input.secondaryId,
    at: now,
  };
  return doneEstado(next, true, false);
}

export function withdrawPerfil(
  data: ComparisonData,
  browserId: string,
): SubmitResult<PerfilComparison> {
  const prev = data.perfil.seen[browserId];
  if (!prev) return done(data, true, true);
  const next = clone(data);
  delete next.perfil.seen[browserId];
  next.perfil.count = Math.max(0, next.perfil.count - 1);
  subScores(next.perfil.axisSums, prev.scores);
  dec(next.perfil.archetypes, prev.archetypeId);
  if (next.perfil.count === 0) {
    next.perfil.axisSums = zeroScores();
    next.perfil.archetypes = {};
  }
  return done(next, true, false);
}

export function withdrawEstado(
  data: ComparisonData,
  browserId: string,
): SubmitResult<EstadoComparison> {
  const prev = data.estado.seen[browserId];
  if (!prev) return doneEstado(data, true, true);
  const next = clone(data);
  delete next.estado.seen[browserId];
  next.estado.count = Math.max(0, next.estado.count - 1);
  dec(next.estado.primary, prev.primaryId);
  if (prev.secondaryId) {
    next.estado.secondaryPeople = Math.max(0, next.estado.secondaryPeople - 1);
    dec(next.estado.secondary, prev.secondaryId);
  }
  return doneEstado(next, true, false);
}

export function toPublicPerfil(data: ComparisonData): PerfilComparison {
  const ready = data.perfil.count >= MIN_COMPARISON;
  return {
    available: true,
    track: "perfil",
    count: data.perfil.count,
    ready,
    axes: ready ? axisAverages(data) : null,
    archetypes: ready
      ? shareRows(
          data.perfil.archetypes,
          data.perfil.count,
          archetypes.map((item) => ({ id: item.id, name: item.name })),
        )
      : null,
  };
}

export function toPublicEstado(data: ComparisonData): EstadoComparison {
  const ready = data.estado.count >= MIN_COMPARISON;
  const people = data.estado.secondaryPeople;
  return {
    available: true,
    track: "estado",
    count: data.estado.count,
    ready,
    secondaryPeople: ready ? people : 0,
    primary: ready ? shareRows(data.estado.primary, data.estado.count, ORG_ITEMS) : null,
    secondary: ready
      ? shareRows(data.estado.secondary, people, ORG_ITEMS)
      : null,
  };
}

export function isComparisonData(value: unknown): value is ComparisonData {
  if (!isPlain(value) || value.version !== 1) return false;
  if (!isPlain(value.perfil) || !isPlain(value.estado)) return false;
  const perfil = value.perfil;
  const estado = value.estado;
  return (
    isCount(perfil.count) &&
    isAxisSums(perfil.axisSums) &&
    isCountMap(perfil.archetypes) &&
    isSeenMap(perfil.seen, isSeenPerfil) &&
    isCount(estado.count) &&
    isCountMap(estado.primary) &&
    isCountMap(estado.secondary) &&
    isCount(estado.secondaryPeople) &&
    isSeenMap(estado.seen, isSeenEstado)
  );
}

function done(
  data: ComparisonData,
  accepted: boolean,
  unchanged: boolean,
  reason?: "throttle" | "full",
): SubmitResult<PerfilComparison> {
  const view = toPublicPerfil(data);
  if (!accepted && reason) {
    view.accepted = false;
    view.reason = reason;
  } else if (accepted) {
    view.accepted = true;
  }
  return { data, view, accepted, unchanged, reason };
}

function doneEstado(
  data: ComparisonData,
  accepted: boolean,
  unchanged: boolean,
  reason?: "throttle" | "full",
): SubmitResult<EstadoComparison> {
  const view = toPublicEstado(data);
  if (!accepted && reason) {
    view.accepted = false;
    view.reason = reason;
  } else if (accepted) {
    view.accepted = true;
  }
  return { data, view, accepted, unchanged, reason };
}

function axisAverages(data: ComparisonData): AxisAverage[] {
  const count = data.perfil.count;
  return AXIS_IDS.map((id) => {
    const mean = count > 0 ? data.perfil.axisSums[id] / count : 0;
    const average = Math.round(((mean + 1) / 2) * 100);
    return {
      id,
      name: AXIS_LABELS[id].name,
      low: AXIS_LABELS[id].low,
      high: AXIS_LABELS[id].high,
      average: Math.min(100, Math.max(0, average)),
    };
  });
}

function shareRows(
  counts: Record<string, number>,
  total: number,
  items: { id: string; name: string }[],
): ShareRow[] {
  return items
    .map((item, index) => ({
      id: item.id,
      name: item.name,
      count: counts[item.id] ?? 0,
      share: total > 0 ? (counts[item.id] ?? 0) / total : 0,
      index,
    }))
    .sort((a, b) => b.share - a.share || a.index - b.index)
    .map(({ id, name, count, share }) => ({ id, name, count, share }));
}

function samePerfil(prev: SeenPerfil, input: PerfilInput): boolean {
  if (prev.archetypeId !== input.archetypeId) return false;
  return AXIS_IDS.every((axis) => prev.scores[axis] === input.scores[axis]);
}

function sameEstado(prev: SeenEstado, input: EstadoInput): boolean {
  return prev.primaryId === input.primaryId && prev.secondaryId === input.secondaryId;
}

function addScores(sums: AxisScores, scores: AxisScores): void {
  for (const axis of AXIS_IDS) sums[axis] = round6(sums[axis] + scores[axis]);
}

function subScores(sums: AxisScores, scores: AxisScores): void {
  for (const axis of AXIS_IDS) sums[axis] = round6(sums[axis] - scores[axis]);
}

function inc(map: Record<string, number>, key: string): void {
  map[key] = (map[key] ?? 0) + 1;
}

function dec(map: Record<string, number>, key: string): void {
  const next = (map[key] ?? 0) - 1;
  if (next <= 0) delete map[key];
  else map[key] = next;
}

function parseScores(value: unknown): AxisScores | null {
  if (!isPlain(value)) return null;
  const scores = zeroScores();
  for (const axis of AXIS_IDS) {
    const raw = value[axis];
    if (typeof raw !== "number" || !Number.isFinite(raw)) return null;
    const rounded = Math.round(raw * 10000) / 10000;
    if (rounded < -1 || rounded > 1) return null;
    scores[axis] = rounded;
  }
  return scores;
}

function zeroScores(): AxisScores {
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

function isBrowserId(value: unknown): value is string {
  return typeof value === "string" && BROWSER_ID.test(value);
}

function isProfileId(value: unknown): value is string {
  return typeof value === "string" && ORG_ITEMS.some((item) => item.id === value);
}

function isPlain(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isCount(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isCountMap(value: unknown): value is Record<string, number> {
  if (!isPlain(value)) return false;
  return Object.values(value).every((item) => isCount(item));
}

function isAxisSums(value: unknown): value is AxisScores {
  if (!isPlain(value)) return false;
  return AXIS_IDS.every(
    (axis) => typeof value[axis] === "number" && Number.isFinite(value[axis]),
  );
}

function isSeenMap<T>(
  value: unknown,
  item: (row: unknown) => row is T,
): value is Record<string, T> {
  if (!isPlain(value)) return false;
  return Object.entries(value).every(
    ([key, row]) => isBrowserId(key) && item(row),
  );
}

function isSeenPerfil(value: unknown): value is SeenPerfil {
  if (!isPlain(value) || typeof value.archetypeId !== "string") return false;
  if (!isCount(value.at)) return false;
  return isAxisSums(value.scores);
}

function isSeenEstado(value: unknown): value is SeenEstado {
  if (!isPlain(value) || !isCount(value.at)) return false;
  if (typeof value.primaryId !== "string") return false;
  return value.secondaryId === null || typeof value.secondaryId === "string";
}

function round6(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000;
}

function clone(data: ComparisonData): ComparisonData {
  return structuredClone(data);
}

function checkComparison(): void {
  const neutral = zeroScores();
  const high = { ...neutral, economy: 1 };
  const low = { ...neutral, economy: -1 };
  let data = emptyComparison();
  for (let i = 0; i < MIN_COMPARISON - 1; i += 1) {
    const step = submitPerfil(
      data,
      { browserId: fakeId(i), scores: high, archetypeId: "guardiao-pacto" },
      1_000_000 + i,
    );
    if (!step.accepted || step.view.ready) throw new Error("perfil abaixo do mínimo");
    data = step.data;
  }
  if (data.perfil.count !== 19) throw new Error("contagem 19");
  const twentieth = submitPerfil(
    data,
    { browserId: fakeId(19), scores: low, archetypeId: "livre-mercado" },
    2_000_000,
  );
  data = twentieth.data;
  const economy = twentieth.view.axes?.find((axis) => axis.id === "economy");
  if (!twentieth.view.ready || economy?.average !== 95) {
    throw new Error(`média de economia ${economy?.average ?? "sem eixo"}`);
  }
  const replaced = submitPerfil(
    data,
    { browserId: fakeId(0), scores: low, archetypeId: "livre-mercado" },
    3_000_000,
  );
  if (replaced.data.perfil.count !== MIN_COMPARISON) throw new Error("troca inflou a conta");
  const same = submitPerfil(
    replaced.data,
    { browserId: fakeId(0), scores: low, archetypeId: "livre-mercado" },
    3_000_100,
  );
  if (!same.unchanged || same.data !== replaced.data) throw new Error("repetição idêntica");
  const throttled = submitPerfil(
    replaced.data,
    { browserId: fakeId(0), scores: high, archetypeId: "guardiao-pacto" },
    3_000_000 + COMPARISON_RATE_MS - 1,
  );
  if (throttled.accepted || throttled.reason !== "throttle") throw new Error("limite");
  const gone = withdrawPerfil(replaced.data, fakeId(0));
  if (gone.data.perfil.count !== 19 || gone.view.ready || gone.view.axes !== null) {
    throw new Error("retirada do perfil");
  }

  let estado = emptyComparison();
  for (let i = 0; i < MIN_COMPARISON; i += 1) {
    const step = submitEstado(
      estado,
      {
        browserId: fakeId(100 + i),
        primaryId: i < 15 ? "presidencialista" : "tribal",
        secondaryId: i < 4 ? "parlamentarista" : null,
      },
      4_000_000 + i,
    );
    estado = step.data;
  }
  const primary = estado.estado.primary.presidencialista;
  const view = toPublicEstado(estado);
  const row = view.primary?.find((item) => item.id === "presidencialista");
  if (primary !== 15 || row?.share !== 0.75 || view.secondaryPeople !== 4) {
    throw new Error("agregado de Meu Estado");
  }
  if (row?.name !== "Presidencialismo") throw new Error("nome de aula");
  const secret = parseEstadoBody({
    browserId: fakeId(1),
    primaryId: "tribal",
    secondaryId: null,
    countryName: "NomeSecretoDoPais",
    email: "alguem@example.com",
    name: "Fulano",
  });
  if (!secret) throw new Error("corpo do estado");
  const stored = JSON.stringify(submitEstado(emptyComparison(), secret, 5).data);
  if (
    stored.includes("NomeSecretoDoPais") ||
    stored.includes("example.com") ||
    stored.includes("Fulano") ||
    stored.includes("countryName")
  ) {
    throw new Error("dado pessoal no armazenamento");
  }
  if (submitEstado(emptyComparison(), secret, 5).data.perfil.count !== 0) {
    throw new Error("estado escreveu no perfil");
  }
}

function fakeId(n: number): string {
  return `00000000-0000-4000-8000-${n.toString(16).padStart(12, "0")}`;
}

checkComparison();
