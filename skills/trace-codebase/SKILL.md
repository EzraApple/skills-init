---
name: trace-codebase
description: Use when onboarding to an unfamiliar repository, module, service, feature, or execution path; answering how a subsystem works; mapping architecture before a change; or identifying the exact entrypoints, boundaries, contracts, and files to read first.
---

# Trace Codebase

Produce an evidence-backed map of a subsystem that is smaller than the code
explored. Explain the representative flow, ownership boundaries, and change
seams without turning the result into an encyclopedia.

## Route Nearby Work

- Use `systematic-debugging` for an active failure needing a causal diagnosis.
- Use `plan-changes` once the task is to choose and sequence modifications.
- Use review skills for evaluating an existing diff.
- Answer small factual lookups directly.

## Resolve the Scope

Translate the requested area into concrete paths, symbols, routes, commands, or
runtime entrypoints.

Start with cheap discovery:

- repository guidance and package manifests;
- directory and export structure;
- named routes, commands, events, schemas, or UI entrypoints;
- tests and examples that exercise the behavior;
- direct callers and consumers.

If the area is large, select one representative flow and state what is excluded.
Ask for clarification only when different interpretations would produce
materially different maps.

## Trace a Representative Flow

Follow real code through the relevant stages:

```text
external entry -> validation/auth -> orchestration/domain logic
-> persistence or external side effect -> returned or visible result
```

Adapt the stages to the system. Capture:

- where execution starts;
- the important data shapes and contracts;
- where decisions and invariants live;
- state ownership and lifecycle;
- error and cancellation behavior;
- persistence, network, queue, filesystem, or process boundaries;
- configuration, generated code, and feature gates that change behavior;
- the consumers that constrain safe changes.

Read enough surrounding code to distinguish a real boundary from a helper that
only forwards data.

## Use History Selectively

Read git history, issue context, or design docs when they can explain:

- why a surprising boundary exists;
- whether behavior is a compatibility constraint;
- where a regression or migration began;
- which prior approach should be reused or avoided.

Do not infer intent from authorship or commit age alone. Current code is primary
evidence for current behavior.

## Keep a Provenance Ledger

Classify important claims:

| Claim source | How to present it |
| --- | --- |
| Current code or test | Cite the path and symbol or line. |
| Runtime observation | Name the command, log, trace, or UI state. |
| Documentation or history | Link or cite the exact source. |
| Inference | Label it explicitly and state the supporting evidence. |

Preserve conflicts between sources instead of smoothing them into certainty.

## Produce the Map

Use only sections that help the reader:

```markdown
# <Subsystem>

## What It Does
<one compact explanation>

## Boundary Map
<entrypoints, owners, dependencies, and consumers>

## Representative Flow
<step-by-step data and control flow>

## Key Contracts and Invariants
<what callers and maintainers must preserve>

## Failure and State Behavior
<important error, retry, lifecycle, or consistency paths>

## Change Seams
<where likely changes belong and what they affect>

## Read First
1. <path> -- <why>

## Unknowns
<material questions not answered by current evidence>
```

Use a diagram only when three or more moving parts are materially clearer
visually. Use code excerpts only when the exact shape matters; do not satisfy
arbitrary diagram or snippet quotas.

## Stop at Understanding

Do not silently turn orientation into implementation or redesign. Finish when a
new engineer can explain the main flow, name the owning boundaries, and know
which files and witnesses matter for the next task.
