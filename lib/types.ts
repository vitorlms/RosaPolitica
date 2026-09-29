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

export interface ArchetypeExample {
  name: string;
  /** Short reason this person is used as an illustration. */
  note: string;
}

export interface Archetype {
  id: string;
  name: string;
  description: string;
  /** Illustrative real people — approximate, not a precise classification. */
  examples?: ArchetypeExample[];
  /** Ideal centroid in axis space (-1..+1). */
  centroid: AxisScores;
}

/** Display threshold: agenda items must clear this saliency (0–100). */
export const AGENDA_THRESHOLD = 70;

export interface AxisProfile {
  position: number;
  /**
   * 0–100 saliency / weight of the theme in choices.
   * Shown in the UI as “agenda política” when ≥ {@link AGENDA_THRESHOLD}.
   */
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

/**
 * One mutually exclusive way to arrange a piece of government.
 * The label names a mechanism, not a regime, party, or ideology.
 * Not used by axis scoring. See docs/governo-ideal.md.
 */
export interface InstitutionOption {
  id: string;
  /** Short player-facing label. */
  label: string;
  /** Problem this option mainly tries to solve. */
  solves: string;
  /** Cost the option accepts. */
  tradeoff: string;
  /** Author note. Not for the result UI. */
  notes?: string;
}

/** Law-style category. Options inside it are mutually exclusive. */
export interface InstitutionCategory {
  id: string;
  name: string;
  /** What this category decides. */
  question: string;
  options: InstitutionOption[];
}

/**
 * Catalog for a future “governo ideal” block.
 * Content skeleton only — not imported by scoring, play, or result.
 */
export interface InstitutionCatalog {
  id: string;
  status: "skeleton";
  title: string;
  /** Future result heading, separate from the axis profile. */
  resultTitle: string;
  /** Future lead under that heading. */
  resultLead: string;
  summary: string;
  /** Authoring rule. Not for the result UI. */
  authorNote: string;
  categories: InstitutionCategory[];
}

/** How strongly a story choice leans toward one institution option. */
export interface InstitutionLean {
  categoryId: string;
  optionId: string;
  /** 0–1. How directly the choice is about that arrangement. */
  strength: number;
}

/** Story choice plus an institution lean. Axis fields match {@link Choice}. */
export interface DraftChoice extends Choice {
  /**
   * Future input to the ideal-government profile.
   * Ignored by axis scoring.
   */
  leans?: InstitutionLean[];
}

export interface DraftScene {
  id: string;
  title: string;
  body: string;
  choices: DraftChoice[];
}

/**
 * Dilemma drafts that probe institutional preferences.
 * Same scene shape as the live story, kept out of the 40-scene path.
 */
export interface InstitutionDraft {
  status: "draft";
  /** Why this file exists and that scoring must not import it yet. */
  note: string;
  scenes: DraftScene[];
}

/**
 * Future result row: one option per category.
 * Not computed yet.
 */
export interface InstitutionPick {
  categoryId: string;
  optionId: string;
  /** Sum of lean strengths that supported this option. */
  support?: number;
  /** True when the category stayed open because the top options were too close. */
  open?: boolean;
}
