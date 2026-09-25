"use client";

import { useMemo, useState } from "react";
import { formatShareText } from "@/lib/shareText";
import type { ScoreResult } from "@/lib/types";

interface ShareResultProps {
  result: ScoreResult;
}

export function ShareResult({ result }: ShareResultProps) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const text = useMemo(() => {
    const url =
      typeof window !== "undefined" ? window.location.origin : undefined;
    return formatShareText(result, url);
  }, [result]);

  async function copy() {
    setError(null);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Não foi possível copiar. Selecione o texto abaixo e copie manualmente.");
    }
  }

  async function shareNative() {
    setError(null);
    if (!navigator.share) {
      await copy();
      return;
    }
    try {
      await navigator.share({
        title: `Rosa Política — ${result.archetype.name}`,
        text,
      });
    } catch (err) {
      // User cancelled share sheet — ignore.
      if (err instanceof DOMException && err.name === "AbortError") return;
      await copy();
    }
  }

  const canShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  return (
    <section className="mt-12 w-full max-w-xl">
      <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
        Compartilhar por mensagem
      </h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Copie a mensagem abaixo e cole no WhatsApp, Telegram ou onde quiser.
      </p>

      <pre className="mt-4 whitespace-pre-wrap rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4 text-left text-sm leading-relaxed text-[var(--ink-soft)]">
        {text}
      </pre>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={copy}
          className="rounded-lg bg-[var(--accent)] px-5 py-2.5 font-semibold text-[var(--ink)] transition-opacity hover:opacity-90"
        >
          {copied ? "Copiado!" : "Copiar resultado"}
        </button>
        {canShare ? (
          <button
            type="button"
            onClick={shareNative}
            className="rounded-lg border border-[var(--line)] px-5 py-2.5 font-medium text-[var(--ink)] transition-colors hover:border-[var(--accent-muted)]"
          >
            Enviar…
          </button>
        ) : null}
      </div>
      {error ? (
        <p className="mt-2 text-sm text-[var(--accent)]" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
