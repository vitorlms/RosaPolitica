"use client";

import { Suspense, use, useState, useSyncExternalStore, type ReactNode } from "react";
import {
  MIN_COMPARISON,
  isEstadoComparison,
  isPerfilComparison,
  type EstadoComparison,
  type PerfilComparison,
} from "@/lib/comparisonTypes";
import type { AxisScores } from "@/lib/types";

const BROWSER_ID_KEY = "rosa-politica-comparar-id";
const OPT_IN_KEY = "rosa-politica-comparar-opt-in";
const BROWSER_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const requests = new Map<string, Promise<PerfilComparison | EstadoComparison | null>>();
let withdrawRequested = false;
let currentLoad: Promise<unknown> = Promise.resolve();

function subscribe(onStoreChange: () => void) {
  window.addEventListener("rosa-comparar", onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener("rosa-comparar", onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function optedIn(): boolean {
  try {
    return (
      localStorage.getItem(OPT_IN_KEY) === "1" &&
      BROWSER_ID.test(localStorage.getItem(BROWSER_ID_KEY) ?? "")
    );
  } catch {
    return false;
  }
}

function rememberOptIn(): boolean {
  const existing = localStorage.getItem(BROWSER_ID_KEY);
  if (!existing || !BROWSER_ID.test(existing)) {
    localStorage.setItem(BROWSER_ID_KEY, crypto.randomUUID());
  }
  localStorage.setItem(OPT_IN_KEY, "1");
  window.dispatchEvent(new Event("rosa-comparar"));
  return true;
}

export function CompararPerfil({
  scores,
  archetypeId,
}: {
  scores: AxisScores;
  archetypeId: string;
}) {
  return (
    <CompararShell
      track="perfil"
      payload={{ scores, archetypeId }}
      render={(data) =>
        isPerfilComparison(data) ? (
          <PerfilChart data={data} scores={scores} archetypeId={archetypeId} />
        ) : (
          <Down />
        )
      }
    />
  );
}

export function CompararEstado({
  primaryId,
  secondaryId,
}: {
  primaryId: string;
  secondaryId: string | null;
}) {
  return (
    <CompararShell
      track="estado"
      payload={{ primaryId, secondaryId }}
      render={(data) =>
        isEstadoComparison(data) ? (
          <EstadoChart
            data={data}
            primaryId={primaryId}
            secondaryId={secondaryId}
          />
        ) : (
          <Down />
        )
      }
    />
  );
}

function CompararShell({
  track,
  payload,
  render,
}: {
  track: "perfil" | "estado";
  payload: unknown;
  render: (data: unknown) => ReactNode;
}) {
  const opted = useSyncExternalStore(subscribe, optedIn, () => false);
  const [attempt, setAttempt] = useState(0);
  const [blocked, setBlocked] = useState(false);

  if (!opted) {
    return (
      <section className="mt-12 w-full max-w-xl rounded-lg border border-[var(--line)] bg-[var(--surface)] px-4 py-4 text-left">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
          Comparar com os outros
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">
          Quer ver o seu resultado perto do das outras pessoas? Se entrar, ele
          vai para uma conta anônima: sem nome, sem e-mail, sem IP e sem o nome
          do país. Neste navegador, o outro teste entra do mesmo jeito.
        </p>
        <button
          type="button"
          onClick={() => {
            try {
              rememberOptIn();
              setBlocked(false);
            } catch {
              setBlocked(true);
            }
          }}
          className="mt-4 inline-flex rounded-lg bg-[var(--accent)] px-5 py-2.5 font-semibold text-[var(--ink)]"
        >
          Entrar na comparação
        </button>
        {blocked ? (
          <p className="mt-3 text-sm text-[var(--muted)]">
            Este navegador não deixou guardar a escolha. A comparação fica
            desligada.
          </p>
        ) : null}
      </section>
    );
  }

  return (
    <section className="mt-12 w-full max-w-xl text-left">
      <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
        Comparar com os outros
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
        Conta anônima deste navegador. Sem nome, sem e-mail, sem IP e sem o
        nome do país.
      </p>
      <div className="mt-4">
        <Suspense
          key={attempt}
          fallback={
            <p className="text-sm text-[var(--muted)]">Buscando a comparação…</p>
          }
        >
          <ComparisonLoad
            track={track}
            payload={payload}
            attempt={attempt}
            render={render}
            onRetry={() => setAttempt((value) => value + 1)}
          />
        </Suspense>
      </div>
      <LeaveButton />
    </section>
  );
}

function ComparisonLoad({
  track,
  payload,
  attempt,
  render,
  onRetry,
}: {
  track: "perfil" | "estado";
  payload: unknown;
  attempt: number;
  render: (data: unknown) => ReactNode;
  onRetry: () => void;
}) {
  const data = use(loadComparison(track, payload, attempt));
  if (!data) return <Down onRetry={onRetry} />;
  return render(data);
}

function loadComparison(
  track: "perfil" | "estado",
  payload: unknown,
  attempt: number,
): Promise<PerfilComparison | EstadoComparison | null> {
  const browserId = localStorage.getItem(BROWSER_ID_KEY) ?? "";
  const key = `${track}:${attempt}:${browserId}:${JSON.stringify(payload)}`;
  const cached = requests.get(key);
  if (cached) return cached;
  const pending = (async () => {
    if (withdrawRequested) return null;
    const response = await fetch(`/api/comparar/${track}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        payload && typeof payload === "object" ? { ...payload, browserId } : { browserId },
      ),
      cache: "no-store",
    });
    if (withdrawRequested) {
      await fetch(`/api/comparar/${track}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ browserId }),
      });
      return null;
    }
    if (!response.ok) return null;
    const json: unknown = await response.json();
    if (track === "perfil" && isPerfilComparison(json)) return json;
    if (track === "estado" && isEstadoComparison(json)) return json;
    return null;
  })().catch(() => null);
  requests.set(key, pending);
  currentLoad = pending;
  return pending;
}

