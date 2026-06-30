# Roadmap

A sequenced plan that implements the audit's verdict: **make one community vertical true on
the web, showcase the BFF, freeze mobile.** Ordered by leverage (impact ÷ effort). IDs
reference [AUDIT.md](./AUDIT.md).

## The decision that gates everything

> **Declare scope: this is a portfolio/learning artifact.** Optimize for one coherent,
> working, honestly-scoped surface — not three half-built ones. If you later disagree and
> want a *product*, re-read [PROJECT_IDEA.md](./PROJECT_IDEA.md) "If you did want a wedge"
> first; the plan below changes.

---

## Quick wins (hours, not days)

> **Status — 2026-06-22: all quick wins below are DONE.** ✅ Mobile (`flixr/`) was left
> untouched by decision. Frontend type-checks clean (`tsc --noEmit` exit 0) with
> `ignoreBuildErrors` now off. The backend changes were written but **not compiled locally**
> (no `backend/node_modules` present) — run `pnpm install && pnpm build` in `backend/` to
> verify before deploy.
>
> **Status — 2026-06-28: quick-wins round 2 DONE.** Restored the accidentally-disabled CORS
> middleware (dev-permissive localhost + prod allowlist), added a request body-size limit, a
> `Review` index (H6), graceful SIGTERM/SIGINT shutdown (H4), error-handler status + 5xx-leak
> fixes, owner-only comment delete, the C3 composer payload fix, an `app/error.tsx` boundary,
> and stripped raw `JSON.stringify(error)` dumps from the UI. Backend **and** frontend now
> `tsc --noEmit` clean (backend verified — `node_modules` present this round). Also created 4
> subagents: `reality-critic`, `contract-guardian`, `bff-engineer`, `web-ui-engineer`.
>
> **Status — 2026-06-28: v1 build DONE (app only; hosting deferred to a later session).**
> The community review loop is **live on movie pages** (post → see it listed; profile shows
> your reviews via the new `GET /api/reviews/mine`). The nav FAB now has Sign in / Register /
> Logout. Stability: fixed the render-time redirects in `not-found` and `/movies`, added
> detail-route error boundaries, hid the decorative favorites/watchlist, and made the home page
> dynamic (no build-time backend fetch). Security: TMDB proxy caps (page clamp 1–500,
> `append_to_response` allowlist, search/discover rate limit). Optimization: in-process cache
> single-flight (kills the homepage dogpile). Both apps `tsc` + build clean; contract-guardian +
> reality-critic verified the loop end-to-end. **Deferred (post-v1):** httpOnly-cookie auth,
> favorites/watchlist persistence, TV review loop, `next/image` optimization, server-rendered
> first-paint for reviews.
>
> **Status — 2026-06-30: piracy embed removed + UX refinement + tooling.** Replaced the
> `vidsrcme.ru` piracy iframe on movie & TV pages with a legitimate TMDB/JustWatch **Where to
> Watch** tab (new `GET /api/{movies,tv}/:id/watch-providers`) — the last legal blocker to
> hosting. Ran a `ux-ui-critic` pass and landed quick wins (dark default theme; a11y on the
> search/auth surfaces; design-system polish; wired the dead Share button; deep-link-safe back
> button; movie production-logo null guard). Created 5 reusable subagents in `.claude/agents/`
> (reality-critic, contract-guardian, bff-engineer, web-ui-engineer, ux-ui-critic) and pruned
> `docs/` from 18 → 9 files. Both apps `tsc` clean; `next build` green; reality-critic
> re-verified the review loop + the new watch tab end-to-end. Work committed on branch
> `stabilize-v1` (not pushed — the remote URL still carries a PAT to rotate). **Still deferred
> (post-v1):** TV community reviews, profile review-title hydration, FAB keyboard a11y,
> httpOnly cookies, `next/image` for hero/logos, test + CI spine. On deploy, force a clean
> `.next` rebuild so stale compiled chunks don't ship the removed player.

- [x] **Rotate `JWT_SECRET`** — replaced the guessable phrase with `openssl rand -hex 64`
      (128 chars) in `backend/.env`. Added **fail-fast validation** in new
      `backend/src/config.ts` (`requireEnv('JWT_SECRET', {minLength: 32})` +
      `requireEnv('TMDB_API_KEY')`) that throws at boot. *(C1)*
- [x] **Fix search pagination** — `app/search/page.tsx` now reads `data.total_pages` and
      guards `results` with `Array.isArray`. *(H7)*
- [x] **Fix the broken import + turn type-checking back on** — `authSlice.ts` now imports
      `@/store`; `next.config.mjs` → `ignoreBuildErrors: false`. Verified clean. *(C5)*
- [x] **Remove the hardcoded Redis password** — `redisClient.ts` now reads an optional
      `REDIS_PASSWORD` from env instead. *(quality)*
- [x] **Pin the 5 `latest` deps** — `@reduxjs/toolkit ^2.12.0`, `@vercel/analytics ^2.0.1`,
      `axios ^1.16.1`, `react-redux ^9.3.0`, `redux ^5.0.1`; deleted the stale tracked
      `frontend/package-lock.json` (pnpm kept). *(H20/H21)*
- [x] **Lock CORS + add auth rate limit** — `app.ts` CORS is now an env-driven allowlist
      (`CORS_ORIGINS`, default `localhost:3000`); `routes/auth.ts` adds a 10-per-15-min
      limiter on `/login` + `/register`. *(H2/H3)*
