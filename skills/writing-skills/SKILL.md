---
name: writing-skills
description: Create, revise, or consolidate agent skills. Use when changing skill instructions, discovery descriptions, or supporting resources.
---

# Write useful skills

Assume the agent can already plan, code, and check its work. Keep guidance that
changes a decision, supplies missing operational knowledge, or prevents a
demonstrated failure. Delete generic encouragement and duplicated process.

Before adding a skill, define its intended outcome, a realistic request it
improves, and a nearby request it should leave alone. Prefer an existing skill's
reference for a specialized variant. Use code, types, or lint for mechanically
enforceable rules. Keep broad project conventions in the repository's existing
agent guidance.

Before revising, read the existing skill and its linked resources. Identify the
mechanism, constraints, and outputs that make it useful. Preserve them when
shortening it, or make the intended behavior change explicit.

## Make discovery precise

Use `name` and `description` in YAML frontmatter. The name should match the
directory. Describe the capability and actual triggering task briefly. Add an
exclusion only when it prevents likely misrouting; avoid lists of loosely related
keywords. Preserve supported metadata and the user's invocation preferences.

Keep the main instructions self-contained when they are short. For distinct
operating modes, link focused references and say when to read each. Do not move
text out merely to force the agent to read it all through links. Put repeatable
mechanics in scripts only when they earn their maintenance cost.

Use `.agents/skills` when this package owns project installation. Respect an
existing source of truth elsewhere; do not create competing copies or rewrite
unrelated host configuration.

## Check what changed

Validate metadata, local links, and any executable helpers. A linter proves
structure, not usefulness. Review the instructions for clear scope and duplicated
guidance.

For a new skill or a changed description or reference route, compare a realistic
request that should use it with a nearby request that should not. Trace which
instructions or references each request would reach.

Keep changes supported by observed behavior. If existing guidance was present
but missed, fix discovery or placement before adding another instruction.
