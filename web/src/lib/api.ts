// Same-origin by default: Cloudflare Pages Functions in production, the Go
// server locally. Set NEXT_PUBLIC_API_BASE to point `next dev` at either.
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

export type LeadInput = { name: string; email: string; company?: string; message?: string };

export async function createLead(lead: LeadInput): Promise<string> {
  const res = await fetch(`${API_BASE}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lead),
  });
  const body = (await res.json().catch(() => ({}))) as { id?: string; error?: string };
  if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`);
  return body.id ?? "";
}
