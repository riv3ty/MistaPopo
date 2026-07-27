import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Legt eine Handvoll Beispiel-Topics und einen Test-Nutzer mit ein paar
// Beiträgen an, damit das Frontend beim ersten Start nicht leer ist.
// Passwort des Test-Nutzers: "test1234" (nur für die lokale Entwicklung!).
async function main() {
  const topics = await Promise.all(
    [
      { slug: "homelab", name: "Homelab", description: "Server, Virtualisierung, Storage im eigenen Netz" },
      { slug: "3d-druck", name: "3D-Druck", description: "Drucker, Materialien, Modelle" },
      { slug: "netzwerktechnik", name: "Netzwerktechnik", description: "Switches, Routing, VLANs, WLAN" },
    ].map((topic) =>
      prisma.topic.upsert({ where: { slug: topic.slug }, update: {}, create: topic })
    )
  );

  const passwordHash = await bcrypt.hash("test1234", 10);
  const user = await prisma.user.upsert({
    where: { username: "testuser" },
    update: {},
    create: {
      username: "testuser",
      displayName: "Test User",
      bio: "Nur zum Testen des Frontends.",
      passwordHash,
    },
  });

  const homelab = topics.find((t) => t.slug === "homelab")!;
  await prisma.post.createMany({
    data: [
      {
        content: "Mein erster Proxmox-Cluster läuft endlich stabil mit 3 Nodes.",
        topicId: homelab.id,
        authorId: user.id,
      },
      {
        content: "Tipp: UPS mit NUT überwachen, bevor der nächste Stromausfall den Ceph-Cluster killt.",
        topicId: homelab.id,
        authorId: user.id,
      },
    ],
  });

  console.log("Seed abgeschlossen.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
