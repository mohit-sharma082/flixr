# Flixr — Engineering Audit

**Date:** 2026-06-22
**Scope:** All three apps (`backend/`, `frontend/`, `flixr/`) + cross-cutting repo concerns.
**Method:** Parallel recon of each app → seven dimension auditors (security, backend
architecture, web, mobile, code quality, repo/deps/DX, product) producing structured
findings → an **adversarial verification pass** that tried to *refute* every high/critical
finding against the actual code → executive synthesis. 49 agents, evidence cites
`file:line`. Findings that failed verification are in [Refuted findings](#refuted-findings).

## Scorecard

| Dimension | Grade | One-line |
|---|---|---|
| Backend architecture & caching | **B+** | Read-through cache + resilient fan-out is real senior work |
| Security baseline | **C** | Good primitives; one critical (weak JWT secret) + abuse surface |
| Web frontend | **C+** | Competent RSC app, but the headline feature is unwired & type-checks are off |
| Mobile | **D** | Skeleton: 2/3 tabs are template stubs, hardcoded LAN IP, no auth |
| Code quality & consistency | **C-** | Severe client duplication, 43 `any`, naming drift |
| Repo / deps / DX / testing | **D** | No workspace, no tests, no CI, dual lockfiles, `latest` pins |
| Product completeness | **D** | The differentiator (community) is dead code on every surface |
| **Overall maturity** | **4 / 10** | Strong core, absent core feature, no safety net. ~1 month from 6–7. |

**Severity counts (after verification):** 5 critical · 29 high · 35 medium · 22 low · 1 info.

> The headline is not "this is bad code." Much of it is good. The headline is **a strong
> engine bolted to an unfinished car, with the dashboard warning lights disconnected.**

---

## Critical findings

### C1 — JWT signing secret is a guessable phrase  · `security` · ✅ verified (0.9)
`backend/.env:4` → `JWT_SECRET` base64-decodes to the literal string
`TMDB2025_community_to_2026`. It's consumed in `auth.controller.ts:34,58` (`jwt.sign`) and
`middleware/auth.ts:22` (`jwt.verify`). The token payload is only `{ id: user._id }`.
**Impact:** anyone who guesses this low-entropy, dictionary-style secret can forge a valid
JWT for *any* user id and fully impersonate them (the ownership checks then trust
`req.user._id`) — a complete auth bypass. **Good news:** `backend/.env` is correctly
gitignored and was never committed, so it isn't leaked *through the repo* — but the secret
is weak and must be rotated regardless (it was also shared into this audit context).
**Fix:** `openssl rand -base64 48`, store in a secret manager, and add a boot-time
assertion that refuses to start if `JWT_SECRET` is missing or < 32 bytes. [S]

### C2 — The community layer is disconnected from the UI on every surface  · `product` · ✅ verified (0.97)
This is the defining defect. The app's stated purpose is "community reviews & discussions"
(`app/layout.tsx`), but:
- Movie/TV detail pages render **TMDB's native reviews**, not the app's Mongo reviews —
  `reviews-grid.tsx` reads `review.author_details.avatar_path/username` (TMDB's shape),
  fed from `movieData.reviews.results`.
- The components that *would* surface first-party reviews — `review-composer.tsx`,
  `comments.tsx` — are imported by **no page** (verified by repo-wide grep). They are dead
  code.
- The first-party endpoint `/api/reviews/tmdb/:mediaType/:tmdbId` is consumed only by the
  unmounted `comments.tsx`.

**Impact:** the thing that distinguishes Flixr from a plain TMDB mirror **does not run**.
The differentiator isn't undercooked — it's absent and (where wired at all) broken.
**Fix:** mount the composer + a first-party reviews list on `movie/[id]`, wire to the real
endpoint, prove the create→list loop. [M] (See C3 for the contract bug it depends on.)

### C3 — Review write path is broken by a contract mismatch  · `shared` · ✅ verified (0.95)
`review-composer.tsx:69-72` POSTs `{ tmdbMovieId, rating, comment }`. The backend Joi
schema (`review.controller.ts:6-11`) **requires** `{ tmdbId, mediaType, rating, content }`
and rejects unknown keys → guaranteed **400** on every submit. Worse, there are **three
different "review" shapes** in the codebase: the composer's, the API's, and a *third* one
the profile page invents (`app/profile/page.tsx` → `{ movieId, movieTitle, comment }`)
that no endpoint returns. **Impact:** even after C2's wiring, the feature breaks; this is
the clearest "surfaces built in isolation, never integration-tested" signal in the repo.
**Fix:** one shared `CreateReviewPayload` DTO consumed everywhere; send `{ tmdbId,
mediaType, rating, content }`. [S]

> Note on framing: an auditor first flagged C3 as "every submission 400s (critical core
> path)." Verification **downgraded the framing** — the form is never mounted, so no user
> can reach it today. It's a real latent bug, but it's dead-code-latent, not
> live-user-facing. C2 (it's unmounted) is the live problem; C3 is what bites the moment
> you fix C2.

### C4 — Mobile API base URL is a hardcoded LAN IP over plain HTTP  · `mobile` · ✅ verified (0.95–0.97)
`flixr/services/index.ts:5` (and `apiClient.ts:5`): `const baseURL =
'http://192.168.81.126:4000'`. No `EXPO_PUBLIC_*` / `expo-constants` indirection exists.
The `|| 'http://localhost:4000'` fallback is dead (the literal is always truthy), and
`localhost` would mean the *phone itself* on a device anyway. **Impact:** the app only
reaches the backend from one machine's LAN; on a physical phone, a teammate's machine, CI,
or prod it silently fails every request. Plain HTTP also trips iOS ATS / Android cleartext
rules in release builds. **Fix:** `process.env.EXPO_PUBLIC_API_URL` with a `__DEV__`-only
LAN fallback; HTTPS for non-local. [S]

### C5 — Type-checking is disabled in the build, masking a real broken import  · `web` · ✅ verified (0.97)
`next.config.mjs` sets `typescript.ignoreBuildErrors: true` despite `tsconfig.strict:true`.
`tsc --noEmit` reports exactly one error today: `store/slices/authSlice.ts:3` imports
`RootState` from `@/src/store`, which doesn't exist (the alias `@/*`→`./*` and the store is
at `@/store`, i.e. `frontend/store/index.ts`). The build passes only because errors are
ignored. **Impact:** strict mode is paid for but switched off; the broken import means
selectors are untyped, and *all* future contract drift (like C3) compiles silently.
**Fix:** fix the import to `@/store`, then remove `ignoreBuildErrors`. [S]

---

## High-severity findings

### Backend & security
- **H1 — Unauthenticated TMDB proxy → quota exhaustion** (✅0.9). Every TMDB route is
  unauthenticated; the only throttle is one in-memory `120 req/min/IP` limiter
  (`app.ts:31-35`). Cache-busting params (`?page=`, `?q=`, `?append=`) defeat the Redis
  cache because keys include params (`tmdbClient.ts:216`). Anyone can burn the shared TMDB
  quota for all users. **Fix:** route-scoped limits on search/discover, cap `page`,
  allowlist `append_to_response`, move limiter state to Redis. [M]
- **H2 — No dedicated rate limit on `/auth/login` & `/register`** (✅0.95). Credential
  brute-force / account enumeration are practical at ~120 guesses/min/IP, no lockout.
  **Fix:** tight `express-rate-limit` keyed by IP+email + backoff. [S]
- **H3 — CORS reflects any origin with credentials** (✅0.85). `cors({origin:true,
  credentials:true})` (`app.ts:24-29`) reflects any `Origin` and allows credentialed
  cross-site requests. **Fix:** explicit env-driven allowlist. [S]
- **H4 — No graceful shutdown** (✅0.9). `server.ts` keeps no server ref, no
  `SIGTERM/SIGINT` handler, never closes Mongo/Redis. Rolling deploys drop in-flight
  requests. **Fix:** capture `server`, drain on signal, `mongoose.disconnect()` +
  `redisClient.quit()`. [S]
- **H5 — Cache stampede / dogpile** (✅0.9). `getCached` has no single-flight; when a hot
  key (e.g. the 12h trending) expires, N concurrent misses each hit TMDB. The homepage
  amplifies this 12×. **Fix:** in-process `Map<key,Promise>` dedupe, optionally a Redis
  `SET NX PX` lock or stale-while-revalidate. [M]
- **H6 — `Review` model has no index on its hot query fields** (✅0.95). `Review.ts`
  declares no indexes, yet `movie.controller.ts` aggregates/sorts by `{tmdbId, mediaType}`
  on a documented hot path → full collection scan + in-memory sort as reviews grow.
  Ironic given `Comment.ts` *does* index correctly. **Fix:**
  `ReviewSchema.index({tmdbId:1, mediaType:1, createdAt:-1})`; consider a unique
  `{user, tmdbId, mediaType}`. [S]

### Web
- **H7 — Search pagination is permanently stuck on page 1** (✅0.95).
  `app/search/page.tsx:84` reads `data.totalPages`, but TMDB/backend return `total_pages`
  (snake_case) → always `1`, so Prev/Next never render. **Fix:** read `total_pages`; guard
  `results` with `Array.isArray`. [S]
- **H8 — `apiClient.details()` typed as bare `Movie`/`TVShow` while backend returns an
  envelope** (✅0.95). `apiClient.ts:15-18,32-33` vs backend `{movie,reviews}` /
  `{show,reviews}`. Hidden only because pages bypass `apiClient` and hand-roll `fetch`.
  **Fix:** `MovieDetailsResponse`/`TVDetailsResponse` types; route pages through it. [M]
- **H9 — JWT in `localStorage`** (✅0.95). `authSlice.ts:16,43-48` persists the token to
  `localStorage`; `lib/api.ts:84-95` attaches it. Any XSS exfiltrates the session; no
  refresh/expiry handling. **Fix:** prefer httpOnly+Secure+SameSite cookies set by the
  backend. [L]
- **H10 — Build ignores TS errors + disables image optimization** (✅0.95). See C5;
  `images.unoptimized:true` also kills `next/image` optimization app-wide. **Fix:** remove
  both; configure `images.remotePatterns` for TMDB. [M]
- **H11 — Frontend lint script can't run** (✅0.97). `package.json` has `"lint":
  "eslint ."` but **no eslint dependency and no config**. The 128-file app has no linting.
  Backend has the same gap plus a removed-in-eslint-9 `--ext` flag. [S]

### Mobile
- **H12 — No state management, no functioning auth** (✅0.95). No store anywhere in
  `flixr/`; `authApi` is never called; no token storage (`SecureStore`/`AsyncStorage`), no
  attach-token interceptor; `profile.tsx` is a literal stub. Mobile can never participate
  in the community. `authApi.me()` even calls `/auth/me`, **which the backend doesn't
  implement** (`routes/auth.ts` has only `/register`, `/login`). [L]
- **H13 — Explore & Profile tabs are verbatim Expo template content** (✅0.97).
  `explore.tsx` is the starter "File-based routing" copy with a `react-logo.png`;
  `profile.tsx` renders "This is profile screen"; `modal.tsx` is the template modal.
  Two of three primary tabs ship no product. [L]

### Shared duplication (root cause: no workspace)
- **H14 — Service layer & interfaces copy-pasted between clients, already drifted**
  (✅0.95). `flixr/services/apiClient.ts` ≈ `frontend/lib/apiClient.ts`;
  `flixr/services/index.ts` duplicates `frontend/lib/api.ts` ROUTES. Drift exists: web
  bakes `/api` into each route, mobile appends it to `baseURL`; mobile's `details` types
  `{movie:Movie}` while web types `Movie`. [L]
- **H15 — TMDB types duplicated ~220 lines verbatim** (✅0.9). `frontend/lib/interfaces.ts`
  (351) vs `flixr/lib/interfaces.ts` (280); mobile dropped Episode/Season/Video and
  loosened optionality/nullability. Two sources of truth for the API contract. [M]
- **H16 — `*Api` wrappers ~90% identical** (✅0.92). [M]
- **H17 — Two frontends are unlinked projects with no workspace** (✅0.95). No root
  `package.json`, no `workspaces`/turbo/pnpm-workspace — *structurally* prevents sharing,
  the root cause of H14–H16. **Fix:** pnpm workspaces + `packages/api-sdk`. [M/L]

### Repo / DX
- **H18 — Zero automated tests across all three apps** (✅0.99). No `test` script, no
  runner, no `*.test.*` anywhere. No regression net for auth, contracts, caching. [L]
- **H19 — No CI** (✅0.97). No `.github`, no workflow files. Nothing enforces
  lint/build/test; combined with C5, broken types land on `main`. [M]
- **H20 — Frontend pins 5 runtime deps to `latest`** (✅0.95). `@reduxjs/toolkit`,
  `@vercel/analytics`, `axios`, `react-redux`, `redux` → non-reproducible builds; a
  lockfile regen can pull a breaking major. [S]
- **H21 — Competing npm + pnpm lockfiles** (✅0.95). Both `frontend/` and `backend/` carry
  a stale Jan `package-lock.json` *and* a Jun `pnpm-lock.yaml`; READMEs say pnpm. **Fix:**
  delete the npm locks, add `packageManager: pnpm@x`. [S]
- **H22 — Missing `.env.example` for web & mobile** (✅0.9). Only `backend/.env.example`
  exists; the frontend README says `cp .env.example .env.local` against a nonexistent
  file. [S]

---

## Medium-severity findings (condensed)

**Backend:** error handler returns raw internal/axios `error.message` to clients
(`error_handler.ts` — also uses `error.status` where axios uses `error.response.status`,
so TMDB 404s become 500s) · no request body size limit (large-payload DoS) · dead admin
path in `deleteComment` checks `req.user.role`/`isAdmin` which **don't exist** on the
`User` model · no startup env validation · unstructured `console.log` logging (also logs
every TMDB request URL + params) · `raw()` cache key is `JSON.stringify(params)` —
order-sensitive · offset `skip/limit` pagination degrades on deep pages · comment
`toggleLike` has no per-user dedupe (any user can inflate counts) · reply fetch caps at
`.limit(100)` across *all* parents on a page (some comments show zero replies).

**Web:** auth slice reads `localStorage` at module init → SSR/CSR hydration risk + a stale
`'token'` key the slice never writes · no `error.tsx` boundaries → fetch failures blank the
screen · no `generateMetadata` on dynamic routes → no per-item SEO/OG tags · raw
`JSON.stringify(error)` rendered into the UI · `router.replace` called during render in
not-found/movie placeholder pages · a11y gaps (untitled/un-sandboxed iframes, empty `alt`,
label-less controls) · pervasive `any`/`unknown` casts at the data boundary.

**Mobile:** request interceptor has an empty `try{}` and logic-inverted `catch` (dead) ·
`use-image-colors` hook is dead code, built on `react-native-image-palette` which fits the
New Architecture (`newArchEnabled:true`) poorly · web-only CSS props in RN `StyleSheet`
(no-ops, betray web-copied styling) · bare "Loading…" text, swallowed errors, no empty
states · raw RN `Image` instead of `expo-image` in hot paths · missing
`GestureHandlerRootView`, misplaced `SafeAreaProvider`.

**Code quality:** 43 explicit `any` (18 backend / 17 web / 8 mobile) despite strict mode,
no lint rule banning them · ~29 leftover `console` statements · vendor copyright header
**`Whizrange / whizhack.in`** left in `backend/src/utils/error_handler.ts` (copied code —
trace provenance) · naming drift (backend routes split 4/4 `movie.ts` vs `tv.routes.ts`;
`error_handler.ts` snake_case among camelCase; component files mix kebab/dot/Pascal) ·
`flixr/lib/index.ts` is **0 bytes** · dead `BASE_ROUTES` const · React `19.2.0` (web) vs
`19.1.0` (mobile).

**Product/legal:** **TMDB attribution + non-endorsement notice is entirely absent**
(verified: zero attribution strings in any app) — required by TMDB's API terms; a publish
blocker. Favorite/watchlist buttons are decorative local state with no persistence. The
`User` model (`email, password, name`) is too thin to support a real "community" (no
handle, avatar, bio, roles).

---

## Refuted findings

The adversarial pass **rejected three findings** that earlier auditors raised. They are
recorded here so they don't get "fixed" or repeated:

1. **❌ "`dotenv.config()` runs after the app module graph (api_key=undefined)."**
   *Refuted (0.95).* Under this repo's `module: commonjs` tsconfig, `tsc` emits `require()`
   in **source order** — it does not hoist like native ESM. Verified by compiling: the
   emitted `dist/server.js` runs `dotenv.config()` **before** `require("./app")`, so all
   top-level `process.env` reads see the values. Both `node dist/server.js` and
   `ts-node-dev` work with only a `.env`. *Legitimate but low-severity:* the pattern is
   fragile and would break under native ESM — moving env loading into a preloaded
   `import './config'` is defensible hardening, not a bug fix.

2. **❌ "Every review submission 400s — the core write path is broken end-to-end."**
   *Refuted as critical (0.9).* The payload mismatch is real (that's C3), **but**
   `ReviewComposer` is mounted by no page, so there is no reachable user path today. The
   accurate framing: a latent contract bug in unmounted code, not a live "no user can ever
   post" critical. (The *live* problem is C2 — it's unwired.)

3. **❌ "The brand name is literally 'TMDB'."** *Refuted (0.85).* The only visible "TMDB"
   text is in `header.tsx:108`, but the `Header` is **commented out** of `app/layout.tsx`
   and replaced by `FloatingNavFAB`, which has no wordmark. The product is branded
   **"Flixr"**. *However* — the **attribution/non-endorsement gap is real and stands** as a
   medium finding; add the required TMDB notice + logo to a footer.

---

## What this audit did *not* cover (honest gaps)

- **No runtime exercise.** All findings are static. Nobody ran the stack against a live
  TMDB key + Mongo + Redis to confirm the homepage returns data, measure cache hit-rate or
  p95, or observe what the web app does when the backend is down.
- **No dependency CVE / supply-chain scan** (`npm audit`/Snyk) across the ~40 Radix
  packages + the `latest`-pinned libs.
- **No real a11y/Lighthouse run** — a11y findings are from reading code, not scoring.
- **No data-durability / moderation / GDPR story** for the Mongo community data.
- **No TMDB quota cost model** under the unauthenticated-proxy design (H1 is a real *bill*,
  not just a smell).
- **Scope assumption unverified against git history** — "solo/portfolio" is inferred, not
  confirmed (contributor count, deadline, coursework). That changes whether to prioritize
  the demo vertical or resume-bullet breadth.
