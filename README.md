# dontroot.de

Ein sicheres, dezentrales soziales Netzwerk für IT-Menschen – mit Fokus auf
Themen wie Homelabbing, 3D-Druck und Netzwerkinfrastruktur.

> Arbeitstitel/Domain: **dontroot.de** – Repository-Umbenennung folgt noch.

## Idee

Statt einer einzelnen zentralen Plattform betreiben Communities eigene
Instanzen, die über ein offenes Protokoll miteinander vernetzt sind
([ActivityPub](https://www.w3.org/TR/activitypub/), wie bei Mastodon oder
Lemmy). Niemand besitzt das ganze Netzwerk, Nutzer können jederzeit die
Instanz wechseln, und andere Fediverse-Software (Mastodon, Lemmy, …) kann
mit dontroot.de interagieren.

## Architekturentscheidungen

- **Föderation statt reines P2P**: ActivityPub-Server ("Instanzen"), die
  sich gegenseitig Inhalte zuschicken. Guter Kompromiss aus Dezentralität
  und Praktikabilität, vorhandenes Ökosystem an Clients/Bibliotheken.
- **Themen-/Community-zentriert**: Inhalte werden Topics zugeordnet
  (initial: Homelab, 3D-Druck, Netzwerktechnik), ähnlich Lemmy-Communities
  statt einem reinen Mastodon-Feed.
- **Stack**: Node.js + TypeScript, [Fedify](https://fedify.dev) als
  ActivityPub-Framework, PostgreSQL + Prisma als Datenschicht.

## Projektstruktur

```
server/            ActivityPub-Server (Federation, API, Datenmodell)
  src/
    federation/    ActivityPub-Actor, Inbox/Outbox, Webfinger
    routes/        HTTP-API für Client-Zugriffe
    db/            Prisma-Schema & Client
web/                Frontend – die Webseite, die man im Browser sieht
  app/              Seiten (Startseite mit Topic-Liste, Topic-Detailseite)
  lib/api.ts        Ruft Daten vom Backend-Server ab
docker-compose.yml  Lokale Postgres-Instanz für die Entwicklung
```

## Lokale Entwicklung

Backend (muss laufen, damit das Frontend Daten anzeigen kann):

```bash
cd server
cp .env.example .env
npm install
docker compose -f ../docker-compose.yml up -d   # startet die Datenbank
npm run prisma:migrate                            # legt die Tabellen an
npm run db:seed                                   # legt Beispiel-Topics/-Beiträge an
npm run dev                                       # Server läuft auf Port 8000
```

`npm run prisma:migrate` führt den Seed übrigens automatisch mit aus; `npm run db:seed`
ist nur nötig, wenn du ihn danach nochmal separat anstoßen willst.

Frontend (in einem zweiten Terminal):

```bash
cd web
cp .env.example .env
npm install
npm run dev   # Webseite läuft auf http://localhost:3000
```

Der Seed-Befehl legt einen Testnutzer an: Benutzername `testuser`, Passwort
`test1234` (nur für die lokale Entwicklung, niemals für echten Betrieb).

## Status

Frühes Grundgerüst. Noch offen: Auth/Signaturen für Föderation, Moderation,
Frontend, Sicherheitskonzept (siehe "sicher" im Projektziel).
