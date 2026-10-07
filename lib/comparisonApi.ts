import { parseBrowserIdBody, parseEstadoBody, parsePerfilBody } from "@/lib/comparisonModel";
import {
  dropEstado,
  dropPerfil,
  readEstado,
  readPerfil,
  storeEstado,
  storePerfil,
} from "@/lib/comparisonStore";

const MAX_BODY = 4096;

export async function handleComparar(
  method: "GET" | "POST" | "DELETE",
  track: string,
  request: Request,
): Promise<Response> {
  if (track !== "perfil" && track !== "estado") {
    return respond({ available: false }, 404);
  }
  try {
    if (method === "GET") {
      const view = track === "perfil" ? await readPerfil() : await readEstado();
      return respond(view ?? { available: false });
    }
    const json = await readJson(request);
    if (method === "DELETE") {
      const browserId = parseBrowserIdBody(json);
      if (!browserId) return respond({ available: false }, 400);
      const view =
        track === "perfil" ? await dropPerfil(browserId) : await dropEstado(browserId);
      return respond(view ?? { available: false });
    }
    if (track === "perfil") {
      const input = parsePerfilBody(json);
      if (!input) return respond({ available: false }, 400);
      const view = await storePerfil(input);
      return respond(view ?? { available: false });
    }
    const input = parseEstadoBody(json);
    if (!input) return respond({ available: false }, 400);
    const view = await storeEstado(input);
    return respond(view ?? { available: false });
  } catch {
    return respond({ available: false }, 503);
  }
}

async function readJson(request: Request): Promise<unknown> {
  const declared = request.headers.get("content-length");
  if (declared && Number(declared) > MAX_BODY) return null;
  const text = await request.text();
  if (text.length > MAX_BODY) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function respond(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}
