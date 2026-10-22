export class ApiError extends Error {
  status: number;
  code?: string;
  payload: Record<string, unknown>;

  constructor(message: string, status: number, payload: Record<string, unknown>) {
    super(message);
    this.status = status;
    this.code = typeof payload.code === "string" ? payload.code : undefined;
    this.payload = payload;
  }
}

export async function api<T>(path: string, init?: RequestInit, retry = true): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  if (res.status === 401 && retry && !path.startsWith("/api/auth/")) {
    const refreshed = await fetch("/api/auth/refresh", { method: "POST" });
    if (refreshed.ok) return api<T>(path, init, false);
  }
  const text = await res.text();
  const data = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  if (!res.ok) throw new ApiError(String(data.error || "Request failed"), res.status, data);
  return data as T;
}

export async function downloadExport(format: "csv" | "json" | "notion") {
  const res = await fetch(`/api/export?format=${format}`);
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    throw new ApiError(String(data.error || "Export failed"), res.status, data);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = format === "json" ? "trendpulse-ideas.json" : format === "notion" ? "trendpulse-notion.md" : "trendpulse-ideas.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
