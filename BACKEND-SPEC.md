# Backend API Server — Build Specification

This document is a complete, self-contained spec for a coding agent to build the backend
API server for the **findthepks** frontend from zero. Follow it exactly; the frontend is
already written and expects the exact endpoints, request/response shapes, and behaviors
described below.

## 1. Project Overview

**findthepks** is a shared-calendar web app. A group of users shares one calendar.
Users and groups have a **many-to-many** relationship. Each group owns exactly one
calendar containing:

- **events** — a list of calendar events (title, description, start/end datetime, type, accepted/rejected user names)
- **dateStatus** — per-user, per-date availability status (`full` | `day` | `night`)

The frontend is a Vite + React + TypeScript SPA (deployed to GitHub Pages). It talks to
this API over plain JSON over HTTP. **No authentication is implemented yet** — the
frontend has placeholder Login/Logout buttons with no logic. Do NOT add auth; keep the
API open.

## 2. Tech Stack (required)

| Concern      | Choice                                        |
|--------------|-----------------------------------------------|
| Runtime      | Node.js 24 (active LTS)                       |
| Language     | TypeScript 7 (strict mode)                    |
| Framework    | Express 5                                     |
| ORM          | Prisma 7                                      |
| Database     | PostgreSQL 18                                 |
| Container    | Docker + docker-compose (API + Postgres)      |
| Validation   | zod 4 (request body validation)               |
| Dev tooling  | tsx (dev runner), ESLint optional             |

Version notes (verified against npm registry / release channels, Oct 2026):

- Node.js 24 is the current active LTS line. Prisma 7 requires
  `^20.19 || ^22.12 || >=24.0`, so use Node 24.
- Express 5 is the current stable major (5.3.x).
- TypeScript 7 is the current latest (native compiler). If the toolchain has
  friction with TS 7, fall back to the latest 5.x — but prefer 7.
- Prisma 7: note the generator is now `prisma-client` (ESM) by default; use
  `prisma-client-js` only if you need CJS. The schema in §3.1 uses
  `prisma-client-js` for maximum compatibility — either works.
- zod 4 is the current major (4.6.x).
- PostgreSQL 18 is the latest major release (no LTS concept for PG; 18 is the
  newest stable).

Suggested project layout (create a new folder, e.g. `server/` next to the frontend):

```
server/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── index.ts            # express app entry
│   ├── routes/
│   │   ├── users.ts
│   │   ├── groups.ts
│   │   └── calendars.ts
│   └── lib/
│       └── prisma.ts       # PrismaClient singleton
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── package.json
└── tsconfig.json
```

## 3. Data Model

### 3.1 Prisma schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String    @id @default(cuid())
  name      String
  email     String    @unique
  createdAt DateTime  @default(now())
  groups    GroupMember[]
}

model Group {
  id        String    @id @default(cuid())
  name      String
  createdAt DateTime  @default(now())
  members   GroupMember[]
  calendar  Calendar?
}

model GroupMember {
  groupId String
  userId  String
  group   Group @relation(fields: [groupId], references: [id], onDelete: Cascade)
  user    User  @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@id([groupId, userId])
}

model Calendar {
  groupId  String @id
  group    Group  @relation(fields: [groupId], references: [id], onDelete: Cascade)
  events   Json   @default("[]")
  dateStatus Json @default("{}")
}
```

Notes:

- `Calendar` is a 1:1 child of `Group` (one group shares one calendar). `events` and
  `dateStatus` are stored as JSON columns because the frontend treats them as opaque
  blobs and saves them wholesale (see §4.4). Do NOT normalize events into rows.
- `GroupMember` is the many-to-many join table.
- IDs are `cuid()` strings. The frontend treats IDs as opaque strings.

### 3.2 Frontend TypeScript types (the API must match these exactly)

```ts
interface User {
  id: string;
  name: string;
  email: string;
}

interface Group {
  id: string;
  name: string;
  userIds: string[];   // <-- flattened member user ids (see §4.2)
}

type DayStatus = 'full' | 'day' | 'night';
type DateStatusMap = Record<string, Record<string, DayStatus>>; // [userName][dateKey] = status

interface Event {
  startDateTime: string;   // ISO-ish, e.g. "2026-10-16T10:00:00"
  endDateTime: string;
  title: string;
  description: string;
  type: ['none' | 'custom' | 'full' | 'lunch' | 'dinner'];  // single-element tuple
  accepted: string[];      // user names
  rejected: string[];      // user names
}

