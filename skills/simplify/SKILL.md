---
name: simplify
description: Simplify existing code or a proposed change while preserving behavior. Use for an explicit cleanup or complexity review.
---

# Simplify

Reduce the work needed to understand and safely change the code. Line count is
only a clue: fewer layers with more hidden state can be harder to maintain.

Trace the behavior and real callers before deleting a boundary. Find decisions
that are duplicated, values renamed across layers, state kept in sync with
derivable values, and wrappers that only forward arguments.

Prefer the direct version when it stays clear. Consolidate ownership and remove
unneeded paths before adding an abstraction. A helper earns its place by naming
a coherent operation, hiding a real boundary, or removing meaningful repetition.
Single use alone is not a reason to inline it.

Pass an existing domain value through unchanged when it already represents what
the next operation needs. Keep translation where it protects a real wire,
storage, or public contract. Merge paths only when their invariants and failure
behavior match; shared syntax is not enough.

Keep mutable state in the smallest useful scope. Derive values instead of
maintaining parallel copies. Replace scattered conditionals with a domain model
only when it removes invalid states or repeated rules.

For a requested implementation, make the smallest behavior-preserving change
and check the affected contract. For review, report the concrete simplification,
its benefit, and any compatibility cost. Leave complexity that represents a real
domain constraint; a forced abstraction or rewrite is not a simplification.
