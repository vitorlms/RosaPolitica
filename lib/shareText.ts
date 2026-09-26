import type { ScoreResult } from "@/lib/types";

/** Hard cap for WhatsApp/Telegram paste, including the URL. */
export const SHARE_TEXT_MAX_CHARS = 180;

/**
 * Plain-text share message: what the test is + final profile + link.
 * Kept under {@link SHARE_TEXT_MAX_CHARS} for messaging apps.
 */
export function formatShareText(result: ScoreResult, siteUrl?: string): string {
  const name = result.archetype.name;
  const url = siteUrl?.trim() ?? "";

  const candidates = url
    ? [
        `Fiz o Rosa Política: escolho em dilemas e vejo meu perfil. Saí como ${name}.\n${url}`,
        `Rosa Política — dilemas políticos. Meu perfil: ${name}.\n${url}`,
        `Rosa Política: meu perfil é ${name}.\n${url}`,
      ]
    : [
        `Fiz o Rosa Política: escolho em dilemas e vejo meu perfil. Saí como ${name}.`,
        `Rosa Política — dilemas políticos. Meu perfil: ${name}.`,
        `Rosa Política: meu perfil é ${name}.`,
      ];

  for (const text of candidates) {
    if (text.length <= SHARE_TEXT_MAX_CHARS) return text;
  }

  // Last resort: truncate the profile name so the URL still fits.
  if (url) {
    const prefix = "Rosa Política: meu perfil é ";
    const budget = SHARE_TEXT_MAX_CHARS - prefix.length - 1 - url.length - 1;
    const clipped =
      budget >= 3 ? `${name.slice(0, budget - 1)}…` : name.slice(0, Math.max(budget, 0));
    return `${prefix}${clipped}\n${url}`.slice(0, SHARE_TEXT_MAX_CHARS);
  }

  return candidates[candidates.length - 1].slice(0, SHARE_TEXT_MAX_CHARS);
}
