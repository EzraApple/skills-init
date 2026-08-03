---
name: outcome-first-workflows
description: Use when leading a larger implementation, investigation, audit, migration, or review that needs an observable end state, explicit scope, a stopping condition, bounded parallel work, or evidence matched to completion claims. Do not use for a small task with one obvious check.
---

# Outcome-First Workflows

Run substantial work against a visible finish line. Define what must become true,
which constraints matter, and what evidence will prove completion; leave routine
implementation choices open.

## Route Nearby Work

- Use `plan-changes` when the requested deliverable is an implementation plan.
- Use `systematic-debugging` when the cause of broken behavior is unknown.
- Use `adversarial-review` when the user explicitly wants independent,
  high-scrutiny review.
- Handle small, directly verifiable tasks without adding workflow ceremony.

## Establish the Contract

Before substantive work, derive a compact contract from the request and local
context:

```markdown
Outcome: <observable end state>
Constraints: <scope, safety, compatibility, authority>
Non-goals: <adjacent work intentionally excluded>
Done when:
- <claim> -> <evidence that can prove it>
Stop or ask when: <human decision or authority boundary>
```

Do not turn this into a screenplay. Include decisions that control the result,
not a command-by-command itinerary.

Ask the user only about choices that cannot be discovered and would materially
change the result. Resolve codebase facts, tool availability, and current state
directly when safe.

## Match Evidence to the Claim

Choose the witness before implementing when verification affects the design.

| Completion claim | Appropriate witness |
| --- | --- |
| A user flow works | Exercise the real UI or equivalent user surface. |
| Hidden state changed | Read it back through the owning API, CLI, log, or datastore. |
| A code contract holds | Run the narrow test, type check, lint, or contract probe that exercises it. |
| Performance improved | Compare repeated baseline and treatment runs under the same load. |
| A deployment shipped | Verify the deployment job and the served artifact or live behavior. |
| An external artifact changed | Re-open the external artifact; a local diff cannot prove it. |

One witness may support several claims, but a convenient witness must not stand
in for the relevant one. A build does not prove a user interaction, and a UI
check does not prove a database invariant.

## Execute Within the Contract

1. Inspect the current state before editing when the implementation boundary or
   cause is uncertain.
2. Keep one integration owner for the outcome. If the runtime supports parallel
   workers, delegate only independent sources or review lanes.
3. Give each lane a bounded question, allowed scope, expected evidence, and
   stopping condition. Do not split work that shares unresolved design state.
4. Reconcile findings before editing overlapping files or adopting review
   feedback.
5. Update the contract only when new evidence changes the real outcome,
   constraint, or finish line. Report material scope changes.
6. Stop once the finish-line evidence is collected. More activity is not more
   completion.

## Handle New Information

- If evidence disproves the assumed cause, switch to `systematic-debugging`.
- If a new user choice would materially change the product or architecture,
  pause at that decision boundary.
- If a safe alternative stays inside the contract, take it and record the
  trade-off.
- If adjacent cleanup is useful but unnecessary, leave it outside the finish
  line rather than silently expanding scope.

## Complete Honestly

Before declaring completion, check:

- The observable outcome exists.
- Every material claim has the right witness.
- Constraints and non-goals were respected.
- Review feedback was validated before adoption.
- Remaining work is either outside scope or explicitly blocked.

Report the achieved outcome first, then the strongest evidence, then any
material limitation. Do not make the user reconstruct completion from a list of
commands.
