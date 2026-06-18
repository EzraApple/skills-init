---
name: adversarial-review
description: Use when the user asks for adversarial, independent, skeptical, panel, multi-agent, second-opinion, high-scrutiny, security-minded, or critical review of a PR, branch diff, uncommitted changes, changed files, plan, or specific paths.
user-invocable: true
argument-hint: "[PR_OR_DIFF_OR_PATH]"
---

# Adversarial Review

Use this when ordinary review is not enough. The workflow is independent
criticism, root-cause clustering, attempted takedown of findings, synthesized
action items, and reruns after fixes when edits are in scope.

The goal is not to generate more comments. The goal is to find the issues that
survive skeptical validation.

## Core Rules

- Reviewer and validator passes are readonly. Edit only after synthesis, and
  only to address validated action items.
- Do not reuse the implementation chat as evidence. Reviewers get the review
  packet, not the builder's defense of the code.
- No issue quota. A clean review is valid if the probes were meaningful.
- Every finding needs a concrete failure path, target file or symbol, evidence,
  and suggested fix.
- Vague concerns are not findings.
- The user gets a synthesized action list, not raw reviewer transcripts.
- Default to the hardening loop unless the user asks for report-only review.

If your runtime supports subagents, use fresh readonly subagents for reviewer and
validator passes. If it does not, run the same lanes sequentially in fresh notes:
reset assumptions between lanes, do not edit during lane work, and do not let one
lane's findings bias another until clustering.

## Scope Selection

Pick the narrowest concrete scope before launching reviewer lanes:

1. If the user gives a PR URL or number, review that PR with the local GitHub
   tooling available in the environment.
2. If the user names files or directories, review those paths plus directly
   relevant callers.
3. If the user gives a base or revision range, review that diff.
4. If the current branch has a resolvable PR, review that PR.
5. Otherwise review the branch diff from the default branch using the merge
   base.
6. Otherwise review staged, unstaged, and untracked changes.

If the resolved diff is empty, stop and say there is nothing to review.

## Dimension Selection

Choose lanes from the user's requested dimensions, changed surfaces, and risk
profile. Do not run the same fixed panel every time.

1. Extract explicit dimensions and exclusions from the prompt.
2. Infer additional dimensions only when materially relevant.
3. Skip unrelated default lanes.
4. Use one lane for a narrow requested dimension, two or three for moderate
   risk, and four or more only for broad PRs or explicit high-scrutiny requests.
5. Ask for clarification only when two plausible lane sets would produce
   materially different reviews.

Record selected lanes and skipped obvious lanes in the final coverage section.

## Review Packet

Create one lean packet and pass the same packet to every reviewer lane.

Include:

- user request, requested dimensions, exclusions, and selected scope;
- PR title/body or local change summary when available;
- issue/ticket links when available;
- diff command used and changed file list;
- full diff or focused patch for the selected scope;
- on reruns, the disposition ledger from prior rounds.

Reference project guidance by path instead of inlining it. Reviewers may read
`AGENTS.md`, local skill docs, package docs, and full files needed to prove or
kill a finding.

Do not include implementation plans, parent-agent notes, or private reasoning
unless the user explicitly asks to review against them.

## Lane Templates

Use these as starting points. Add or remove lanes based on the task.

| Lane | Focus question | Use for |
| --- | --- | --- |
| Correctness Critic | How does this break in production? | Runtime behavior, data flow, state, cache, idempotency, regression risk. |
| Security Critic | What can a hostile user, integration, or prompt do with this? | Auth, authorization, injection, secret exposure, unsafe logs, trust boundaries. |
| Architecture Minimalist | Is this the smallest maintainable shape? | Abstractions, duplicated pathways, wrong-layer fixes, interface bloat. |
| Interface Critic | Does the public boundary make the caller's job clear? | APIs, schemas, hooks, component props, CLI flags, cross-package contracts. |
| Test And Ops Critic | What will make this hard to verify, deploy, roll back, or debug? | Missing failure-path tests, migrations, observability, version skew, flaky assumptions. |
| Product Or UX Critic | Does behavior match the expected user outcome? | Visible behavior, copy, loading/error states, accessibility, workflow fit. |

