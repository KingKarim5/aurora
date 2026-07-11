const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("aurora_access_token");
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem("aurora_access_token", access);
  localStorage.setItem("aurora_refresh_token", refresh);
}

export function clearTokens() {
  localStorage.removeItem("aurora_access_token");
  localStorage.removeItem("aurora_refresh_token");
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401 && typeof window !== "undefined") {
    clearTokens();
    window.location.href = "/login";
    throw new ApiError(401, "Session expired");
  }
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      if (typeof body.detail === "string") detail = body.detail;
    } catch {
      // keep statusText
    }
    throw new ApiError(res.status, detail);
  }
  return res.json() as Promise<T>;
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ username: email, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, body?.detail ?? "Login failed");
  }
  const data = await res.json();
  setTokens(data.access_token, data.refresh_token);
}
