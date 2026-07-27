const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

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