function PerfilChart({
  data,
  scores,
  archetypeId,
}: {
  data: PerfilComparison;
  scores: AxisScores;
  archetypeId: string;
}) {
  if (!data.ready || !data.axes || !data.archetypes) {
    return <Few count={data.count} accepted={data.accepted} reason={data.reason} />;
  }
  const mine = data.archetypes.find((row) => row.id === archetypeId);
  return (
    <div>
      <StatusNote accepted={data.accepted} reason={data.reason} />
      <p className="text-sm leading-relaxed text-[var(--ink-soft)]">
        A bolinha é você. O traço é a média de {formatCount(data.count)}{" "}
        resultados.
      </p>
      <ul className="mt-5 flex flex-col gap-5">
        {data.axes.map((axis) => (
          <AxisCompare
            key={axis.id}
            name={axis.name}
            low={axis.low}
            high={axis.high}
            you={displayOf(scores[axis.id])}
            average={axis.average}
          />
        ))}
      </ul>
      <h3 className="mt-8 font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">
        Arquétipos
      </h3>
      <p className="mt-1 text-sm text-[var(--ink-soft)]">
        {mine
          ? `O seu, ${mine.name}, apareceu em ${formatShare(mine.share)} dos resultados.`
          : "O seu arquétipo entra na lista quando a conta atualizar."}
      </p>
      <ShareList rows={data.archetypes} yours={archetypeId} />
    </div>
  );
}

