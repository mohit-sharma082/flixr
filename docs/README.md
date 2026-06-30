# Flixr — Project Documentation

> Generated 2026-06-22 from a full-repository audit (recon → multi-dimension audit →
> adversarial verification → engineering debate → synthesis). Findings cite `file:line`
> and were cross-checked by an independent reviewer; claims that did not survive that
> check are listed explicitly in [AUDIT.md → Refuted findings](./AUDIT.md#refuted-findings).

## What is Flixr?

A TMDB-powered movie & TV **discovery app with an aspirational community layer**
(first-party reviews + threaded comments), built as **three surfaces in one repo**:

| Surface | Stack | LOC (approx) | State |
|---|---|---|---|
| `backend/` | Express 5 · TS · MongoDB (Mongoose 9) · Redis (ioredis) · JWT · Joi | ~1.9k | **Strongest part of the project** |
| `frontend/` | Next.js 16 · React 19 · Redux Toolkit · Radix · Tailwind 4 | ~15k | Mature, but the headline feature is unwired |
| `flixr/` (mobile) | Expo ~54 · React Native 0.81 · expo-router · reanimated | ~2.2k | Skeleton (2 of 3 tabs are template stubs) |

The backend is a **BFF** (Backend-for-Frontend): it proxies TMDB behind a Redis
read-through cache (keeping the TMDB key server-side) and layers on its own auth and
a Mongo-backed community model. Both clients talk only to the BFF.

## The one-sentence verdict

> **Flixr is strong solo engineering wearing a product costume.** The caching BFF is
> genuinely good work; the web app is competently built; but the single feature that
> would make this more than a TMDB mirror — the community review loop — is **dead code
> on every surface**. The gap between "TMDB browser" and "the product as pitched" is
> roughly **200 lines of glue, not a rewrite.**

**Overall maturity: 4/10** — a strong core design dragged down by an absent core
feature, no test/CI safety net, and a couple of live security holes. One focused month
from a 6–7.

## Documents

| Doc | What's in it |
|---|---|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System map, data flow, module inventory, what's genuinely well-built |
| [DESIGN.md](./DESIGN.md) | Design system & UI/UX guidelines — visual language, tokens, component conventions, page archetypes, a11y rules |
| [AUDIT.md](./AUDIT.md) | Full findings by severity & dimension, with evidence/impact/fix; refuted findings; maturity scorecard |
| [PROJECT_IDEA.md](./PROJECT_IDEA.md) | The product thesis, competitive landscape, portfolio-vs-product framing, the sharpest version |
| [DISCUSSION.md](./DISCUSSION.md) | A four-voice engineering debate (Shipper / Architect / Strategist / Skeptic) + moderated synthesis |
| [ROADMAP.md](./ROADMAP.md) | Quick wins, 30/90-day plan, prioritized backlog |
| [TO_DISCUSS.md](./TO_DISCUSS.md) | 🗣️ Proposals parking lot — installable skills (skills.sh), build subagents, and a `reality-critic` proposal. Nothing decided yet. |

## How to read this

If you have five minutes: read this page + [ROADMAP.md → Quick wins](./ROADMAP.md#quick-wins-hours-not-days).
If you have twenty: add [AUDIT.md](./AUDIT.md) and [DISCUSSION.md](./DISCUSSION.md).
If you own the project: read all of it, then go fix the review loop — it's the cheapest, highest-leverage change in the repo.
