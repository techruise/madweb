import "server-only";
import { env } from "@/lib/env";
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const expected = new Set([
    new URL(env.NEXT_PUBLIC_SITE_URL).origin,
    new URL(request.url).origin,
  ]);
  return expected.has(origin);
}
export async function boundedJson(
  request: Request,
  maxBytes = 12000,
): Promise<unknown> {
  const type = request.headers.get("content-type") ?? "";
  if (!type.startsWith("application/json")) throw new Error("Invalid body");
  if (Number(request.headers.get("content-length") ?? 0) > maxBytes)
    throw new Error("Body too large");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Missing body");
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        throw new Error("Body too large");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(bytes));
}
