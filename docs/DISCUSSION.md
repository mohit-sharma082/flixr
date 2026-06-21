# The Debate

Four engineering archetypes were given the full architecture brief + audit findings and
asked to take a strong, specific position on Flixr's idea and current state. They argue
from different values — shipping, elegance, product, brutal honesty — and, tellingly,
**converge on the same verdict**. A moderated synthesis follows.

---

## 🚢 The Shipper — *"Finish one screen, kill the rest."*

> **Thesis:** Kill the mobile app, freeze the BFF, and spend four weeks making one screen
> do the one thing the whole project exists to do: show a community review next to a movie.

Here's the thing nobody wants to say: Flixr already shipped a working product — a
competent TMDB browser with a nice caching BFF. The community layer, the entire reason
this isn't just a TMDB skin, **does not run**. `ReviewComposer` and `comments.tsx` are
mounted by zero pages, and even if you mounted the composer it POSTs `{tmdbMovieId, rating,
comment}` to a backend whose Joi schema requires `{tmdbId, mediaType, rating, content}`.
So the differentiator is two dead files and a 400. That is the *only* bug that matters;
everything else is a distraction from it.

Meanwhile we built three surfaces: ~16k LOC of web, ~2.6k of mobile where `explore.tsx` is
still the verbatim Expo starter and `profile.tsx` is a stub, and a 1.9k BFF. That's not
ambition, it's a half-finished triptych.

**Strongest point FOR continuing:** the hard parts that usually sink solo projects are
already done well — read-through cache, `Promise.allSettled` fan-out, RSC-first fetching,
a real Mongo model. The gap to the pitched product is ~200 lines of glue, not a rewrite.
**Strongest point AGAINST his own view:** for a *portfolio*, "web + mobile + a custom BFF"
is a louder headline than "one polished web app," and freezing mobile throws away ~2.6k LOC
and concedes the multi-surface bet was a mistake.

---

## 🏛 The Architect — *"Build one shared contract, defer the rest."*

> **Thesis:** Build exactly one shared contract package now — the types and the envelope
> decoder — because the only debt that actively *breaks* the product is contract drift, not
> the absence of repository layers or test pyramids.

Elegance for an unlaunched product is mostly vanity, so name the one abstraction that earns
its keep: a `@flixr/contract` package holding `interfaces.ts` + a single typed envelope
decoder. The drift is already measurable and lethal. `frontend/lib/interfaces.ts` (350) vs
`flixr/lib/interfaces.ts` (279) — mobile silently dropped Episode/Season and loosened
required fields. `frontend/lib/apiClient.ts` is dead code, so the typed layer everyone
thinks protects them protects nothing: `movie/[id]/page.tsx` hand-rolls `fetch` and reads
`movieData.reviews.results`, `page.tsx` reads `resp.data?.data`, `company/[id]` reads
`res?.data?.data ?? res?.data ?? res`. **Three decoders, three shapes, one backend.** And
`ROUTES.movies.search` / `tv.search` both point at `/api/common/search` — the registry
meant to prevent stringly-typed drift already encodes a lie.

A shared package with a discriminated envelope type would have made the review-composer
400 a **compile error**. That is the elegant core worth building. What's premature: a Mongo
repository layer, a turborepo, breaking `getCached` apart — it's genuinely good as-is;
don't gold-plate it.

**Strongest point AGAINST his own view:** for a solo project with zero users and a broken
core loop, even a shared package is yak-shaving — deleting two of three duplicated copies
(freeze mobile, delete dead `apiClient.ts`) is cheaper than extracting a workspace.

---

## 📈 The Product Strategist — *"You unplugged your own moat."*

> **Thesis:** Flixr isn't "another TMDB client" — it's a TMDB client that built the hard
> half of its differentiator and then forgot to plug it in.

