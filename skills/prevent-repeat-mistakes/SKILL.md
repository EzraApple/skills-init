---
name: prevent-repeat-mistakes
description: Use when asked to prevent a recurring, evidenced repository mistake or repeated review correction. Do not trigger for a single speculative concern, ordinary bug fix, or personal memory mining.
---

# Prevent repeat mistakes

Find concrete instances of the repeated mistake within the repo and task scope the user supplied. Compare the correction with the current code and guidance to identify the invariant that keeps failing. If the examples do not establish a pattern, say so and address only the authorized instance.

Choose the owning boundary that prevents recurrence:

1. Remove duplicate ownership or ambiguous interfaces when they cause the drift.
2. Encode the invariant in types, schema validation, lint, or a focused test when it can be checked mechanically.
3. Update existing agent guidance only when the decision needs judgment that code cannot enforce. Prefer a narrow edit over another rule or skill.

Prove the guard works: show that it rejects a representative former mistake and accepts the valid case. For a test, reproduce the failure before the fix when practical. Run the relevant checks after the change. Do not add a check that merely restates the implementation or blocks legitimate uses.

Diagnosis alone does not authorize code or instruction changes. If the user requested an audit, report the cause, the proposed owning boundary, and evidence without editing. If the user requested prevention or a fix, make the scoped change and verify it. Do not expand into an architecture sweep, search unrelated personal history, or write to memory without a separate request.
