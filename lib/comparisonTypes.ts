import type { AxisId } from "@/lib/types";

/** Below this many anonymous results, the UI must not show shares or averages. */
export const MIN_COMPARISON = 20;

/** Minimum gap between two different submissions from the same browser. */
export const COMPARISON_RATE_MS = 3000;

export interface AxisAverage {
  id: AxisId;
  name: string;
  low: string;
  high: string;
  /** Mean position on the 0–100 display scale. */
  average: number;
}

export interface ShareRow {
  id: string;
  name: string;
  count: number;
  /** Fraction of the relevant total, from 0 to 1. */
  share: number;
}

export interface PerfilComparison {
  available: true;
  track: "perfil";
  count: number;
  ready: boolean;
  /** Present only when {@link ready} is true. */
  axes: AxisAverage[] | null;
  /** Present only when {@link ready} is true. */
  archetypes: ShareRow[] | null;
  accepted?: boolean;
  /** Why a submission was ignored. Absent when it was stored. */
  reason?: "throttle" | "full";
}

export interface EstadoComparison {
  available: true;
  track: "estado";
  count: number;
  ready: boolean;
  /** Present only when {@link ready} is true. Share is of {@link count}. */
  primary: ShareRow[] | null;
  /** How many results included a second arrangement. */
  secondaryPeople: number;
  /**
   * Present only when {@link ready} is true.
   * Share is of {@link secondaryPeople}, or 0 when nobody had a second arrangement.
   */
  secondary: ShareRow[] | null;
  accepted?: boolean;
  reason?: "throttle" | "full";
}

export interface ComparisonUnavailable {
  available: false;
}

export type PerfilResponse = PerfilComparison | ComparisonUnavailable;
export type EstadoResponse = EstadoComparison | ComparisonUnavailable;

export function isPerfilComparison(value: unknown): value is PerfilComparison {
  if (!value || typeof value !== "object") return false;
  const row = value as PerfilComparison;
  if (row.available !== true || row.track !== "perfil") return false;
  if (!isCount(row.count) || typeof row.ready !== "boolean") return false;
  if (!row.ready) return row.axes == null && row.archetypes == null;
  return Array.isArray(row.axes) && Array.isArray(row.archetypes);
}

export function isEstadoComparison(value: unknown): value is EstadoComparison {
  if (!value || typeof value !== "object") return false;
  const row = value as EstadoComparison;
  if (row.available !== true || row.track !== "estado") return false;
  if (!isCount(row.count) || typeof row.ready !== "boolean") return false;
  if (!isCount(row.secondaryPeople)) return false;
  if (!row.ready) return row.primary == null && row.secondary == null;
  return Array.isArray(row.primary) && Array.isArray(row.secondary);
}

function isCount(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}
