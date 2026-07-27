import {
  createFederation,
  MemoryKvStore,
  Person,
  generateCryptoKeyPair,
  exportJwk,
  importJwk,
} from "@fedify/fedify";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ACTOR_KEY_ALGORITHMS = ["RSASSA-PKCS1-v1_5", "Ed25519"] as const;

// Lädt die gespeicherten Schlüssel eines Nutzers, oder erzeugt und speichert
// sie beim allerersten Zugriff. Danach bleiben sie über Neustarts hinweg
// stabil, weil sie aus der Datenbank statt neu generiert werden.
async function getOrCreateActorKeyPairs(userId: string) {
  const existing = await prisma.actorKey.findMany({ where: { userId } });
  const byAlgorithm = new Map(existing.map((k) => [k.algorithm, k]));

  const pairs = await Promise.all(
    ACTOR_KEY_ALGORITHMS.map(async (algorithm) => {
      const stored = byAlgorithm.get(algorithm);
      if (stored) {
        return {
          privateKey: await importJwk(JSON.parse(stored.privateJwk), "private"),
          publicKey: await importJwk(JSON.parse(stored.publicJwk), "public"),
        };
      }

      const generated = await generateCryptoKeyPair(algorithm);
      await prisma.actorKey.create({
        data: {
          userId,
          algorithm,
          privateJwk: JSON.stringify(await exportJwk(generated.privateKey)),
          publicJwk: JSON.stringify(await exportJwk(generated.publicKey)),
        },
      });
      return generated;
    })
  );

  return pairs;
}

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
  return getOrCreateActorKeyPairs(user.id);
});

federation.setInboxListeners("/users/{identifier}/inbox", "/inbox");