The wedge was never the browsing — it's the first-party reviews + threaded comments riding
on TMDB's catalog. Letterboxd's whole moat in one sentence. And Flixr already built the
expensive 80%: Mongo models, JWT auth, validated writes, an aggregate endpoint fusing TMDB
details with `$avg`/`$count` over its own reviews. The problem is it's wired to nothing.
`reviews-grid.tsx` — the only thing rendering on detail pages — reads
`review.author_details.avatar_path` (TMDB's schema), not the Mongo model. So today the
running product is a TMDB-reviews *mirror* with a dead community feature behind it. That's
not "undercooked differentiation," it's a differentiator you paid for and unplugged.

**Strongest point AGAINST continuing:** even finished, there's no business — TMDB's ToS
caps it, attribution is entirely absent, and Letterboxd/Trakt/IMDb own the network effects
you can't bootstrap solo. A community of one is not a community. **So: portfolio piece, not
product — and a portfolio piece whose headline feature is visibly broken is *worse* than a
clean read-only browser.**

---

## 🔪 The Skeptic — *"It's a learning project in a product costume. That's fine — act like it."*

> **Thesis:** Stop pretending the community feature exists and go all-in on the one
> genuinely interesting thing you built: the BFF.

Drop the polite framing. The "differentiator" does not exist in the running product —
verified: `review-composer.tsx:69-71` posts the wrong shape, the imports return zero,
no page mounts it. Calling that your wedge is self-deception. As a *product*, Flixr has no
answer to Letterboxd/Trakt/TMDB's own apps.

But here's what the harsh critics get wrong: **the BFF is real engineering.** The
read-through cache (`getCached` centralizes get/miss/SETEX, `api_key` excluded from keys,
per-call TTL), the `Promise.allSettled` fan-out, the *correct* compound index in
`Comment.ts` — that's senior work, and the correct index makes the *missing* `Review` index
a focus failure, not ignorance. That's the tell: this person can build well but is
spreading across three surfaces and finishing none. The cargo-culting is everywhere —
Redux for a single auth slice, ~40 Radix packages, dead `apiClient.ts`,
`ignoreBuildErrors:true` defeating strict mode. Strip it. The one thing that makes this
worth doing is **the BFF as a portfolio centerpiece** — if that's true, optimize for it
ruthlessly.

---

## Where they agree (the consensus)

Despite different values, all four land on the same three points:

1. **The multi-surface bet was over-scoped.** Three surfaces, one finished. Freeze mobile.
2. **The BFF is the crown jewel** — preserve it, showcase it, make it the headline.
3. **Finish one working vertical** instead of maintaining breadth. The differentiator is a
   wiring job (~200 lines), not a rewrite.

Where they *differ* is only the next move's flavor: the Shipper says *delete and ship*; the
Architect says *extract one contract first*; the Strategist says *reframe honestly*; the
Skeptic says *all of the above, and say it out loud.*

## Moderator's synthesis

The disagreement between the Shipper ("delete the duplication") and the Architect ("extract
a shared package") is real but **sequencing resolves it**: for a *two-client repo where one
client is being frozen*, deleting the duplicate is cheaper than building a workspace. Defer
the `@flixr/contract` extraction until mobile is genuinely revived — *then* it earns its
keep. Until then, the Architect's deeper point still holds and should be honored cheaply:
fix the broken import, turn on `tsc` in the build, and add **3–4 contract tests** that pin
the backend's actual envelopes. That captures 80% of "elegance" for 5% of the cost.

The Strategist and Skeptic settle the "why does this exist" question: **portfolio artifact,
stated openly.** Everything else follows from that — including the permission to *not* build
mobile, *not* extract a workspace, and *not* chase a market that doesn't exist.

**The verdict, in one line:** *Make one thing true.* A logged-in user posts a review and
sees it next to the movie, on one polished web surface, on top of a BFF you're proud to
show. That single sentence becoming real is worth more than all three half-surfaces.

→ See [ROADMAP.md](./ROADMAP.md) for the sequenced plan that implements this verdict.
