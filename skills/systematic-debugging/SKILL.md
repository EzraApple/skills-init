---
name: systematic-debugging
description: Use when behavior is broken, regressed, flaky, inconsistent, unexpectedly slow, or failing in tests, local development, CI, staging, or production and the root cause is not yet proven. Use for diagnosis before proposing or implementing a fix.
---

# Systematic Debugging

Find the causal mechanism before changing code. Treat logs, traces, failing
tests, runtime state, and exact reproduction output as evidence; treat plausible
code as a hypothesis.

## Preserve the Requested Boundary

Diagnosis does not imply authorization to fix. Stay read-only when the user asks
for investigation, explanation, or review. If the user asks to fix the problem,
diagnose first and then make the smallest causal change.

## Pin Down the Failure

Record:

- actual behavior, including exact errors or wrong output;
- expected behavior and the source of that expectation;
- environment, input, identity, and relevant configuration;
- frequency and timing;
- last known good version, deploy, or state when available;
- the witness that can reproduce or directly observe the failure.

Separate the reported explanation from the observed symptom. Users are reliable
about what they experienced; their proposed cause is still a hypothesis.

## Trace Before Hypothesizing

1. Reproduce or observe the failure with the closest available witness.
2. Start at the visible failure and trace control and data backward toward the
   earliest divergence.
3. Read full functions and directly relevant callers instead of judging an
   isolated diff or matching filename.
4. Inspect recent history only when regression timing or design rationale can
   narrow the cause.
5. Identify the invariant that should have held and the boundary that owns it.

If reproduction is unsafe or unavailable, state that limitation and use the
strongest static or runtime evidence available.

## Maintain a Hypothesis Ledger

Use a small ledger when more than one cause is plausible:

| Hypothesis | Supporting evidence | Contradicting evidence | Next discriminating probe | Status |
| --- | --- | --- | --- | --- |
| Specific causal claim | Concrete observation | Concrete observation | One check that separates it from alternatives | open / confirmed / ruled out |

Form hypotheses that can be falsified. Prefer one probe that distinguishes
several hypotheses over several probes that merely collect more logs.

Mark disproven hypotheses as ruled out; do not quietly replace them. If repeated
probes fail, widen the boundary or improve instrumentation rather than promoting
the most plausible guess.

## State Root Cause Precisely

A root-cause statement must name:

- the triggering input, event, or state;
- the responsible boundary or operation;
- the incorrect mechanism or missing invariant;
- how that mechanism produces the observed symptom;
- the evidence that confirms the chain.

"A race condition," "bad state," or "the cache" is a category, not a root cause.

## Fix at the Owning Boundary

When fixes are in scope:

1. Change the smallest boundary that owns the violated invariant.
2. Avoid retries, delays, refreshes, broad null guards, or duplicated checks
   unless they are the actual contract.
3. Preserve unrelated behavior and public compatibility unless the root cause
   requires a deliberate contract change.
4. Add a stable regression witness when it meaningfully prevents recurrence.
   Do not manufacture brittle tests for behavior better proven elsewhere.

## Verify the Repair

- Re-run the original reproduction or observe the original failure surface.
- Run the narrow checks for the changed boundary.
- Exercise the important negative or edge path implicated by the cause.
- For intermittent failures, compare repeated baseline and treatment runs.
- For environment-specific failures, verify in that environment or state
  clearly what remains unproven.

A new unit test alone does not close a production symptom unless it exercises
the confirmed mechanism.

## Report

Use this compact structure:

```markdown
Symptom: <observed failure>
Root cause: <trigger + mechanism + owning boundary>
Evidence: <what proved the causal chain>
Fix: <change made, or recommended if report-only>
Verification: <original reproduction plus focused checks>
Remaining uncertainty: <none, or the exact unverified boundary>
```
