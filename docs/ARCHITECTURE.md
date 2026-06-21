# Architecture

Flixr is a three-surface system around a single **Backend-for-Frontend (BFF)**. The BFF
is the only thing that talks to TMDB and MongoDB; the web and mobile clients only ever
talk to the BFF.

## System map

```
                        ┌──────────────────────────────────────────┐
                        │            TMDB REST API (v3)              │
                        │      api.themoviedb.org/3  (api_key)       │
                        └───────────────────▲────────────────────────┘
                                            │ axios (20s timeout, adult=false)
                                            │ key injected server-side, never exposed
                ┌───────────────────────────┴────────────────────────────┐
                │                  backend/  (BFF)                         │
                │  Express 5 · TypeScript (strict) · ~27 files             │
                │                                                          │
                │  routes ─▶ controllers ─▶ ┌── TMDBClient (read-through)  │
                │                           │     Redis cache (ioredis)    │
                │                           └── Mongoose models (MongoDB)  │
                │                                                          │
                │  Cross-cutting: helmet · CORS · express-rate-limit       │
                │                 JWT (HS256) · bcrypt · Joi · asyncHandler │
                └───────▲───────────────────────────────▲──────────────────┘
                        │  /api/* (JSON, Bearer token)   │
        NEXT_PUBLIC_API_URL                       hardcoded LAN IP ⚠
                        │                               │
        ┌───────────────┴───────────┐     ┌────────────┴───────────────┐
        │      frontend/ (web)       │     │      flixr/ (mobile)        │
        │  Next.js 16 App Router     │     │  Expo ~54 · RN 0.81         │
        │  React 19 · RSC-first      │     │  expo-router · reanimated   │
        │  Redux (auth) · Radix · TW │     │  3 real screens, 2 stubs    │
        │  ~128 files                │     │  no auth, no state          │
        └────────────────────────────┘     └─────────────────────────────┘
```

## Backend (the BFF) — `backend/src`

**Role:** Express 5 + TypeScript service that proxies TMDB behind a Redis read-through
cache and layers on JWT auth plus a MongoDB-backed community model (users, reviews,
threaded comments).

**Request lifecycle** (`app.ts`):
`helmet` → `express.json()` → permissive `cors({origin:true, credentials:true})` →
global `rateLimit` (120 req / 60s, app-wide) → console request logger → feature routers
under `/api/*` → centralized `errorHandler` (mounted last).

**TMDB read path** (`services/tmdbClient.ts`):
controller → `tmdbClient.raw(path, params, ttl)` → `getCached(key, fetcher, ttl)` →
`redisClient.get` → on miss, `axios.get` TMDB (injects `api_key`, `adult:false`) →
`setex(key, ttl, json)` → return. The `api_key` is correctly **excluded** from the
cache key. Slow-changing data (trending, genres) uses a 12h TTL.

