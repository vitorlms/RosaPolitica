import type { ScoreResult } from "@/lib/types";

/** Plain-text card optimized for WhatsApp / Telegram paste. */
export function formatShareText(result: ScoreResult, siteUrl?: string): string {
  const lines: string[] = [
    "Rosa Política — meu resultado",
    "",
    result.archetype.name,
  ];

  if (siteUrl) {
    lines.push("");
    lines.push(`Teste: ${siteUrl}`);
  }

  return lines.join("\n");
}
