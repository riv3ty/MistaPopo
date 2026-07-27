import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { federation as federationMiddleware } from "@fedify/hono";
import { federation } from "./federation/federation.js";
import { api } from "./routes/api.js";
import { auth } from "./routes/auth.js";

const app = new Hono();

// Erlaubt dem Frontend (läuft auf einem anderen Port), sich mit Session-Cookie
// anzumelden. Nur für die lokale Entwicklung so offen konfiguriert – für den
// echten Betrieb muss WEB_ORIGIN auf die tatsächliche Frontend-Domain zeigen.
app.use(
  "/api/*",
  cors({
    origin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
    credentials: true,
  })
);

// Bindet ActivityPub-Endpunkte (Webfinger, Actor, Inbox, ...) in den Hono-Server ein.
app.use(federationMiddleware(federation, () => undefined));

app.route("/api", api);
app.route("/api/auth", auth);

app.get("/health", (c) => c.json({ status: "ok" }));

const port = Number(process.env.PORT ?? 8000);
serve({ fetch: app.fetch, port });
console.log(`dontroot server läuft auf http://localhost:${port}`);
