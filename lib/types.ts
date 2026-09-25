/** Political axes: each runs continuously from -1 to +1. */
export type AxisId =
  | "economy"
  | "authority"
  | "liberty"
  | "equality"
  | "tradition";

export type AxisWeights = Partial<Record<AxisId, number>>;

export type AxisScores = Record<AxisId, number>;

export const AXIS_IDS: AxisId[] = [
  "economy",
  "authority",
  "liberty",
  "equality",
  "tradition",
];

export const AXIS_LABELS: Record<
  AxisId,
  { name: string; low: string; high: string }
> = {
  economy: {
    name: "Economia",
    low: "Redistribuição / Estado ativo",
    high: "Mercado / propriedade privada",
  },
  authority: {
    name: "Autoridade",
    low: "Autonomia / descentralização",
    high: "Ordem / Estado forte",
  },
  liberty: {
    name: "Liberdade",
    low: "Bem comum / restrições coletivas",
    high: "Liberdade individual máxima",
  },
  equality: {
    name: "Igualdade",
    low: "Meritocracia / desigualdade aceita",
    high: "Equalização / justiça redistributiva",
  },
  tradition: {
    name: "Tradição",
    low: "Mudança / cosmopolitismo",
    high: "Costumes / continuidade cultural",
  },
};

export interface Choice {
  id: string;
  label: string;
  /** Short consequence hint shown under the option (trade-off, not moral judgment). */
  hint?: string;
  weights: AxisWeights;
}

export interface Scene {
  id: string;
  title: string;
  body: string;
  choices: Choice[];
}

export interface Story {
  world: {
    name: string;
    summary: string;
  };
  scenes: Scene[];
}

export interface Archetype {
  id: string;
  name: string;
  description: string;
  /** Ideal centroid in axis space (-1..+1). */
  centroid: AxisScores;
}

export interface ScoreResult {
  scores: AxisScores;
  /** Scores mapped to 0–100 for display. */
  display: Record<AxisId, number>;
  archetype: Archetype;
  /** Euclidean distance to the chosen archetype centroid (lower = closer). */
  distance: number;
}

/**
 * Future hook: origin of political notions could filter/reorder scenes
 * or select an alternate story opening. Not used in this prototype.
 */
export interface OriginProfile {
  tags?: string[];
  preferredStoryId?: string;
}
