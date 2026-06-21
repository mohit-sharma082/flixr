# Project Idea & Strategy

> A candid look at *what Flixr is trying to be*, whether that's worth being, and what the
> sharpest version of it looks like. This is opinion grounded in the audit — not a pitch
> deck.

## The thesis (as built)

**Flixr = TMDB's catalog + a first-party community layer (reviews & threaded comments),
delivered on web and mobile, served through a custom caching BFF.**

On paper this is a real thesis. "Browsing data + a place to talk about it" is exactly
Letterboxd's entire moat, compressed into one sentence. And the *expensive, unglamorous
80%* of that moat is already built here: Mongo `Review`/`Comment` models, JWT auth,
Joi-validated write paths, an aggregate endpoint that fuses TMDB details with a `$avg`/
`$count` over your own reviews, threaded comments with soft-delete and pinning.

## The thesis (as it actually runs)

It doesn't.

The community layer is **orphaned on every surface** (see [AUDIT.md C2/C3](./AUDIT.md#critical-findings)):

- Web detail pages render **TMDB's own native reviews**, not Flixr's Mongo reviews.
- The components that would show first-party reviews are **dead code** (imported nowhere).
- The one review form that exists posts a payload the backend **rejects with a 400**.
- Mobile has **no auth at all**, so it can never post or read a community review.

So the product *as running today* is a **competent, read-only TMDB browser**. The
differentiator is not undercooked — it's paid for and unplugged. That distinction matters:
the fix is wiring, not invention.

## Who is this for?

This is the question the project has not answered, and it's the one that decides
everything. Three honest candidates:

1. **A portfolio / learning artifact.** *Most likely, and entirely legitimate.* The goal
   is to demonstrate range and judgment to a reviewer (recruiter, hiring manager, future
   self). Optimize for one *coherent, working, honestly-scoped* artifact.
2. **A niche product for film-talk communities.** Plausible only with a sharp wedge
   (below) and a real reason to leave Letterboxd. A community of one is not a community.
3. **A commercial product.** *Not viable as-is.* TMDB's API terms cap commercial use, the
   data isn't yours, and the incumbents own the network effects.

The project currently behaves like #3 (three surfaces, a BFF, a brand) while having the
substance of #1. That mismatch — *building like a startup, finishing like a tutorial* —
is the central strategic problem.

## Competitive reality

| Competitor | What they own | Can Flixr beat it? |
|---|---|---|
| **TMDB's own apps** | The data, the canonical UI | No — Flixr *is* their data |
| **Letterboxd** | Film social graph, taste, lists, reviews culture | Not solo, not without a wedge |
| **Trakt** | Scrobbling, watch tracking, API ecosystem | No, that's a different game |
| **JustWatch** | "Where can I stream it" availability | No, that's a licensing-data business |
| **IMDb** | SEO, ratings ubiquity, Amazon | No |

The blunt truth: **there is no defensible wedge against these for a solo builder.** "Yet
another movie app with reviews" is a crowded graveyard. That does *not* mean don't build
it — it means **be honest about why you're building it**, and that reason is almost
certainly "to be excellent engineering I can show," not "to win a market."

## If you *did* want a wedge (the creative angle)

If the goal flips toward "a real thing people use," the only interesting moves are ones the
incumbents *structurally won't* make:

- **Discussion-first, not rating-first.** Letterboxd is reviews-as-performance. Flixr's
  *threaded comments tied to a title* could be "Reddit thread per movie/episode" — spoiler-
  gated, episode-scoped, ephemeral-around-release. That's a different shape than a star
  rating, and the data model already supports threads.
- **The BFF as the actual product.** The genuinely novel artifact here is the caching
  aggregation layer. A "TMDB-but-fast-and-aggregated" public API/SDK is a more honest
  product than a 12th catalog UI — and it plays to the demonstrated strength.
- **Episode-level conversation for currently-airing TV.** TMDB has the episode data; the
  comment model is threaded; nobody does *good* live-episode discussion that isn't Reddit.

None of these are required. They're here to make the point: the *interesting* version of
Flixr leans into the comment thread and the BFF, not the catalog browse that everyone has.

## The honest framing (recommended)

**Call it a portfolio/learning project, out loud, and optimize ruthlessly for that.** A
portfolio piece's job is to make a competent reviewer think *"I'd hire whoever built
this."* Today a reviewer who clicks "reviews" sees TMDB's reviews and concludes there's no
community product — the broken differentiator makes the project read as **worse than a
clean read-only browser would.**

The version that earns the hire:

> "I designed a resilient caching BFF (read-through Redis cache, `Promise.allSettled`
> aggregation, allowlisted query params) and shipped **one polished, working community
> vertical** on top of it — a logged-in user can post a review and see it next to the
> movie — with tests, CI, and a clone-and-run setup."

That beats "I scaffolded three surfaces" for any serious reviewer. **Depth on one surface
> breadth across three.**

## The single sharpest version

A **single web surface that genuinely fuses TMDB data with first-party reviews on the
page**, with the **BFF as the centerpiece**, mobile shelved until the core loop is real.
Concretely that means:

1. Wire the review loop end-to-end on `movie/[id]` (the 200-line fix).
2. Render first-party reviews *alongside* TMDB's, clearly labeled.
3. Make the BFF the README's headline, with the attribution TMDB requires.
4. Freeze mobile (keep the reusable `Grid`; stop investing).

See [ROADMAP.md](./ROADMAP.md) for the sequenced plan and [DISCUSSION.md](./DISCUSSION.md)
for four engineers arguing about exactly this.