function EstadoChart({
  data,
  primaryId,
  secondaryId,
}: {
  data: EstadoComparison;
  primaryId: string;
  secondaryId: string | null;
}) {
  if (!data.ready || !data.primary || !data.secondary) {
    return <Few count={data.count} accepted={data.accepted} reason={data.reason} />;
  }
  const mine = data.primary.find((row) => row.id === primaryId);
  const second = secondaryId
    ? data.secondary.find((row) => row.id === secondaryId)
    : undefined;
  return (
    <div>
      <StatusNote accepted={data.accepted} reason={data.reason} />
      <h3 className="font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">
        Arranjo principal
      </h3>
      <p className="mt-1 text-sm leading-relaxed text-[var(--ink-soft)]">
        {mine
          ? `${mine.name} foi o arranjo principal de ${formatShare(mine.share)} das ${formatCount(data.count)} pessoas.`
          : `Entre ${formatCount(data.count)} pessoas.`}{" "}
        O seu está marcado.
      </p>
      <ShareList rows={data.primary} yours={primaryId} />
      <h3 className="mt-8 font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">
        Segundo arranjo
      </h3>
      {data.secondaryPeople === 0 ? (
        <p className="mt-1 text-sm text-[var(--ink-soft)]">
          Ninguém ficou com um segundo arranjo.
        </p>
      ) : (
        <>
          <p className="mt-1 text-sm leading-relaxed text-[var(--ink-soft)]">
            Só entre quem teve um segundo: {formatCount(data.secondaryPeople)}{" "}
            de {formatCount(data.count)}.
            {secondaryId
              ? second
                ? ` O seu, ${second.name}, apareceu em ${formatShare(second.share)} desse grupo.`
                : ""
              : " Você ficou com um arranjo só."}
          </p>
          <ShareList rows={data.secondary} yours={secondaryId} />
        </>
      )}
    </div>
  );
}

function AxisCompare({
  name,
  low,
  high,
  you,
  average,
}: {
  name: string;
  low: string;
  high: string;
  you: number;
  average: number;
}) {
  return (
    <li>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-medium text-[var(--ink)]">{name}</span>
        <span className="text-sm tabular-nums text-[var(--muted)]">
          você {you} · média {average}
        </span>
      </div>
      <div className="relative mt-2 h-6">
        <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-[var(--line)]" />
        <span
          className="absolute top-1/2 h-4 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-[var(--ink-soft)]"
          style={{ left: `${average}%` }}
        >
          <span className="sr-only">média {average}</span>
        </span>
        <span
          className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)]"
          style={{ left: `${you}%` }}
        >
          <span className="sr-only">você {you}</span>
        </span>
      </div>
      <p className="text-sm text-[var(--ink-soft)]">{lean(you, average, low, high)}</p>
      <div className="mt-0.5 flex justify-between gap-4 text-xs text-[var(--muted)]">
        <span>{low}</span>
        <span className="text-right">{high}</span>
      </div>
    </li>
  );
}

