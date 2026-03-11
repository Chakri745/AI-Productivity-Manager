const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`API ${path} failed: ${res.statusText}`);
  }
  return res.json();
}

export async function getEvents() {
  return fetchJson<{ events: any[] }>("/api/events");
}

export async function createTask(title: string) {
  const res = await fetch(`${API_BASE}/api/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error("Failed to create task");
  return res.json();
}

export async function updateEvent(id: string, updates: any) {
  const res = await fetch(`${API_BASE}/api/events/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to update event");
  return res.json();
}

export async function getAuthStatus() {
  return fetchJson<{ authenticated: boolean }>("/api/auth/status");
}

export async function getContexts() {
  return fetchJson<{ contexts: any[] }>("/api/contexts");
}

export async function getRecommendation() {
  return fetchJson<{
    recommendation: string;
    reason: string;
    signals: any;
  }>("/api/recommendation");
}

export async function getInsights() {
  return fetchJson("/api/insights");
}

export async function getCriticalAnalysis() {
  return fetchJson<{
    criticalItems: any[];
    contextGroups: any[];
    executiveSummary: string;
  }>("/api/analysis");
}

export async function chatWithBot(message: string, history: any[]) {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });
  if (!res.ok) throw new Error("Chat failed");
  return res.json();
}
