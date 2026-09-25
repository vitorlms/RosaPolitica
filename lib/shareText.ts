import {
  AXIS_IDS,
  AXIS_LABELS,
  type AxisId,
  type ScoreResult,
} from "@/lib/types";

function bar(value: number, width = 10): string {
  const filled = Math.round((value / 100) * width);
  return "█".repeat(filled) + "░".repeat(width - filled);
}

function leanLabel(axis: AxisId, position: number): string {
  const meta = AXIS_LABELS[axis];
  if (position <= 40) return meta.low;
  if (position >= 60) return meta.high;
  return "equilíbrio entre os polos";
}

/** Plain-text card optimized for WhatsApp / Telegram paste. */
export function formatShareText(result: ScoreResult, siteUrl?: string): string {
  const essential = result.rankedByEssentiality
    .filter((axis) => result.profiles[axis].tier === "essential")
    .slice(0, 4);
  const peripheral = result.rankedByEssentiality
    .filter((axis) => result.profiles[axis].tier === "peripheral")
    .slice(0, 3);

  const lines: string[] = [
    "🌹 Rosa Política — meu resultado em Valmora",
    "",
    `Arquétipo: ${result.archetype.name}`,
    result.archetype.description,
    "",
  ];

  if (essential.length > 0) {
    lines.push("Núcleo essencial (quase inegociável):");
    for (const axis of essential) {
      const p = result.profiles[axis];
      lines.push(
        `• ${AXIS_LABELS[axis].name} — essencialidade ${p.essentiality}`,
      );
    }
    lines.push("");
  }

  if (peripheral.length > 0) {
    lines.push("Zona limítrofe (mais negociável):");
    for (const axis of peripheral) {
      const p = result.profiles[axis];
      lines.push(
        `• ${AXIS_LABELS[axis].name} — essencialidade ${p.essentiality}`,
      );
    }
    lines.push("");
  }

  lines.push("Eixos (0–100):");
  for (const axis of AXIS_IDS) {
    const p = result.profiles[axis];
    const name = AXIS_LABELS[axis].name.padEnd(12, " ");
    lines.push(
      `${name} ${bar(p.position)} ${String(p.position).padStart(3, " ")}  (${leanLabel(axis, p.position)})`,
    );
  }

  lines.push("");
  lines.push("Não há resposta certa — só o mapa das minhas escolhas em Valmora.");
  if (siteUrl) {
    lines.push(`Teste: ${siteUrl}`);
  }

  return lines.join("\n");
}
