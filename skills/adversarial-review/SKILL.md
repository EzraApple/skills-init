---
name: adversarial-review
description: Review a PR, diff, or plan using reviewer and validator subagents in fresh context windows. Use for adversarial review, an independent second opinion, or a change-impact audit.
---

# Adversarial review

Use fresh reviewer and validator subagents to find issues that survive an attempt
to disprove them. A clean review is useful; finding volume is not a measure of
quality. The parent agent coordinates, checks evidence, and synthesizes the result.

Review requests are read-only. Apply fixes only when the user's request also
authorizes them. A writable checkout does not supply that authorization.

## Establish the change

Resolve the requested files, diff, or plan and its intended behavior. Inspect the
base and current revision, including local changes when relevant. If the revision
changes during review, identify which conclusions need checking again.

Trace changed behavior through representative callers and state transitions.
Look for violations of actual contracts: failure handling, ordering, permissions,
compatibility, persistence, and recovery. A concern needs a reachable trigger and
a consequence, not just an unfamiliar pattern.

Read only the relevant additional lens:

- For breakage beyond the diff, read [change-impact.md](references/change-impact.md).
- For caller-facing API or component design, read [interfaces.md](references/interfaces.md).

## Review in fresh contexts

Start each reviewer in a fresh context window without inherited conversation
history. Give reviewers the same concise packet: the user request, scope,
constraints, base and current revisions, diff or plan, and paths to relevant
project guidance. Add each reviewer's risk focus. Exclude the builder's reasoning,
prior conclusions, and other reviewers' findings.

Choose distinct risk lanes from the changed surfaces and requested scrutiny,
such as correctness, security, interfaces, or operations. Keep reviewers read-only
and independent until their passes finish. Require a concrete failure path,
location, evidence, and focused correction for each finding.

If fresh subagents are unavailable, disclose that limitation. Sequential passes
in one context do not provide the same independence.

## Challenge findings independently

Cluster candidate findings by root cause. Give each material cluster to a fresh,
read-only validator subagent with the scope, code, and claim to challenge. Do not
reuse its reviewer or inherit the implementation conversation. The validator's
job is to disprove the finding using caller preconditions, existing guards,
pinned library behavior, tests, or a focused probe.

The parent checks the evidence and drops disproven concerns and style preferences
whose benefit does not justify the churn. Agreement between agents is not proof.

## Return the useful result

Lead with actionable findings, ordered by impact. Give each finding a location,
trigger, consequence, supporting evidence, and a focused correction. Label
material uncertainty. If none survive, say so and name the important coverage
and gaps. When fixes are authorized, check the original behavior and use fresh
subagents to re-review affected risks after the change. Stop when no actionable
findings remain or the remaining work needs a user decision or exceeds scope.