Add domain lanes when warranted: migration safety, performance, prompt injection,
data correctness, accessibility, payments, privacy, or package publishing.

## Reviewer Output Contract

Each reviewer returns Markdown with this shape:

```markdown
## <Reviewer Lane>

Verdict: BLOCK | CONCERNS | CLEAN

### Findings

1. ID: <stable lane-local id>
   Severity: CRITICAL | WARNING | NOTE
   Confidence: HIGH | MEDIUM | LOW
   Target: `<path>` / `<symbol or line if known>`
   Problem: <one sentence>
   Evidence: <specific code path and why existing guards do not cover it>
   Failure path: <input/event/state that triggers the issue>
   Suggested fix: <concrete remediation>

### Probes That Survived

- <meaningful checks that did not produce findings>
```

Severity rubric:

- `CRITICAL`: merge-blocking correctness, data loss, security, or broken
  existing contract.
- `WARNING`: should be fixed, but not merge-blocking.
- `NOTE`: informational; never becomes an action item on its own.

If there are no findings, the reviewer still lists probes that survived.

## Clustering And Validation

Cluster first, then validate clusters. Never run one validator per raw finding.

1. Cluster candidate findings by root cause, not by file or reviewer.
2. Drop clusters made only of NOTE-severity or evidence-free findings.
3. Run one fresh readonly validator pass per remaining cluster.
4. The validator's job is to kill the finding, not defend it.

Validator output:

```markdown
## Validation

1. Cluster: <finding ids>
   Disposition: action-item | omit | needs-human
   Evidence: <code evidence for or against the finding>
```

Use `omit` for disputed, unproven, or confirmed-but-trivial findings. Keep a
disputed finding only when the disagreement itself changes what the user should
decide.

## Synthesis

The parent agent synthesizes. Do not paste raw reviewer reports.

1. Convert `action-item` clusters into action items.
2. Route `needs-human` clusters to a human-decision bucket.
3. Rank by merge-blocking impact, then user risk, then maintenance cost.

Verdict mapping describes the final diff after any fixes:

- `BLOCK`: at least one validated CRITICAL finding remains unfixed.
- `CONCERNS`: validated non-blocking action items or human decisions remain.
- `CLEAN`: no validated findings remain.

## Iterative Hardening Loop

Use this loop by default when edits are in scope.

1. Run reviewer lanes, clustering, validation, and synthesis.
2. If validated action items remain and the local worktree is editable, fix them.
3. Run targeted checks for touched surfaces.
4. Refresh the packet and append a disposition ledger:
   - fixed, with fix location;
   - omitted, with killing evidence;
   - needs-human, with the decision needed.
5. Rerun only lanes that produced a validated finding or whose surfaces the fix
   touched.
6. Stop at a terminal state.

Terminal states:

- `clean`: fresh review leaves no validated actionable findings.
- `human-decision`: remaining findings require product, architecture, rollout, or
  risk-tolerance decisions.
- `broad-refactor-required`: credible fix exceeds the requested scope; name the
  subsystem boundary and why a local fix would be misleading.
- `report-only-requested`: user explicitly requested readonly review.
- `cycle-cap-reached`: three full cycles ran and validated findings remain.

## Final Report

Use this shape:

```markdown
## Independent Critical Review

Verdict: BLOCK | CONCERNS | CLEAN

### Action Items

**Before merge**
- <owner action> in `<path>` / `<symbol>` because <validated risk>.

**Verification**
- <test, check, or manual verification needed>.

**Needs human decision**
- <decision and why code alone cannot answer it>.

### Findings

1. **CRITICAL | WARNING | NOTE** - `<path>` / `<symbol>`
   <problem and failure path>
   Evidence: <why this survived validation>
   Suggested fix: <concrete remediation>

### Coverage

- Scope reviewed: <diff/path/PR>
- Lanes run: <lanes>
- Lanes intentionally skipped: <lanes and why>
- Validation: <commands or checks>
```

If no findings survive, say so directly and include the probes that mattered.
