export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type Topic = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
};

export type Post = {
  id: string;
  content: string;
  createdAt: string;
  author: { username: string; displayName: string | null };
};

export async function getTopics(): Promise<Topic[]> {
  const res = await fetch(`${API_URL}/api/topics`, { cache: "no-store" });
  if (!res.ok) throw new Error("Topics konnten nicht geladen werden");
  return res.json();
}

export async function getTopicPosts(slug: string): Promise<Post[]> {
  const res = await fetch(`${API_URL}/api/topics/${slug}/posts`, { cache: "no-store" });
  if (!res.ok) throw new Error("Beiträge konnten nicht geladen werden");
  return res.json();
}

export type CurrentUser = { id: string; username: string; displayName: string | null };

// "credentials: include" sorgt dafür, dass die Session-Cookie mitgeschickt
// wird – ohne das würde der Server jeden Request wie "nicht angemeldet" sehen.

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const res = await fetch(`${API_URL}/api/auth/me`, { cache: "no-store", credentials: "include" });
  if (!res.ok) return null;
  return res.json();
}

async function postJson(path: string, body: unknown) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Unbekannter Fehler");
  return data;
}

export function login(username: string, password: string) {
  return postJson("/api/auth/login", { username, password });
}

export function register(username: string, password: string, displayName?: string) {
  return postJson("/api/auth/register", { username, password, displayName });
}

export function logout() {
  return postJson("/api/auth/logout", {});
}

export function createPost(slug: string, content: string) {
  return postJson(`/api/topics/${slug}/posts`, { content });
}
