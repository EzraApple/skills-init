# Caller-facing interfaces

Inspect representative call sites before judging the boundary. What does the
caller import, provide, receive, and need to know? For a proposed API, write a
realistic call site first and derive the shape from it.

Look for overlapping entrypoints, modes that combine unrelated jobs, optional
inputs that silently select another workflow, query names that hide writes,
and transport or storage details callers should not own. Several values belong
in one object only when they represent a coherent domain concept.

Judge a boundary by the complexity it hides relative to what callers must learn.
A pass-through layer can add work without hiding a decision. A larger module
can be useful when it concentrates capability behind a simple interface.

Propose the smallest improvement that serves all distinct caller jobs. Identify
real external compatibility and migration costs before merging or deleting APIs.
For internal APIs that can change together, migrate callers and remove the old
path in one coherent change. Preserve adapters that protect actual external
contracts. Drop style preferences that do not improve caller clarity or safety.
