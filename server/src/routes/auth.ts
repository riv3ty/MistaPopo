import { Hono, type Context } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SESSION_COOKIE = "dontroot_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 Tage

// Liest die Session-Cookie aus und gibt den zugehörigen Nutzer zurück
// (oder null, falls nicht angemeldet / Session abgelaufen). Wird auch von
// anderen Routen (z.B. Beitrag erstellen) zur Anmeldeprüfung verwendet.
export async function getSessionUser(c: Context) {
  const sessionId = getCookie(c, SESSION_COOKIE);
  if (!sessionId) return null;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date()) return null;
  return session.user;
}

export const auth = new Hono();

auth.post("/register", async (c) => {
  const body = await c.req.json<{ username?: string; password?: string; displayName?: string }>();
  const username = body.username?.trim();
  const password = body.password;

  if (!username || !password || password.length < 8) {
    return c.json(
      { error: "Benutzername erforderlich, Passwort muss mindestens 8 Zeichen haben." },
      400
    );
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return c.json({ error: "Benutzername bereits vergeben." }, 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { username, passwordHash, displayName: body.displayName?.trim() || undefined },
  });

  await startSession(c, user.id);
  return c.json({ id: user.id, username: user.username });
});

auth.post("/login", async (c) => {
  const body = await c.req.json<{ username?: string; password?: string }>();
  const username = body.username?.trim();
  const password = body.password;

  if (!username || !password) {
    return c.json({ error: "Benutzername und Passwort erforderlich." }, 400);
  }

  const user = await prisma.user.findUnique({ where: { username } });
  // Bewusst dieselbe Fehlermeldung wie bei unbekanntem Benutzernamen, damit
  // man von außen nicht erkennen kann, ob ein Benutzername existiert.
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return c.json({ error: "Benutzername oder Passwort falsch." }, 401);
  }

  await startSession(c, user.id);
  return c.json({ id: user.id, username: user.username });
});

auth.post("/logout", async (c) => {
  const sessionId = getCookie(c, SESSION_COOKIE);
  if (sessionId) {
    await prisma.session.deleteMany({ where: { id: sessionId } });
  }
  deleteCookie(c, SESSION_COOKIE, { path: "/" });
  return c.json({ ok: true });
});

auth.get("/me", async (c) => {
  const user = await getSessionUser(c);
  if (!user) return c.json({ error: "Nicht angemeldet." }, 401);
  return c.json({ id: user.id, username: user.username, displayName: user.displayName });
});

async function startSession(c: Context, userId: string) {
  const session = await prisma.session.create({
    data: { userId, expiresAt: new Date(Date.now() + SESSION_TTL_MS) },
  });

  setCookie(c, SESSION_COOKIE, session.id, {
    httpOnly: true,
    sameSite: "Lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}
