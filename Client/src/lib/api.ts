const API_PREFIX = "/api/v1";
const BASE_URL = (import.meta.env.VITE_API_URL as string) || "http://127.0.0.1:5000";

function buildUrl(path: string) {
  // ensure path starts with /
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_URL}${API_PREFIX}${p}`;
}

interface StoredToken {
  token: string;
  expiresAt: number; // timestamp
}

function getToken(): string | null {
  const stored = localStorage.getItem("auth");
  if (!stored) return null;
  
  try {
    const { token, expiresAt } = JSON.parse(stored) as StoredToken;
    // Return null if token is expired
    if (Date.now() >= expiresAt) {
      clearToken();
      return null;
    }
    return token;
  } catch (e) {
    clearToken();
    return null;
  }
}

function setToken(token: string) {
  // JWT tokens are base64url encoded segments joined by dots
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error("Invalid JWT token format");
  }

  try {
    // Decode the payload (middle segment) to get exp
    const payload = JSON.parse(atob(parts[1]));
    const expiresAt = payload.exp * 1000; // convert to milliseconds

    // Store token with expiry
    localStorage.setItem("auth", JSON.stringify({
      token,
      expiresAt
    }));
  } catch (e) {
    console.error("Error parsing JWT:", e);
    throw new Error("Invalid token format");
  }
}

function clearToken() {
  localStorage.removeItem("auth");
}

let globalLogoutCallback: (() => void) | null = null;

export function setLogoutCallback(cb: () => void) {
  globalLogoutCallback = cb;
}

async function request(path: string, options: RequestInit = {}) {
  const url = buildUrl(path);
  const headers: Record<string, string> = {};

  // copy headers passed in
  if (options.headers) {
    try {
      Object.assign(headers, options.headers as Record<string, string>);
    } catch (e) {}
  }

  const token = getToken();
  // Clear token and trigger logout if expired
  if (!token && globalLogoutCallback && path !== '/auth/signin') {
    globalLogoutCallback();
    throw new Error('Session expired. Please log in again.');
  }
  
//   if (token) headers["Authorization"] = `Bearer ${token}`;
if (token) headers["authorization"] = token;

  // If body is not FormData, set JSON header and stringify
  if (options.body && !(options.body instanceof FormData)) {
    if (!headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }
    if (typeof options.body === "object") {
      options.body = JSON.stringify(options.body);
    }
  }

  const res = await fetch(url, { ...options, headers });
  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    data = text;
  }

  // Handle auth errors
  if (res.status === 401 || res.status === 403) {
    clearToken();
    if (globalLogoutCallback) {
      globalLogoutCallback();
    }
    throw new Error(data?.error || 'Session expired. Please log in again.');
  }

  if (!res.ok) {
    const message = (data && (data.error || data.message)) || res.statusText || "Request failed";
    const err: any = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

const auth = {
  signup: async (payload: { [k: string]: any }) => {
    return await request(`/auth/signup`, { method: "POST", body: payload });
  },
  signin: async (payload: { email: string; password: string }) => {
    const res = await request(`/auth/signin`, { method: "POST", body: payload });
    // server returns { data: { accessToken }, message }
    const token = res?.data?.accessToken || res?.accessToken || null;
    if (token) setToken(token);
    return res;
  },
  signout: () => {
    clearToken();
  },
};

const user = {
  create: (payload: any) => request(`/user`, { method: "POST", body: payload }),
  list: (params: Record<string, any> = {}) => {
    const qs = new URLSearchParams(params as any).toString();
    return request(`/user${qs ? `?${qs}` : ""}`);
  },
  get: (id: string) => request(`/user/${id}`),
  update: (id: string, payload: any) => request(`/user/${id}`, { method: "PUT", body: payload }),
  delete: (id: string) => request(`/user/${id}`, { method: "DELETE" }),
};

const ticket = {
  create: (payload: any) => request(`/ticket`, { method: "POST", body: payload }),
  list: () => request(`/ticket`),
};

const report = {
  list: (params: Record<string, any> = {}) => {
    const qs = new URLSearchParams(params as any).toString();
    return request(`/reports${qs ? `?${qs}` : ""}`);
  },
  get: (id: string) => request(`/reports/${id}`),
  create: (payload: any) => request(`/reports`, { method: "POST", body: payload }),
  uploadPdf: async (form: FormData) => {
    // form must include the file under key 'pdf' and other required fields
    return request(`/reports/upload`, { method: "POST", body: form });
  },
};

const family = {
  list: () => request(`/family`),
  get: (id: string) => request(`/family/${id}`),
  create: (payload: { name: string; relation: string; color: string }) =>
    request(`/family`, { method: "POST", body: payload }),
  update: (id: string, payload: { name?: string; relation?: string; color?: string }) =>
    request(`/family/${id}`, { method: "PUT", body: payload }),
  delete: (id: string) => request(`/family/${id}`, { method: "DELETE" }),
};

const api = {
  auth,
  user,
  ticket,
  report,
  family,
  helpers: { getToken, setToken, clearToken, buildUrl },
  setLogoutCallback,
};

export type Api = typeof api;
export default api;
