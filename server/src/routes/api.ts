import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import { getSessionUser } from "./auth.js";

const prisma = new PrismaClient();

export const api = new Hono();

api.get("/topics", async (c) => {
  const topics = await prisma.topic.findMany({ orderBy: { name: "asc" } });
  return c.json(topics);
});

api.get("/topics/:slug/posts", async (c) => {
  const slug = c.req.param("slug");
  const topic = await prisma.topic.findUnique({ where: { slug } });
  if (!topic) return c.json({ error: "Topic nicht gefunden" }, 404);

  const posts = await prisma.post.findMany({
    where: { topicId: topic.id },
    orderBy: { createdAt: "desc" },
    include: { author: { select: { username: true, displayName: true } } },
  });
  return c.json(posts);
});

api.post("/topics/:slug/posts", async (c) => {
  const user = await getSessionUser(c);
  if (!user) return c.json({ error: "Nicht angemeldet." }, 401);

  const slug = c.req.param("slug");
  const topic = await prisma.topic.findUnique({ where: { slug } });
  if (!topic) return c.json({ error: "Topic nicht gefunden" }, 404);

  const body = await c.req.json<{ content?: string }>();
  const content = body.content?.trim();
  if (!content) return c.json({ error: "Beitrag darf nicht leer sein." }, 400);

  const post = await prisma.post.create({
    data: { content, topicId: topic.id, authorId: user.id },
    include: { author: { select: { username: true, displayName: true } } },
  });

  return c.json(post, 201);
});
