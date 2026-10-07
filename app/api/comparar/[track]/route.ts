import { handleComparar } from "@/lib/comparisonApi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ track: string }> },
) {
  const { track } = await context.params;
  return handleComparar("GET", track, request);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ track: string }> },
) {
  const { track } = await context.params;
  return handleComparar("POST", track, request);
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ track: string }> },
) {
  const { track } = await context.params;
  return handleComparar("DELETE", track, request);
}
