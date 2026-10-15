---
name: systematic-debugging
description: Diagnose a bug, regression, flaky result, or unexplained slowness when its cause is not established.
---

# Systematic debugging

Treat a plausible explanation as a hypothesis until evidence distinguishes it
from competing causes. Diagnosis alone does not authorize a fix.

Establish the expected result, observed failure, triggering input, environment,
and last known good state when available. Separate the reported symptom from
the reporter's proposed explanation.

## Find the first divergence

Reproduce on the failing surface, or identify the strongest available evidence
and its limits. Trace backward from the wrong result through actual callers,
state changes, and boundaries. Locate the earliest point where an invariant
fails, rather than the last place an exception appears.

When several causes fit, record what would distinguish them and run the cheapest
discriminating probe. Keep evidence that ruled a cause out. If repeated attempts
fail, question the shared premise or improve the observation method before
adding another workaround.

- For measured speed or resource claims, read [benchmarks.md](references/benchmarks.md).
- For CPU profiles, traces, or heap captures, read [runtime-artifacts.md](references/runtime-artifacts.md).

## Repair and verify

When fixes are requested, change the boundary that owns the violated invariant.
Avoid adding retries, delays, or guards unless they implement the actual
contract. Preserve unrelated behavior and external compatibility.

If an existing local test can cheaply capture the defect, show it failing for
the intended reason before the fix and passing afterward. Otherwise use the
closest stable reproduction; do not build a broad test harness for ceremony.

Rerun the original failing path and the nearby path implicated by the cause.
For intermittent failures, compare repeated observations. Report the mechanism,
evidence, repair or recommendation, and any environment still unverified.
