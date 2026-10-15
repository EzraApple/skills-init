---
name: trace-codebase
description: Explain how an unfamiliar subsystem works or identify where a change belongs. Use for code walkthroughs and ownership questions.
---

# Trace a codebase

Build a useful mental model from current code. Start at the named feature,
entrypoint, or symbol and follow one representative execution path. Answer a
narrow lookup directly rather than mapping the whole repository.

Trace inputs, important data shapes, decisions, side effects, and returned or
visible results. Identify who owns state, validation, lifecycle, errors, and
cancellation. Read representative callers and consumers so a helper is not
mistaken for the owning boundary.

Use history when a surprising design, compatibility promise, or regression
requires it. Start with the relevant commits and linked discussion; expand to
other available sources only when the question needs them. Current behavior
does not prove the author's original intent.

Keep observed facts, documented rationale, and inference distinct. Cite the
source for consequential claims, preserve contradictions, and say when the
reason could not be found.

For a broad subsystem, independent readers can cover separate paths. Give each
a bounded question and require source pointers and unknowns. Reconcile their
claims against the code before using them.

Explain the main flow, ownership boundaries, contracts that constrain changes,
and the few files worth reading next. Use a diagram when it saves explanation.
Include only unknowns that matter to the question. Stop at understanding unless
the user also requested implementation or redesign.
