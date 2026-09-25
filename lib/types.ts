/** Political axes: each runs continuously from -1 to +1. */
export type AxisId =
  | "economy"
  | "authority"
  | "liberty"
  | "equality"
  | "tradition"
  | "environment"
  | "security"
  | "global"
  | "technology"
  | "body";

export type AxisWeights = Partial<Record<AxisId, number>>;

export type AxisScores = Record<AxisId, number>;

/** Per-axis salience 0–1: how non-negotiable / central the theme is in a choice. */
export type AxisSalience = Partial<Record<AxisId, number>>;

export const AXIS_IDS: AxisId[] = [
  "economy",
  "authority",
  "liberty",
  "equality",
  "tradition",
  "environment",
  "security",
  "global",
  "technology",
  "body",
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
  environment: {
    name: "Ambiente",
    low: "Exploração / crescimento",
    high: "Preservação / limites ecológicos",
  },
  security: {
    name: "Segurança",
    low: "Risco aceito / abertura",
    high: "Proteção / controle de ameaças",
  },
  global: {
    name: "Global",
    low: "Soberania / prioridade local",
    high: "Cooperação / integração externa",
  },
  technology: {
    name: "Tecnologia",
    low: "Cautela / freio social",
    high: "Aceleração / inovação liberada",
  },
  body: {
    name: "Corpo",
    low: "Norma coletiva / proteção moral",
    high: "Autonomia corporal / privada",
  },
};

export interface Choice {
  id: string;
  label: string;
  /** Short consequence hint shown under the option (trade-off, not moral judgment). */
  hint?: string;
  weights: AxisWeights;
  /**
   * How central each touched theme is in this decision (0–1).
   * High = near-essential / border of the acceptable; low = negotiable preference.
   */
  salience?: AxisSalience;
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

export interface AxisProfile {
  position: number;
  /** 0–100 essentiality (0 = never activated or fully negotiable). */
  essentiality: number;
  tier: "essential" | "moderate" | "peripheral" | "untouched";
}

export interface ScoreResult {
  scores: AxisScores;
  /** Position mapped to 0–100 for display. */
  display: Record<AxisId, number>;
  /** Essentiality 0–100 per axis. */
  essentiality: Record<AxisId, number>;
  profiles: Record<AxisId, AxisProfile>;
  /** Axes ranked by essentiality (highest first), excluding untouched. */
  rankedByEssentiality: AxisId[];
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
