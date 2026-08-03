---
name: interface-review
description: Use when reviewing a diff, pull request, or changed files for caller-facing interface quality across APIs, exported functions, service methods, hooks, component props, schemas, commands, events, or extension points. Focus on boundary shape rather than general correctness.
---

# Interface Review

Review public and shared boundaries from the caller's perspective. Determine
whether the common call path is obvious, whether the boundary owns one coherent
job, and whether callers can use it without learning implementation details.

## Route Nearby Work

- Use `adversarial-review` for broad correctness, security, operational, or
  high-scrutiny review.
- Use `simplify` for internal complexity that does not affect callers.
- Use `plan-changes` when no implementation exists yet.

## Select the Boundaries

Inspect changed:

- APIs, commands, events, schemas, and serialized messages;
- exported functions, classes, service methods, and libraries;
- hooks, shared components, callbacks, and extension points;
- configuration surfaces and feature switches;
- errors, return values, async behavior, and side effects visible to callers.

Trace actual callers and nearby existing boundaries. Do not evaluate an
interface in isolation from how it is used.

## Ask the Caller Questions

For each boundary:

1. What job is the caller trying to do?
2. Does the name describe that job and its side effects?
3. Are required inputs, defaults, modes, return values, errors, and lifecycle
   behavior explicit?
4. Does the caller need to know this provider, transport, storage, or framework
   detail?
5. Does an existing boundary already partly solve the same job?
6. Would a new caller know which of the overlapping entrypoints to choose?
7. Can the interface evolve without forcing unrelated callers to change?

## High-Signal Problems

Prioritize:

- near-duplicate entrypoints for the same caller job;
- optional input whose omission silently selects a different workflow;
- boolean flags or mode strings that combine unrelated behavior;
- several primitives that travel together but represent one domain concept;
- a large options object that only relocates confusion;
- query-like names that hide writes, notifications, or network effects;
- provider, storage, transport, or framework leakage;
- nullable or ambiguous return values without a caller-visible reason;
- extensibility machinery with one implementation and no demonstrated second
  consumer;
- breaking changes without a deliberate migration or version boundary.

## Prefer Caller Improvements

Use the smallest fix that improves the caller's mental model:

- rename by intent;
- make modes explicit and mutually exclusive;
- group inputs only when they form a nameable domain concept;
- separate queries from commands and pure logic from side effects;
- replace implementation-specific inputs with stable domain language;
- extend or reshape an existing boundary instead of adding a parallel one;
- merge or delete near-duplicates;
- preserve a compatibility adapter when it protects a real external contract.

Do not create an abstraction merely to make the implementation look tidy.
Internal elegance is not an interface benefit unless callers gain clarity,
safety, or stability.

## Validate Findings

Before reporting:

- cite the exact boundary and representative callers;
- confirm that the proposed replacement handles every distinct caller job;
- identify compatibility and migration cost;
- distinguish a harmful public shape from a local style preference;
- drop findings whose benefit does not exceed the churn.

## Report Only the Leverage

Return few, concrete findings:

```markdown
1. `<boundary>`
   Caller problem: <confusion, duplication, leakage, or hidden behavior>
   Evidence: <representative callers and competing boundary>
   Better shape: <proposed interface>
   Migration: <callers, compatibility, and risk>
```

If no interface finding survives, say so and name the important boundaries and
caller patterns checked.
