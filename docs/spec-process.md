# How We Write Specs

> This document describes the collaborative process between a developer and an AI agent for
> producing implementation specs that can be handed off to an executing agent with no context.
> Follow this process for every new spec.

## The Collaboration Model

The developer owns the vision and makes all architectural decisions. The agent does the
research, audits the codebase, identifies gaps, writes the spec, and surfaces ambiguities for
the developer to resolve. Neither works alone — the developer without the agent misses codebase
details, the agent without the developer makes wrong architectural choices.

**Roles:**

- **Developer:** Sets the goal, makes decisions when there are multiple options, clarifies
  ambiguities, reviews and approves
- **Agent:** Audits codebase, identifies what exists vs what's assumed, drafts spec content,
  surfaces questions, iterates based on feedback

## Phase 1: Understand the Goal

The developer describes what they want. The agent does NOT start writing immediately. Instead:

1. **Ask clarifying questions** — What's the scope? Is this a new feature, a refactor, or
   filling a gap? What's the end state look like from the consumer's perspective?
2. **Check for existing context** — Read related specs in `docs/specs/`, check
   `docs/archive/GENERATION_CHAT.md` in the bunshot repo for vision context on how Snapshot
   should evolve. Key areas from that chat:
   - **Code-first app bootstrap** — `createSnapshot({ apiUrl, auth, ws, sse })` plus explicit React composition
   - **Design token system** — semantic color/spacing/radius/font tokens, breakpoint-aware values, component-level tokens, dark/light mode as token switch
   - **Standalone components** — each component exposes plain React props and composes with app-owned data fetching and state
   - **Inter-component data binding** — `id` + `{ "from": "id" }` ref pattern for reactive cross-component state
   - **Action vocabulary** — fixed set: navigate, api, open-modal, refresh, set-value, download, confirm, toast
   - **Interaction presets** — named tokens (lift, glow, fade-in) + duration tokens; breakpoint-aware layout
   - **Code escape hatch** — Monaco editor in browser for custom components; `generated/` is never hand-edited
   - **bunshot sync evolution** — generates API types, hooks, and optional app scaffolds from OpenAPI
   - **Selective hook syncing, multi-client generation, offline docs, apps-within-apps, SSR**
3. **Confirm scope** — Restate the goal back to the developer. Get alignment before researching.

## Phase 2: Audit the Codebase

Before writing a single line of spec, audit what actually exists. This is the most important
step — every spec that skipped it had inaccurate assumptions.

1. **Run explore agents in parallel** to check:
   - Do the files/modules the developer mentioned actually exist?
   - What types and interfaces are already defined in `src/` and `src/types.ts`?
   - What patterns does the existing code follow (factory hooks, contract pattern, SSE
     registry, template pure functions)?
   - What's the current state of any related work (branches, partial implementations)?
2. **Read the actual code** — Don't trust prior conversation summaries or assumptions. Read
   the files. Check line numbers. Verify.
3. **Audit JSDoc and docs impact** — As part of the same audit, check:
   - Which exported symbols will be added or changed? Do they already have JSDoc?
   - Search `docs/` for pages that cover the affected features, hooks, or API surface.
   - This is not a template to fill in later — identify specific files and gaps now.
4. **Report findings to the developer** — "Here's what actually exists. Here's what's
   different from what we assumed. Here's what docs/JSDoc will need updating." This often
   changes the scope.

**Key patterns to check in every audit:**

- Does the new hook follow the factory-closure pattern in `create-snapshot.tsx`?
- Does the new contract follow the `AuthContract` / `communityContract` pattern?
- Does the new CLI template return a pure string with no filesystem side effects?
- Does the new module add to `src/index.ts` exports correctly?

## Phase 3: Identify Gaps Together

With the audit complete, the agent presents:

1. **What exists and works** — No spec needed for this.
2. **What's partially done** — What's left to finish?
3. **What's missing entirely** — New work needed.
4. **What was assumed to be a gap but isn't** — Remove from scope.

The developer reviews and adjusts. Some "gaps" turn out to be intentional. Some "done" items
turn out to be incomplete. This is a conversation, not a report.

## Phase 4: Design Solutions Together

Before writing implementation details, the agent and developer think through the architecture
together. This is a conversation where both sides push on the design until it's right.

### The Agent's Responsibility

The agent should propose solutions that are:

- **Clean** — No hacks, no workarounds, no "we'll fix this later."
- **Maintainable** — Understandable to a new contributor in 6 months.
- **Industry-standard** — Use proven patterns. Reference where the pattern comes from.
- **Consistent with existing patterns** — New hooks follow the factory-closure model. New
  contracts follow the contract pattern. New templates are pure functions.

**Present options AND have an opinion.** Show the options, state which you'd pick and why.
Don't be passive.

### When There Are Multiple Valid Approaches

- Present no more than 2-3 options
- Each option gets: what it is, why you'd pick it, what you give up
- State which one you'd lean toward and why
- Let the developer decide

