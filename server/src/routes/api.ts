import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";

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
