# Proposals — To Be Discussed

> **Status: 🗣️ TO BE DISCUSSED — nothing here is decided or installed.**
> Created 2026-06-22. This is a living "parking lot" for tooling, agent, and process
> proposals. Each item has a recommendation and open questions; decide, then move the
> accepted ones into [ROADMAP.md](./ROADMAP.md) and delete or strike them here.

Contents:
1. [Installable skills (skills.sh)](#1-installable-skills-skillssh)
2. [Build subagents to create](#2-build-subagents-to-create)
3. [Critic subagents — do we want one?](#3-critic-subagents--do-we-want-one)
4. [Open decisions checklist](#4-open-decisions-checklist)

---

## 1. Installable skills (skills.sh)

**What it is.** `skills.sh` is a registry + CLI from **Vercel Labs**
(`github.com/vercel-labs/skills`, MIT) — *community/vendor-built, **not** official
Anthropic.* A "skill" is a folder with a `SKILL.md` (frontmatter + instructions); the CLI
fetches `SKILL.md`-bearing GitHub repos into `.claude/skills/` (project) or
`~/.claude/skills/` (global). Claude Code auto-discovers them next session.

**Install commands** (verified): `npx skills add <owner/repo>` — preview with `--list`,
pick with `--skill <name>` (repeatable), target with `-a claude-code`, global with `-g`.
Writes a `skills-lock.json`. Some publishers ship as a **Claude Code plugin marketplace**
instead (`/plugin marketplace add <repo>` → `/plugin install <skill>@<market>`).

### ⚠️ Trust caveat (read before installing anything)

Skills are **instructions + scripts that execute in the agent's context** (file ops, bash,
code gen) — installing one is closer to running untrusted software than reading a doc. A
malicious skill can read our `.env` / JWT secret / Mongo & Redis creds / TMDB key, or
quietly alter generated code. **And skills.sh's own scanners are not reliable** — Trail of
Bits (June 2026) reported bypassing all three integrated scanners (one bypass was just
prepending 100k blank lines so the scanner truncated before the payload). So a "passed
audit" badge is weak assurance.

**Our rules if we adopt any:** first-party publishers only (`vercel-labs`, `anthropics`,
`trailofbits`, `microsoft`); read the `SKILL.md` + any bundled scripts before installing
(`--list`); prefer high install counts (>1k); install **project-scoped, not `-g`**, so
blast radius is contained; commit `skills-lock.json` and **code-review the `.claude/skills/`
diff like any dependency**.

### Candidate skills, mapped to our roadmap

| Goal (roadmap) | Skill | Publisher | Install |
|---|---|---|---|
| Web quality — React 19/Next perf | `vercel-react-best-practices` | vercel-labs | `npx skills add vercel-labs/agent-skills --skill vercel-react-best-practices -a claude-code` |
| App Router conventions | `next-best-practices` | vercel-labs | `npx skills add vercel-labs/next-skills --skill next-best-practices -a claude-code` |
| Caching (pairs w/ Redis BFF) | `next-cache-components` | vercel-labs | `npx skills add vercel-labs/next-skills --skill next-cache-components -a claude-code` |
| UX / accessibility polish | `web-design-guidelines` | vercel-labs | `npx skills add vercel-labs/agent-skills --skill web-design-guidelines -a claude-code` |
| Review-feature component design | `composition-patterns` | vercel-labs | `npx skills add vercel-labs/agent-skills --skill composition-patterns -a claude-code` |
| Security — flags fallback/hardcoded secrets, fail-open auth | `insecure-defaults` | trailofbits | `/plugin marketplace add trailofbits/skills` (plugin) |
| Security review of diffs (CORS, rate-limit, auth) | `differential-review` / `static-analysis` | trailofbits | same marketplace |
| Verify the review flow in a real browser | `webapp-testing` | anthropics | `/plugin marketplace add anthropics/skills` (plugin) |

**Honest gaps:** there is **no first-party Vitest/supertest skill** — that backend test
layer we hand-write. No first-party Express/JWT/CORS skill either (closest is Auth0's, only
relevant if we adopt Auth0). The built-in **`/security-review`** and **`/code-review`**
commands already cover a lot; install third-party security skills *in addition to*, not
instead of, them.

**My recommendation:** start with **two** — `vercel-react-best-practices` and
`web-design-guidelines` — because the next real work is the review-loop UI and our audit
flagged real UX/a11y gaps. Defer everything else until we have a reason. *Open question
below.*

---

## 2. Build subagents to create

Claude Code subagents live in `.claude/agents/<name>.md` (YAML frontmatter: `name`,
`description`, optional `tools`, `model`). These map 1:1 to roadmap work so each future
task has a specialist that already knows our conventions.

| Subagent | Purpose | Tools | When invoked |
|---|---|---|---|
| **`bff-engineer`** | Backend specialist: Express 5 + Mongoose + the `tmdbClient` read-through cache, JWT/Joi patterns. Owns review-loop backend + the missing `Review` index. | write | Backend feature/fix work |
| **`web-ui-engineer`** | Next.js 16 App Router / React 19 / RSC / Radix / Tailwind, UX & a11y-minded. Owns mounting the composer + first-party reviews on detail pages. | write | Web UI work |
| **`contract-guardian`** | *The one that would've caught the review 400.* Verifies backend envelopes (`{movie}`/`{show}`/bare-array) match client decoders + types. | read-only | Review any diff touching API shapes |
| **`test-author`** | Writes Vitest + supertest (backend route/cache, frontend store) — today there are zero. Feeds the 90-day CI spine. | write | After a feature is wired |
| **`security-reviewer`** | JWT/CORS/rate-limit/secrets/input-validation lens; pairs with `/security-review` + the Trail of Bits skills. | read-only | Pre-merge on auth/proxy changes |

**My recommendation:** create `contract-guardian` + `web-ui-engineer` + `bff-engineer`
first (they directly serve the review-loop vertical), add `test-author` when we start the
test spine, and treat `security-reviewer` as optional given the built-in `/security-review`.

---

## 3. Critic subagents — do we want one?

**Short answer: yes — exactly one, and it should be specific to this project's failure
mode.** Be careful here: a critic-per-dimension is precisely the cargo-culting the audit's
Skeptic warned about. More critics ≠ better; they add noise and review latency. The
discipline is to institutionalize the *one* check that this codebase has repeatedly failed.

### 🎯 Strongly recommended: `reality-critic` (a.k.a. integration critic)

**Why this one.** The defining defect in the audit wasn't bad code — it was **code built in
isolation that was never integration-checked**: `ReviewComposer` imported by no page, detail
pages rendering TMDB's reviews instead of ours, three different review payload shapes, dead
`apiClient.ts`. The project's signature failure is **"dead code wearing a feature costume."**
A `reality-critic` is the institutional antibody for exactly that.

- **Mandate:** for any feature claimed "done," adversarially prove it is **reachable and
  real** end-to-end. Questions it must answer: *Is this component imported by a page a user
  can navigate to? Does the payload it sends match what the server accepts? Does the data
  rendered come from where we claim? Is there a second/third shape of this same concept?*
- **Tools:** read-only (grep/read/run). Should be willing to actually exercise the path.
- **Model for it:** this is the same adversarial-verify pattern that refuted 3 findings in
  the original audit — high-value, worth a capable model and a skeptical prompt
  ("default to *not reachable* unless you can show the path").

### 🤔 Worth considering: `scope-critic` (pragmatism critic)

Challenges premature abstraction, gold-plating, and scope creep — the "Shipper/Skeptic"
voice made standing. Would push back on *"let's build the `@flixr/contract` workspace now"*
when deleting the duplicate is cheaper (see [DISCUSSION.md](./DISCUSSION.md)). **Lighter
need than `reality-critic`**, and partly served by a disciplined human reviewer. Propose as
optional.

### ❌ Probably cargo-culting (don't create as separate critics)

- A dedicated **UX critic** → fold into `web-ui-engineer`'s mandate + the
  `web-design-guidelines` skill.
- A dedicated **product critic** → that's a periodic human/strategy conversation
  ([PROJECT_IDEA.md](./PROJECT_IDEA.md)), not a per-diff agent.
- A **security critic** separate from `security-reviewer` + `/security-review` → redundant.

**My recommendation:** create **`reality-critic`** (high value, project-specific). Hold
`scope-critic` as a maybe. Reject the rest to avoid critic sprawl.

---

## 4. Open decisions checklist

Decide these, then promote the accepted items to [ROADMAP.md](./ROADMAP.md):

- [ ] **Skills:** install the two recommended (`vercel-react-best-practices`,
      `web-design-guidelines`) project-scoped? Or none until the review loop is underway?
- [ ] **Skills governance:** do we commit `skills-lock.json` and require a diff-review rule
      before any `.claude/skills/` change lands?
- [ ] **Build subagents:** scaffold the first three (`bff-engineer`, `web-ui-engineer`,
      `contract-guardian`) now?
- [ ] **Critic:** approve `reality-critic`? Yes/No on `scope-critic`?
- [ ] **Ownership model:** do critics run automatically pre-merge (hook), or on-demand?
- [ ] Anything here that's actually a distraction from the review-loop vertical → cut it.

> Reminder of the through-line: none of this outranks **making one community vertical
> true** ([DISCUSSION.md](./DISCUSSION.md) consensus). Tooling should accelerate that, not
> become the project.