- [x] **Add the TMDB attribution + non-endorsement notice** — new
      `frontend/components/footer.tsx` mounted in `layout.tsx`. *(legal — logo SVG still
      TODO; text statement is the mandatory part)*
- [x] **Add `/health` + gate `app.listen()` behind Mongo** — `server.ts` now `await`s
      `mongoose.connect` before listening (exits non-zero on failure); `/health` returns
      503 until the DB is connected. Removed the duplicate fire-and-forget connect from
      `app.ts`.
- [x] **Delete dead code** — removed unused `frontend/lib/apiClient.ts` and the vendor
      `Whizrange` header in `error_handler.ts`. *(`flixr/lib/index.ts` left in place —
      mobile is out of scope.)*
- [x] **Bonus:** created `frontend/.env.example`; added `CORS_ORIGINS` + `REDIS_PASSWORD`
      to `backend/.env.example` with a `JWT_SECRET` generation hint. *(part of H22)*

---

## 30 days — make the differentiator *true*

The goal: **a logged-in user posts a review and sees it next to the movie.** One surface
(web), one media type (movie) first.

1. **Fix the review contract (C3).** ✅ The composer now sends `{ tmdbId, mediaType, rating,
   content }` (matches the Joi schema). Still to do when wiring the loop — the contract-guardian
   flagged two more latent shape bugs in the (still-unmounted) community layer:
   - `comments.tsx` decodes `{ author?, comment?, text? }`, but `getReviewsForTmdb` returns
     `{ tmdbId, mediaType, rating, content, user: { name, email } }` — remap on read (or share a DTO).
   - `profile/page.tsx` invents `{ movieId, movieTitle, comment }` and fetches `/api/reviews?userId=`,
     which the backend doesn't implement — needs a real "my reviews" endpoint or removal.
2. **Mount the loop (C2).** Put `ReviewComposer` + a first-party reviews list on
   `app/movie/[id]`, auth-gated. Wire to `/api/reviews` (create) and
   `/api/reviews/tmdb/movie/:id` (list).
3. **Render first-party reviews on the page.** Split the detail page into a **TMDB reviews**
   view and a **Flixr community reviews** view (clearly labeled), reading the Mongo
   envelope — stop passing TMDB's `author_details` shape as if it were yours.
4. **Add the `Review` index (H6):** `{tmdbId:1, mediaType:1, createdAt:-1}`; consider a
   unique `{user, tmdbId, mediaType}` if one-review-per-title is intended.
5. **Backend production hygiene:** graceful shutdown on SIGTERM (H4), startup env
   validation, structured logging to replace `console.log`.
6. **Prove it once:** one `supertest` happy path — `register → login → createReview →
   listReviews` returns 201 then the review. The smallest signal the loop can't silently
   break again.
7. **Freeze mobile.** Stop investing; note it as "paused until the web core loop ships."
   Keep the reusable `Grid`.

**Exit criteria:** the headline feature works end-to-end on movie pages; `next build`
type-checks; the one integration test is green.

---

## 90 days — make it *defensible as engineering*

The goal: a stranger can clone, run, and trust it — and a reviewer sees rigor.

1. **Test spine (H18):** Vitest + supertest on the BFF (auth, review, aggregate, the cache
   layer); Vitest + Testing Library on the web store/components; **contract tests** that
   assert each client decoder matches the backend envelope (the class of bug behind C3/H8).
2. **CI (H19):** one GitHub Actions workflow — `pnpm install --frozen-lockfile`, typecheck,
   lint, test, build — gating merges to `main`.
3. **Lint actually runs (H11):** add `eslint` + config to web & backend; drop the
   eslint-9-removed `--ext` flag.
4. **Clone-and-run:** a `docker-compose.yml` for Mongo + Redis, and `.env.example` files
   for **web and mobile** (H22). README the BFF design as the centerpiece.
5. **Cache resilience (H5):** in-process single-flight dedupe in `getCached` (cheap), then a
   Redis lock or stale-while-revalidate if traffic warrants.
6. **Proxy abuse (H1):** route-scoped limits on search/discover, cap `page`, allowlist
   `append_to_response`, move limiter state to Redis.
7. **Web polish:** `error.tsx` boundaries, `generateMetadata` on dynamic routes (SEO/OG),
   re-enable `next/image` optimization with `remotePatterns`, fix the a11y gaps, strip the
   raw `JSON.stringify(error)` UI.

---

## Explicitly deferred (write down, don't build)

- **`@flixr/contract` workspace package.** Correct end-state, but premature while mobile is
  frozen — deleting the duplicate is cheaper than a workspace for a two-client repo. Revive
  it *with* mobile. *(H14–H17)*
- **Mongo repository/service layer.** Controllers calling Mongoose directly is fine at this
  size.
- **Mobile auth + real Explore/Profile** (H12/H13). Only after the web loop is real, and
  only with a *reason* (offline, push, share-to-app) — not by reflex.
- **httpOnly cookie auth (H9).** Worthwhile, but a larger change than the 30-day window;
  schedule once the loop works.

---

## Effort map (the leverage argument)

| Move | Effort | Payoff |
|---|---|---|
| Quick wins block | ~1 day | Closes the critical + several highs; reproducible builds |
| Wire the review loop (C2+C3) | ~2–3 days | **Turns a TMDB mirror into the pitched product** |
| Test + CI spine | ~1 week | "I can ship, not just prototype" — the portfolio multiplier |
| Freeze mobile | 0 (a decision) | Reclaims all the effort the above needs |

The whole "30-day" transformation is dominated by *one* 2–3 day wiring task. That is the
unusual, encouraging fact about this project: **it is much closer to good than it looks.**
