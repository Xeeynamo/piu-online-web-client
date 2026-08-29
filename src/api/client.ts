import type {
  BestIndexEntry,
  Enriched,
  Me,
  PlayerSummary,
  SongChartResponse,
  SongResponse,
} from "./types";

// ApiError carries the HTTP status so callers can distinguish 401 (not
// logged in) from 403 (card not linked) from 404 (unknown card/song).
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// API origin baked in at build time from the PIU_WEB_SERVER variable. When set
// (production build), requests go to that host; when empty (local dev), they use
// the relative "/api" path proxied by the dev server. Any trailing slash was
// stripped in vite.config.ts.
const API_BASE = __PIU_WEB_SERVER__;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(API_BASE + "/api" + path, {
    credentials: "include",
    headers: init?.body ? { "Content-Type": "application/json" } : undefined,
    ...init,
  });
  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // response body wasn't JSON; fall back to statusText
    }
    throw new ApiError(res.status, message);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  authGoogle: (idToken: string) =>
    request<{ sub: string }>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ id_token: idToken }),
    }),

  logout: () => request<void>("/auth/logout", { method: "POST" }),

  me: () => request<Me>("/me"),

  linkCard: (key: string) =>
    request<{ sub: string; email: string; cards: string[] }>("/cards", {
      method: "POST",
      body: JSON.stringify({ key }),
    }),

  unlinkCard: (cardId: string) =>
    request<{ sub: string; email: string; cards: string[] }>(`/cards/${encodeURIComponent(cardId)}`, {
      method: "DELETE",
    }),

  summary: (card: string) => request<PlayerSummary>(`/player/${card}/summary`),

  setPlayerName: (card: string, playerName: string) =>
    request<{ player_name: string }>(`/player/${card}/name`, {
      method: "PUT",
      body: JSON.stringify({ player_name: playerName }),
    }),

  recent: (card: string, opts?: { limit?: number; before?: number }) => {
    const params = new URLSearchParams();
    if (opts?.limit) params.set("limit", String(opts.limit));
    if (opts?.before) params.set("before", String(opts.before));
    const qs = params.toString();
    return request<Enriched[]>(`/player/${card}/recent${qs ? "?" + qs : ""}`);
  },

  bestIndex: (card: string) => request<BestIndexEntry[]>(`/player/${card}/best`),

  bestAtDifficulty: (card: string, mode: string, diff: number) =>
    request<Enriched[]>(`/player/${card}/best/${mode}/${diff}`),

  bestByGrade: (card: string, grade: string) =>
    request<Enriched[]>(`/player/${card}/best/by-grade/${encodeURIComponent(grade)}`),

  bestByPlate: (card: string, plate: string) =>
    request<Enriched[]>(`/player/${card}/best/by-plate/${encodeURIComponent(plate)}`),

  song: (card: string, songId: string) => request<SongResponse>(`/player/${card}/song/${songId}`),

  songChart: (card: string, songId: string, mode: string, diff: number) =>
    request<SongChartResponse>(`/player/${card}/song/${songId}/${mode}/${diff}`),
};