function ShareList({
  rows,
  yours,
}: {
  rows: { id: string; name: string; share: number }[];
  yours: string | null;
}) {
  return (
    <ul className="mt-4 flex flex-col gap-2">
      {rows.map((row) => {
        const mine = row.id === yours;
        return (
          <li
            key={row.id}
            className={`rounded-lg border px-3 py-2 ${
              mine
                ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                : "border-[var(--line)] bg-[var(--surface)]"
            }`}
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm text-[var(--ink)]">
                {row.name}
                {mine ? <span className="text-[var(--accent)]"> · o seu</span> : null}
              </span>
              <span className="shrink-0 text-sm tabular-nums text-[var(--muted)]">
                {formatShare(row.share)}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--line)]">
              <div
                className={`h-full rounded-full ${mine ? "bg-[var(--accent)]" : "bg-[var(--muted)]"}`}
                style={{ width: `${Math.min(100, Math.max(0, row.share * 100))}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function Few({
  count,
  accepted,
  reason,
}: {
  count: number;
  accepted?: boolean;
  reason?: "throttle" | "full";
}) {
  return (
    <div>
      <StatusNote accepted={accepted} reason={reason} />
      <p className="text-sm leading-relaxed text-[var(--ink-soft)]">
        Ainda poucas respostas para comparar — {formatCount(count)} até agora. A
        média aparece a partir de {MIN_COMPARISON}, quando dá para confiar no
        número.
      </p>
    </div>
  );
}

function StatusNote({
  accepted,
  reason,
}: {
  accepted?: boolean;
  reason?: "throttle" | "full";
}) {
  if (accepted !== false) return null;
  if (reason === "full") {
    return (
      <p className="mb-3 text-sm text-[var(--muted)]">
        A conta anônima não está aceitando navegador novo. A média de quem já
        entrou continua aqui.
      </p>
    );
  }
  return (
    <p className="mb-3 text-sm text-[var(--muted)]">
      Este envio ainda não entrou. Espere alguns segundos e atualize a página.
    </p>
  );
}

function Down({ onRetry }: { onRetry?: () => void }) {
  return (
    <div>
      <p className="text-sm leading-relaxed text-[var(--ink-soft)]">
        A comparação está fora do ar agora. O seu resultado continua nesta
        página.
      </p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 inline-flex rounded-lg border border-[var(--line)] px-4 py-2 text-sm font-medium text-[var(--ink)]"
        >
          Tentar de novo
        </button>
      ) : null}
    </div>
  );
}

function LeaveButton() {
  const [leaving, setLeaving] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div className="mt-6">
      <button
        type="button"
        disabled={leaving}
        onClick={() => {
          setLeaving(true);
          setFailed(false);
          void leaveComparison().then((ok) => {
            setLeaving(false);
            setFailed(!ok);
          });
        }}
        className="text-sm text-[var(--muted)] underline-offset-2 hover:text-[var(--ink)] hover:underline disabled:opacity-60"
      >
        {leaving ? "Tirando…" : "Tirar o meu da conta"}
      </button>
      {failed ? (
        <p className="mt-2 text-sm text-[var(--muted)]">
          Não deu para tirar agora. Tente de novo daqui a pouco.
        </p>
      ) : null}
    </div>
  );
}

async function leaveComparison(): Promise<boolean> {
  withdrawRequested = true;
  const browserId = localStorage.getItem(BROWSER_ID_KEY);
  try {
    await currentLoad;
  } catch {
    // The submission is checked again below.
  }
  if (!browserId) {
    localStorage.removeItem(OPT_IN_KEY);
    requests.clear();
    withdrawRequested = false;
    window.dispatchEvent(new Event("rosa-comparar"));
    return true;
  }
  try {
    const options = {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ browserId }),
    };
    const [perfil, estado] = await Promise.all([
      fetch("/api/comparar/perfil", options),
      fetch("/api/comparar/estado", options),
    ]);
    if (!perfil.ok || !estado.ok) {
      withdrawRequested = false;
      return false;
    }
    const [perfilBody, estadoBody] = (await Promise.all([
      perfil.json(),
      estado.json(),
    ])) as unknown[];
    const perfilOk =
      perfilBody !== null &&
      typeof perfilBody === "object" &&
      "available" in perfilBody &&
      perfilBody.available === true;
    const estadoOk =
      estadoBody !== null &&
      typeof estadoBody === "object" &&
      "available" in estadoBody &&
      estadoBody.available === true;
    if (!perfilOk || !estadoOk) {
      withdrawRequested = false;
      return false;
    }
    localStorage.removeItem(OPT_IN_KEY);
    requests.clear();
    withdrawRequested = false;
    window.dispatchEvent(new Event("rosa-comparar"));
    return true;
  } catch {
    withdrawRequested = false;
    return false;
  }
}

function displayOf(score: number): number {
  return Math.round(((score + 1) / 2) * 100);
}

function lean(you: number, average: number, low: string, high: string): string {
  const delta = you - average;
  if (Math.abs(delta) < 8) return "Perto da média";
  const side = delta > 0 ? high : low;
  return `Mais para o lado de ${side.toLowerCase()} do que a média`;
}

function formatShare(share: number): string {
  const pct = share * 100;
  if (pct > 0 && pct < 1) return "menos de 1%";
  return `${Math.round(pct).toLocaleString("pt-BR")}%`;
}

function formatCount(count: number): string {
  return count.toLocaleString("pt-BR");
}