interface GroupCalendarData {
  events: Event[];
  dateStatus: DateStatusMap;
}
```

**Important:** `dateStatus` is keyed by **user name** (string), not user id. Store and
return it exactly as the client sends it — do not transform keys.

## 4. API Contract

Base path: `/api`. All request/response bodies are JSON. Content-Type: `application/json`.

### 4.1 Users

#### `GET /api/users`
Returns all users.

- `200` → `User[]`

### 4.2 Groups

#### `GET /api/groups`
Returns all groups, each with its member user ids flattened into `userIds`.

- `200` → `Group[]` where `Group = { id, name, userIds: string[] }`

#### `POST /api/groups`
Creates a group.

- Request: `{ "name": string }` (non-empty, trimmed)
- `201` → the created `Group` (with `userIds: []`)
- `400` → invalid/missing name
- Also creates the group's `Calendar` row (empty `events: []`, `dateStatus: {}`) in the
  same transaction, so `GET /api/groups/:id/calendar` works immediately.

#### `POST /api/groups/:groupId/members`
Adds a user to a group (idempotent — adding an existing member is a no-op success).

- Request: `{ "userId": string }`
- `200` → the updated `Group` (with refreshed `userIds`)
- `404` → group or user not found

### 4.3 Group calendar

#### `GET /api/groups/:groupId/calendar`
Returns the group's calendar data.

- `200` → `GroupCalendarData` = `{ events: Event[], dateStatus: DateStatusMap }`
- `404` → group not found
- If the calendar row somehow doesn't exist, return `{ events: [], dateStatus: {} }`
  (and create it).

#### `PUT /api/groups/:groupId/calendar`
Replaces the group's entire calendar data (full overwrite, not merge).

- Request: `GroupCalendarData` = `{ events: Event[], dateStatus: DateStatusMap }`
- `200` → the saved `GroupCalendarData` (echo back what was stored)
- `404` → group not found
- `400` → body doesn't match the shape (validate with zod: `events` is an array,
  `dateStatus` is an object of objects of `'full'|'day'|'night'`)

### 4.4 Error format

For non-2xx responses return:

```json
{ "error": "human readable message" }
```

The frontend displays `error` verbatim, so keep messages short and readable.

### 4.5 CORS

The frontend is served from a different origin (GitHub Pages in production,
`http://localhost:5173` in dev). Enable CORS for all origins in development. In
production, allow the GitHub Pages origin. Simplest acceptable approach:

```ts
app.use(cors()); // dev
```

## 5. Seed Data

Provide a seed script (`prisma/seed.ts`, wired via `prisma.seed` in package.json) that
creates exactly this data (matching the frontend mock, so behavior is identical):

- Users: `Alice` (`alice@example.com`), `Bob` (`bob@example.com`)
- Groups: `Weekend Hikers` and `Board Game Night`, **both containing both users**
- `Weekend Hikers` calendar: one event —
  - title `Trail hike`, description `Meet at the trailhead, bring water.`
  - `startDateTime`/`endDateTime`: today at 10:00–14:00 (local), type `['custom']`,
    `accepted: ['Alice']`, `rejected: []`
  - `dateStatus`: `{ Alice: {}, Bob: {} }`
- `Board Game Night` calendar: empty (`events: []`, `dateStatus: { Alice: {}, Bob: {} }`)

The seed must be idempotent (upsert by name/email).

## 6. Docker

### 6.1 `docker-compose.yml`

```yaml
services:
  db:
    image: postgres:18
    environment:
      POSTGRES_USER: findthepks
      POSTGRES_PASSWORD: findthepks
      POSTGRES_DB: findthepks
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U findthepks"]
      interval: 5s
      timeout: 5s
      retries: 10

  api:
    build: .
    environment:
      DATABASE_URL: postgresql://findthepks:findthepks@db:5432/findthepks
      PORT: 3000
    ports:
      - "3000:3000"
    depends_on:
      db:
        condition: service_healthy
    command: sh -c "npx prisma migrate deploy && npx prisma db seed && node dist/index.js"

volumes:
  pgdata:
```

### 6.2 `Dockerfile`

Multi-stage: build TypeScript → `dist/`, then a slim runtime image that copies `dist/`,
`node_modules` (production), and `prisma/`. Use `node:24-alpine` for both stages.
The compose `command` runs migrations, seed, and the compiled entrypoint (see above).

## 7. Frontend Integration

The frontend already has a real-API client (`src/api/client.ts`). To switch from mock
to this server, the user sets in the frontend `.env`:

```
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=http://localhost:3000/api
```

(For the GitHub Pages production build, `VITE_API_BASE_URL` must be the public URL of
this API, e.g. `https://your-host/api`.)

The frontend calls exactly these endpoints and nothing else:

| Method | Path                          | Used for                          |
|--------|-------------------------------|-----------------------------------|
| GET    | `/api/users`                  | load users (header profile, etc.) |
| GET    | `/api/groups`                 | group selection page              |
| POST   | `/api/groups`                 | create group (name input)         |
| POST   | `/api/groups/:id/members`     | add creator to new group          |
| GET    | `/api/groups/:id/calendar`    | open a group's calendar           |
| PUT    | `/api/groups/:id/calendar`    | save calendar changes             |

There is **no** `POST /api/users` — user creation was removed from the frontend.

## 8. Definition of Done

1. `docker compose up --build` starts Postgres + API with zero manual steps.
2. Migrations are applied and seed data is loaded automatically on first start.
3. All endpoints in §4 return the exact shapes in §3.2 (verify with curl).
4. `POST /api/groups` returns a group whose calendar is immediately fetchable.
5. `POST /api/groups/:id/members` is idempotent and returns the updated group.
6. `PUT /api/groups/:id/calendar` fully overwrites and echoes the stored data.
7. Invalid bodies return `400` with `{ "error": "..." }`; unknown ids return `404`.
8. Frontend integration check: with `VITE_USE_MOCK_API=false` and
   `VITE_API_BASE_URL=http://localhost:3000/api`, the SPA loads 2 users and 2 groups,
   lets you create a named group, opens the shared calendar, and persists edits across
   page reloads.

## 9. Out of Scope (do not build)

- Authentication / login / logout (frontend buttons are stubs)
- User creation endpoint (removed from frontend)
- Fine-grained event endpoints (the client saves the whole calendar blob)
- Deployment to any cloud provider (local Docker only)
