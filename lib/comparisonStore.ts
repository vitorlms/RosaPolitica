import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  emptyComparison,
  isComparisonData,
  submitEstado,
  submitPerfil,
  toPublicEstado,
  toPublicPerfil,
  withdrawEstado,
  withdrawPerfil,
  type ComparisonData,
  type EstadoInput,
  type PerfilInput,
} from "@/lib/comparisonModel";
import type { EstadoComparison, PerfilComparison } from "@/lib/comparisonTypes";

/**
 * Anonymous aggregates only.
 * The platform may keep its own access logs; this module never reads or
 * writes an IP, name, email, or country name.
 */
const KV_KEY = "rosa-politica:comparison";

type StoreMode = "kv" | "file" | "off";

interface RedisEnv {
  url: string;
  token: string;
}

let chain: Promise<unknown> = Promise.resolve();

export function comparisonMode(): StoreMode {
  if (process.env.COMPARISON_STORE === "off") return "off";
  if (process.env.COMPARISON_STORE === "file") return "file";
  if (redisEnv()) return "kv";
  if (process.env.VERCEL) return "off";
  return "file";
}

export async function readPerfil(): Promise<PerfilComparison | null> {
  const data = await readData();
  return data ? toPublicPerfil(data) : null;
}

export async function readEstado(): Promise<EstadoComparison | null> {
  const data = await readData();
  return data ? toPublicEstado(data) : null;
}

export async function storePerfil(
  input: PerfilInput,
): Promise<PerfilComparison | null> {
  return mutate((data) => submitPerfil(data, input, Date.now()));
}

export async function storeEstado(
  input: EstadoInput,
): Promise<EstadoComparison | null> {
  return mutate((data) => submitEstado(data, input, Date.now()));
}

export async function dropPerfil(browserId: string): Promise<PerfilComparison | null> {
  return mutate((data) => withdrawPerfil(data, browserId));
}

export async function dropEstado(browserId: string): Promise<EstadoComparison | null> {
  return mutate((data) => withdrawEstado(data, browserId));
}

async function readData(): Promise<ComparisonData | null> {
  if (comparisonMode() === "off") return null;
  return withLock(load);
}

async function mutate<T extends PerfilComparison | EstadoComparison>(
  apply: (data: ComparisonData) => {
    data: ComparisonData;
    view: T;
    unchanged: boolean;
  },
): Promise<T | null> {
  if (comparisonMode() === "off") return null;
  return withLock(async () => {
    const current = await load();
    const result = apply(current);
    if (!result.unchanged) await save(result.data);
    return result.view;
  });
}

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(fn, fn);
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function load(): Promise<ComparisonData> {
  if (comparisonMode() === "kv") return loadKv();
  return loadFile();
}

async function save(data: ComparisonData): Promise<void> {
  if (comparisonMode() === "kv") {
    await saveKv(data);
    return;
  }
  await saveFile(data);
}

async function loadFile(): Promise<ComparisonData> {
  const storeFile = path.join(process.cwd(), "data", "comparison.json");
  try {
    const raw = await readFile(storeFile, "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (!isComparisonData(parsed)) throw new Error("comparison file corrupt");
    return parsed;
  } catch (error) {
    if (isMissing(error)) return emptyComparison();
    throw error;
  }
}

async function saveFile(data: ComparisonData): Promise<void> {
  const storeFile = path.join(process.cwd(), "data", "comparison.json");
  const temporary = path.join(process.cwd(), "data", "comparison.json.tmp");
  await mkdir(path.join(process.cwd(), "data"), { recursive: true });
  await writeFile(temporary, JSON.stringify(data), "utf8");
  await rename(temporary, storeFile);
}

async function loadKv(): Promise<ComparisonData> {
  const result = await kv(["GET", KV_KEY]);
  if (result == null) return emptyComparison();
  const parsed: unknown = typeof result === "string" ? JSON.parse(result) : result;
  if (!isComparisonData(parsed)) throw new Error("comparison store corrupt");
  return parsed;
}

async function saveKv(data: ComparisonData): Promise<void> {
  await kv(["SET", KV_KEY, JSON.stringify(data)]);
}

async function kv(command: (string | number)[]): Promise<unknown> {
  const env = redisEnv();
  if (!env) throw new Error("redis env missing");
  const response = await fetch(env.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    signal: AbortSignal.timeout(8000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("redis request failed");
  const payload = (await response.json()) as { result?: unknown; error?: string };
  if (payload.error) throw new Error("redis command failed");
  return payload.result;
}

function redisEnv(): RedisEnv | null {
  const pairs: (string | undefined)[][] = [
    [process.env.KV_REST_API_URL, process.env.KV_REST_API_TOKEN],
    [process.env.UPSTASH_REDIS_REST_URL, process.env.UPSTASH_REDIS_REST_TOKEN],
  ];
  for (const [url, token] of pairs) {
    if (url && token) return { url: url.replace(/\/$/, ""), token };
  }
  return null;
}

function isMissing(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ENOENT"
  );
}
