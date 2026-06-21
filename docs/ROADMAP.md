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

These are nearly free and several close real holes. Do them first.

- [ ] **Rotate `JWT_SECRET`** to `openssl rand -base64 48`; add a boot assertion that throws
      if it (or `TMDB_API_KEY`) is missing/too short. *(C1 — minutes, closes the one
      critical security hole)*
- [ ] **Fix search pagination:** `data.totalPages` → `data.total_pages` in
      `app/search/page.tsx:84`. *(H7 — one word, unblocks all paged search)*
- [ ] **Fix the broken import:** `@/src/store` → `@/store` in `authSlice.ts:3`, then set
      `typescript.ignoreBuildErrors: false`. *(C5 — restores the type safety you already
      pay for)*
- [ ] **Remove the hardcoded Redis password** comment in `redisClient.ts:8`. *(quality)*
- [ ] **Pin the 5 `latest` deps** to concrete versions; delete the stale
      `package-lock.json` files (keep pnpm). *(H20/H21 — reproducible builds)*
- [ ] **Lock CORS** to an env-driven allowlist; add a dedicated `express-rate-limit` on
      `/auth/login` + `/register`. *(H2/H3 — a few lines in `app.ts`)*
- [ ] **Add the TMDB attribution + non-endorsement notice** (and logo) to the web footer.
      *(legal/publish blocker)*
- [ ] **Add `/health`** and gate `app.listen()` behind a successful Mongo connect.
- [ ] **Delete dead code:** `frontend/lib/apiClient.ts` (unused), `flixr/lib/index.ts`
      (0 bytes), the vendor `Whizrange` header in `error_handler.ts`. *(quality)*

---

## 30 days — make the differentiator *true*

The goal: **a logged-in user posts a review and sees it next to the movie.** One surface
(web), one media type (movie) first.

1. **Fix the review contract (C3).** One shared `CreateReviewPayload = { tmdbId, mediaType,
   rating, content }`; send it from the composer; type `reviewsApi.post` with it.
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
