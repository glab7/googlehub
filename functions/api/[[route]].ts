// Cloudflare Pages Function serving the Orbita API at the edge:
//   GET  /api/apps?category=&q=   app catalog
//   GET  /api/plans               pricing plans
//   POST /api/contact             saves a lead to Firebase Firestore
// It mirrors server/main.go and reads the same web/public/data/catalog.json.

import catalog from "../../web/public/data/catalog.json";

interface Env {
  FIREBASE_PROJECT_ID: string;
  FIREBASE_API_KEY?: string;
}

interface LeadInput {
  name?: unknown;
  email?: unknown;
  company?: unknown;
  message?: unknown;
}

// Limits mirror firestore.rules.
const LIMITS = { name: 120, email: 200, company: 120, message: 2000 } as const;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const json = (data: unknown, status = 200, headers: Record<string, string> = {}): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS, ...headers },
  });

const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

function listApps(url: URL): Response {
  const category = url.searchParams.get("category") ?? "";
  const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();
  const apps = catalog.apps.filter(
    (a) =>
      (!category || category === "All" || a.category === category) &&
      (!q || `${a.name} ${a.tagline}`.toLowerCase().includes(q)),
  );
  return json({ categories: catalog.categories, apps }, 200, { "Cache-Control": "public, max-age=300" });
}

async function createLead(request: Request, env: Env): Promise<Response> {
  let input: LeadInput;
  try {
    input = (await request.json()) as LeadInput;
  } catch {
    return json({ error: "invalid JSON body" }, 400);
  }

  const lead = {
    name: str(input.name),
    email: str(input.email),
    company: str(input.company),
    message: str(input.message),
  };
  if (!lead.name || lead.name.length > LIMITS.name) return json({ error: "name is required" }, 422);
  if (lead.email.length > LIMITS.email || !EMAIL_RE.test(lead.email))
    return json({ error: "a valid email is required" }, 422);
  if (lead.company.length > LIMITS.company || lead.message.length > LIMITS.message)
    return json({ error: "company or message is too long" }, 422);

  const s = (v: string) => ({ stringValue: v });
  const doc = {
    fields: {
      name: s(lead.name),
      email: s(lead.email),
      company: s(lead.company),
      message: s(lead.message),
      source: s("cloudflare"),
      createdAt: { timestampValue: new Date().toISOString() },
    },
  };

  let endpoint = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
    env.FIREBASE_PROJECT_ID,
  )}/databases/(default)/documents/leads`;
  if (env.FIREBASE_API_KEY) endpoint += `?key=${encodeURIComponent(env.FIREBASE_API_KEY)}`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(doc),
  });
  if (!res.ok) {
    console.error("firestore", res.status, await res.text());
    return json({ error: "could not save your request, please try again" }, 502);
  }
  const created = (await res.json()) as { name: string };
  return json({ ok: true, id: created.name.split("/").pop() }, 201);
}

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const route = url.pathname.replace(/^\/api\/?/, "").replace(/\/$/, "");

  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

  switch (`${request.method} ${route}`) {
    case "GET apps":
      return listApps(url);
    case "GET plans":
      return json(catalog.plans, 200, { "Cache-Control": "public, max-age=300" });
    case "POST contact":
      return createLead(request, env);
    default:
      return json({ error: "not found" }, 404);
  }
};
