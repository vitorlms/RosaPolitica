import type { ScoreResult } from "@/lib/types";

/** Hard cap for WhatsApp/Telegram paste, including the URL. */
export const SHARE_TEXT_MAX_CHARS = 180;

/**
 * Share body without the URL — used with `navigator.share({ text, url })`
 * so the link is not duplicated by the platform.
 */
export function formatShareBody(result: ScoreResult): string {
  const name = result.archetype.name;
  const candidates = [
    `Fiz o Rosa Política: escolho em dilemas e vejo meu perfil. Saí como ${name}.`,
    `Rosa Política — dilemas políticos. Meu perfil: ${name}.`,
    `Rosa Política: meu perfil é ${name}.`,
  ];

  for (const text of candidates) {
    if (text.length <= SHARE_TEXT_MAX_CHARS) return text;
  }

  const prefix = "Rosa Política: meu perfil é ";
  const budget = SHARE_TEXT_MAX_CHARS - prefix.length;
  const clipped =
    budget >= 3
      ? `${name.slice(0, Math.max(budget - 1, 0))}…`
      : name.slice(0, Math.max(budget, 0));
  return `${prefix}${clipped}`.slice(0, SHARE_TEXT_MAX_CHARS);
}

/**
 * Plain-text share message for clipboard paste: body + optional link.
 * Kept under {@link SHARE_TEXT_MAX_CHARS}.
 */
export function formatShareText(result: ScoreResult, siteUrl?: string): string {
  const body = formatShareBody(result);
  const url = siteUrl?.trim() ?? "";
  if (!url) return body;

  const withUrl = `${body}\n${url}`;
  if (withUrl.length <= SHARE_TEXT_MAX_CHARS) return withUrl;

  // Shrink body so the URL still fits on its own line.
  const budget = SHARE_TEXT_MAX_CHARS - url.length - 1;
  const trimmedBody =
    budget >= 12 ? `${body.slice(0, budget - 1)}…` : body.slice(0, Math.max(budget, 0));
  return `${trimmedBody}\n${url}`.slice(0, SHARE_TEXT_MAX_CHARS);
}
