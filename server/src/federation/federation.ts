import { createFederation, MemoryKvStore, Person, generateCryptoKeyPair } from "@fedify/fedify";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// MemoryKvStore reicht für die lokale Entwicklung; für Produktion durch einen
// persistenten KV-Store (z.B. Redis/Postgres-Adapter) ersetzen.
export const federation = createFederation<void>({
  kv: new MemoryKvStore(),
});

// Ein User dieser Instanz wird nach außen als ActivityPub "Person"-Actor sichtbar.
federation.setActorDispatcher("/users/{identifier}", async (ctx, identifier) => {
  const user = await prisma.user.findUnique({ where: { username: identifier } });
  if (!user) return null;

  const keys = await ctx.getActorKeyPairs(identifier);

  return new Person({
    id: ctx.getActorUri(identifier),
    preferredUsername: identifier,
    name: user.displayName ?? user.username,
    summary: user.bio ?? undefined,
    inbox: ctx.getInboxUri(identifier),
    outbox: ctx.getOutboxUri(identifier),
    publicKey: keys[0].cryptographicKey,
    assertionMethods: keys.map((k) => k.multikey),
  });
}).setKeyPairsDispatcher(async (_ctx, identifier) => {
  const user = await prisma.user.findUnique({ where: { username: identifier } });
  if (!user) return [];
  // Schlüssel werden hier bewusst noch nicht persistiert (siehe TODO unten) –
  // für eine echte Instanz müssen sie pro Actor einmalig erzeugt und in der DB
  // gespeichert werden, sonst ändert sich die Identität bei jedem Neustart.
  const pair = await generateCryptoKeyPair();
  return [pair];
});

federation.setInboxListeners("/users/{identifier}/inbox", "/inbox");
