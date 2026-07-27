import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { federation as federationMiddleware } from "@fedify/hono";
import { federation } from "./federation/federation.js";
import { api } from "./routes/api.js";

const app = new Hono();

// Bindet ActivityPub-Endpunkte (Webfinger, Actor, Inbox, ...) in den Hono-Server ein.
app.use(federationMiddleware(federation, () => undefined));

app.route("/api", api);

app.get("/health", (c) => c.json({ status: "ok" }));

const port = Number(process.env.PORT ?? 8000);
serve({ fetch: app.fetch, port });
console.log(`dontroot server läuft auf http://localhost:${port}`);