**Composite endpoints** (`controllers/common.controller.ts`):
`/api/common/homepage` fans out **12** TMDB calls with `Promise.allSettled` (so one
upstream failure can't sink the page); `/api/common/trending` fans out 4; `getGenres` 2.

**Auth & writes:** `middleware/auth.ts` verifies the `Bearer` JWT, loads the user
(`select('-password')`), attaches `req.user`. All write routes (`POST/PUT/DELETE` on
`/reviews`, `/comments`) are auth-gated with **ownership checks** comparing
`req.user._id` to the document's `user` — this part is done correctly.

### Module inventory

| Module | File | Role |
|---|---|---|
| App wiring | `app.ts` | Middleware stack, route mounting, DB/Redis bootstrap |
| Entry | `server.ts` | `dotenv.config()` + `app.listen` |
| TMDB client | `services/tmdbClient.ts` | Declarative `TMDB_ROUTES` map + read-through cache + `raw()` |
| Cache | `cache/redisClient.ts` | ioredis singleton |
| Auth | `controllers/auth.controller.ts`, `middleware/auth.ts` | register/login (bcrypt 10, JWT), bearer verify |
| Community | `controllers/{review,comment}.controller.ts`, `models/{Review,Comment}.ts` | CRUD + soft-delete + threaded comments |
| Catalog | `controllers/{movie,tv,people,company,common}.controller.ts` | TMDB passthrough + aggregation |
| Discover | `utils/discoverParams.ts` | **Allowlist** of permitted TMDB discover params |
| Errors | `utils/{asyncHandler,error_handler}.ts` | Promise wrapper + global error middleware |

### Genuinely well-built (the strengths)

- **Read-through cache abstraction** — `getCached()` centralizes get/miss/`setex` with
  per-call TTL overrides; the `TMDB_ROUTES` map is a clean declarative endpoint registry.
- **Resilient aggregation** — `Promise.allSettled` fan-out on the homepage/trending/genre
  endpoints means a single TMDB hiccup degrades gracefully instead of 500-ing the page.
- **Security baseline wired from day one** — helmet, CORS, rate-limit, bcrypt, JWT
  expiry, and Joi validation on every write path; ObjectId casting + Joi enums neutralize
  classic NoSQL injection.
- **Defensive discover params** — `discoverParams.ts` allowlists query keys instead of
  forwarding arbitrary input to TMDB. This is a senior instinct.
- **Correct authorization** — ownership is enforced on review/comment edit & delete.
- **Sensible indexing instinct** — `Comment.ts` ships a compound index
  `{tmdbId, mediaType, parent, createdAt}` (which makes the *missing* `Review` index a
  focus slip, not a knowledge gap).

## Web frontend — `frontend/`

**Role:** Next.js 16 App Router client (package name `tmdb-frontend`, product brand
"Flixr"). RSC-first: most reads happen in async Server Components that fetch the BFF and
pass plain props to client presentation components.

**Data flow:** Two parallel, unshared data-access styles coexist — `app/page.tsx` and
`company/[id]` use an axios `serverApi` (`lib/api.ts → createServerApi`), while every
other page hand-rolls native `fetch`. The typed `lib/apiClient.ts` (`moviesApi`/`tvApi`
helpers) is **essentially unused dead code**.

**State:** A single Redux Toolkit `authSlice` holding `{token, user}`, persisted to
`localStorage['tmdb_auth_v1']`, attached via an axios request interceptor that reads
`store.getState().auth.token`.

**Notable structural facts** (see [AUDIT.md](./AUDIT.md) for severity):
- `next.config.mjs` sets `typescript.ignoreBuildErrors: true` (defeats `strict: true`)
  and `images.unoptimized: true` (neutralizes every `next/image`).
- The community components (`review-composer.tsx`, `comments.tsx`) exist but are
  imported by **no page** — detail pages render TMDB's *native* reviews instead.

## Mobile — `flixr/`

**Role:** Expo Router prototype scaffolded from the default Expo template, partially
wired to the same BFF. Three screens have real content (Home hero carousel + grids,
movie detail, TV detail); **Explore and Profile are still template/stub placeholders**.

**Data flow:** `services/{index,apiClient,common.service}.ts` + `lib/interfaces.ts` are
near-verbatim copies of the web app's equivalents. The API base URL is a **hardcoded
developer LAN IP** (`http://192.168.81.126:4000`) over plain HTTP with no env config.
There is **no state management and no functioning auth** — `authApi` exists but is never
called; there's no token storage or attach-token interceptor.

## The seams that matter

The architecture's weak points are all at the **boundaries between these three apps**:

1. **No shared package.** Three independent `package.json`s, no root workspace, no
   `packages/`. The clients therefore **copy-paste** their entire contract layer:
   `interfaces.ts` (~220 identical lines), the `*Api` wrappers (~90% identical), and
   `ROUTES`. They have already drifted.
2. **Envelope drift.** The backend returns `{movie, reviews}` for movies but
   `{show, reviews}` for TV; `getReviewsForTmdb` returns a bare array; `search` returns
   raw TMDB; `homepage`/`trending` wrap in `{data}`. Clients decode these inconsistently.
3. **A broken contract that ships bugs.** The review composer posts `{tmdbMovieId,
   rating, comment}`; the backend requires `{tmdbId, mediaType, rating, content}`. With
   type-checking disabled, nothing catches it.

A single shared `@flixr/contract` package (types + a typed envelope decoder) would turn
the third item from a runtime 400 into a compile error. That is the one abstraction in
this repo worth extracting — see [DISCUSSION.md](./DISCUSSION.md) (The Architect).
