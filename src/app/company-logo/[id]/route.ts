import { backendEndpoint } from "@/lib/backend";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-f0-9]{24}$/.test(id)) return new Response(null, { status: 404 });
  try {
    const upstream = await fetch(backendEndpoint(`/api/company-logos/${id}`), { cache: "no-store", signal: AbortSignal.timeout(5000) });
    const type = upstream.headers.get("content-type");
    if (!upstream.ok || (type !== "image/png" && type !== "image/jpeg")) {
      return new Response(null, { status: upstream.status === 404 ? 404 : 502 });
    }
    return new Response(upstream.body, { headers: {
      "Content-Type": type, "Cache-Control": "no-cache", "X-Content-Type-Options": "nosniff",
    } });
  } catch {
    return new Response(null, { status: 502 });
  }
}
