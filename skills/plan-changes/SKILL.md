---
name: plan-changes
description: Use when writing or reviewing an implementation plan, scoping a refactor, designing a feature, choosing between architectural approaches, or turning a broad change request into a decision-complete sequence of independently verifiable steps. Do not use for active root-cause investigation.
---

# Plan Changes

Produce the smallest decision-complete plan that reaches the requested outcome.
A good plan resolves meaningful choices, preserves explicit constraints, and
gives every implementation step its own proof.

## Establish the Planning Boundary

Determine from the request and repository:

- observable outcome and user or system impact;
- current implementation and owning boundary;
- hard constraints, compatibility promises, and authority limits;
- existing code, primitives, or patterns worth reusing;
- non-goals and adjacent work;
- irreversible operations or rollout concerns.

Ask the user only about product, policy, or architecture choices that code and
available evidence cannot answer. Do not ask them to locate files or explain
facts you can inspect.

For an active failure whose cause is unknown, use `systematic-debugging` before
planning a fix.

## Choose the Shape

Start with the direct version: what is the smallest coherent change that solves
the stated problem?

For a non-trivial decision, compare only materially distinct approaches. Include
the minimal approach and a more durable boundary when both are credible. Do not
invent a third option to fill a template.

For each real option, state:

- what changes;
- what it reuses;
- the new coupling or concept it introduces;
- compatibility and rollout implications;
- the condition under which it is the better choice.

Recommend one and say what evidence would change the recommendation.

## Write the Change Contract

Before the steps, summarize:

```markdown
Outcome: <observable result>
Current boundary: <where behavior lives now>
Chosen approach: <one sentence>
Invariants: <behavior and contracts that must remain true>
Non-goals: <related work excluded>
Assumptions or decisions: <only material unresolved items>
Likely edit surfaces: <paths or components and why>
```

Use example inputs, outputs, schemas, or before/after code when a contract shape
is otherwise ambiguous. Do not require code samples for mechanical changes.

## Build Verifiable Steps

Each step must:

1. Make one coherent change.
2. Explain why it is necessary for the outcome.
3. Name the owning files, symbols, or boundaries.
4. State the expected behavior or contract after the step.
5. Name the narrow witness that proves the step.
6. Leave the repository in a coherent state, or explain why an atomic group is
   required.

Prefer dependency order: establish shared contracts before consumers, preserve
old/new compatibility during migrations, and remove old paths only after callers
move.

Estimate file count or rough diff size only when inspection supports it. Do not
invent calendar estimates.

## Cover Relevant Risk Paths

Check only the dimensions implicated by the change:

- missing, empty, invalid, or oversized input;
- failure, timeout, retry, and partial completion;
- concurrency, duplication, stale state, and idempotency;
- authorization and trust boundaries;
- old and new versions running simultaneously;
- data migration, rollback, and irreversible writes;
- user-visible loading, error, recovery, and accessibility states.

Turn real risks into plan steps, verification, or explicit non-goals. Avoid a
generic checklist dump.

## Finish the Plan

Use this compact output:

```markdown
## Change Contract
<outcome, boundary, approach, invariants, non-goals>

## Implementation
### 1. <verb + boundary>
Why: <reason>
Change: <specific shape>
Verify: <claim-matched witness>

## Rollout and Rollback
<only when relevant>

## Risks and Open Decisions
<material items only>

## Not in Scope
<explicit exclusions, or "Nothing deferred">
```

Before presenting, remove any step that does not serve the outcome, resolve
choices an implementer would otherwise have to guess, and ensure the proposed
evidence can actually prove success.

When implementation is also authorized, use `outcome-first-workflows` to execute
against the contract.