### The Conversation Pattern

1. Agent proposes an approach with rationale
2. Developer asks "why not X?" or "what about Y?"
3. Agent either explains why the proposal handles that, or admits the gap and adjusts
4. Repeat until both are satisfied

## Phase 5: Write the Spec Iteratively

1. **First draft** — Get the structure and phases down. Types, rough implementation, exit
   criteria. Push it.
2. **Developer reviews** — They'll catch missing details, wrong assumptions, ambiguities.
3. **Detail pass** — Re-read the spec against the actual code. Cross-reference every file
   path, type name, export. Fix gaps.
4. **Ambiguity pass** — Read the spec as if you have zero context. Every place you'd have to
   guess is a place the executing agent will guess wrong. List ambiguities, ask the developer
   to resolve them.
5. **Final pass** — Incorporate all decisions. Verify phase numbering, file lists, and
   sequencing tables are consistent.

Each pass is a commit.

## Phase 6: Resolve All Ambiguity

Before handoff, ask: "If I were an agent with no context reading this for the first time,
where would I have to guess?" Common ambiguities in this codebase:

- **"Which file does this go in?"** — Give the exact path under `src/`.
- **"Does this export from index.ts?"** — State explicitly.
- **"Does this hook live inside `createSnapshot` or is it standalone?"** — Resolve explicitly.
- **"Does this contract key follow the existing naming?"** — Show the exact key.
- **"Does this template function take any parameters?"** — Show the full signature.
- **"How does the consumer import this?"** — Show the import path.

Ask the developer every unresolved question. Don't guess. Don't defer with "TBD."

## Phase 7: Parallelization and Handoff

The spec must be executable by an agent that has never seen the codebase:

1. **Separate tracks on separate branches** — List which files each track owns. Prove they
   don't conflict.
2. **Sequential phases within tracks** — Show dependency tables (what each phase needs from
   the prior).
3. **Definition of Done per phase** — Testable, not vague. Run these commands. These tests
   must pass.
4. **Branch strategy** — Push branch, don't merge. Review before merge.
5. **Agent execution checklist** — Step-by-step: read rules, read spec, pick track, implement
   phase by phase, run checks, commit, push.
6. **Docs/JSDoc verification is not delegated to the spec** — The implementing agent must
   independently verify JSDoc and `docs/` impact before closing each phase. The spec's
   documentation section is a starting point, not a complete list.

---

## Spec Document Structure

```markdown
# Title — Canonical Spec

> Status table (phase | status | track)

## Vision

What this changes and why. The "before" picture and the "after" picture.

## What Already Exists on Main

Audited, not assumed. File paths, what's implemented, what's partial.

## Developer Context

- Build & Test commands
- Key Files table (path | what | line count)
- Current pattern (the "before" code)
- How the consumer uses this today vs. after

## Non-Negotiable Engineering Constraints

Rule numbers from `docs/engineering-rules.md` with one-line descriptions.

## Phase N: [Title]

- Goal (1-2 sentences)
- The API (full usage example for the first phase)
- Types (exact TS interfaces with JSDoc)
- Implementation (exact code patterns)
- Files to Create/Modify (exact paths)
- Documentation impact (which `docs/` pages to create or update)
- Exit Criteria (testable assertions)
- Tests (exact file paths)

## Parallelization & Sequencing

- Track overview
- Why tracks are independent (file ownership)
- Branch strategy + review process
- Per-track internal sequencing tables
- Agent execution checklist
- Risk mitigation per track

## Definition of Done

- Per-phase checks (commands to run)
- Per-track checks (formatting, no casts, tests)
- Documentation checks (JSDoc updated; `docs/` pages created or updated)
- Full completion checks
```

---

## Principles

1. **Audit before you write.** Reading the code is faster than rewriting a wrong spec.
2. **Lead with a recommendation.** Be opinionated, explain why, let the developer push back.
3. **Design together.** The best solutions come from the agent proposing and the developer
   challenging.
4. **Options are good. Opinions are required.**
5. **Clean, maintainable, consistent with existing patterns.** No hacks.
6. **Ambiguity is a bug.** If an executing agent would have to guess, the spec isn't done.
7. **Types are the contract.** Get the interfaces right; implementation follows.
8. **Every phase leaves the codebase green.**
9. **Commit each pass.**
10. **Docs ship with the feature.** JSDoc and `docs/` pages are part of the deliverable.
11. **Verify token usage against the canonical list.** Every spec that touches UI components
    must reference the Token Usage Rules in `CLAUDE.md` / `docs/engineering-rules.md`. The
    spec must list every CSS variable the new component will use and verify each one exists
    in the canonical token list. Invented variable names are the #1 source of visual bugs.
12. **Specs for UI components must include playground integration.** The spec must define
    how the component appears in the playground — what config/fixture data it uses, what
    states to showcase (loading, error, empty, populated), and how it responds to token
    changes (colors, font sizes, radius, spacing). A component that isn't in the playground
    is untested visually.
