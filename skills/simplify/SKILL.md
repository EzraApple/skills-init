---
name: simplify
description: Use when refining recently written code, reviewing a diff for unnecessary complexity, doing cleanup passes, removing dead indirection, collapsing duplicate concepts, reducing helper bloat, or checking whether a change can be smaller without losing clarity.
---

# Simplify

Use this skill to make code smaller, clearer, and easier to reason about. The
default posture is deletion, but the goal is not the fewest lines at any cost.
The goal is the simplest behavior-preserving shape that a future maintainer can
trust.

## Use And Near Misses

Use this when:

- refining code you just wrote;
- reviewing a PR or branch for avoidable complexity;
- doing a cleanup pass;
- a value changes names across layers;
- helper functions, wrapper types, or translation objects do not earn their
  existence;
- one concept has multiple code paths.

Do not use this as the controlling skill when:

- the main task is a correctness, security, or data-loss fix;
- adding tests or safety checks increases lines but reduces risk;
- a public API needs a small adapter for compatibility;
- a domain concept is complex because the domain is complex;
- readability would get worse just to make `git diff --stat` smaller.

Line count is a signal, not a verdict. If simplification adds lines, explain why
the resulting code is still simpler.

## Core Questions

Ask these before proposing or accepting a shape:

- Can't we just use the existing value, function, or type?
- How many names does this concept have between source and use?
- Does this layer own a real decision, or is it just passing data through?
- Is this state derived from existing data?
- Is this abstraction used enough to earn a name?
- Would deleting this make the code harder to misuse?

## Simplification Moves

### Prefer The Direct Version

Before adding a service, helper, or abstraction, write the direct version. If the
direct version works and stays readable, use it.

```ts
// Overbuilt: strategy object for one lookup.
const resolver = new PriceResolver(items);
const price = resolver.resolve(type);

// Direct.
const price = items.find((item) => item.type === type)?.price ?? null;
```

### Inline Single-Use Helpers

Extract when a helper removes real duplication, names a non-obvious domain
operation, or isolates a boundary. Inline when it only wraps a one-liner.

```ts
// Weak helper.
function getDefaultId(items: Item[], type: string) {
  return items.find((item) => item.type === type)?.id ?? null;
}
const id = getDefaultId(items, type);

// Simpler.
const id = items.find((item) => item.type === type)?.id ?? null;
```

Exception: keep a single-use helper when it creates a meaningful boundary, such
as parsing untrusted input, encapsulating a tricky browser API, or naming a
business rule that would otherwise be opaque.

### Flatten Control Flow

Prefer guard clauses and early returns over deeply nested conditionals.

```ts
function process(item: Item | null) {
  if (!item?.isValid || item.type !== "active") {
    return null;
  }

  return doWork(item);
}
```

One ternary is fine. Nested ternaries are usually a rewrite.

### Derive Instead Of Synchronizing

If a value is computable from existing state, derive it at the point of use
unless caching is required and justified.

```ts
// Sync liability.
const [filteredItems, setFilteredItems] = useState<Item[]>([]);
useEffect(() => {
  setFilteredItems(items.filter(predicate));
}, [items]);

// Derived.
const filteredItems = items.filter(predicate);
```

Use memoization only when there is a measured or obvious cost. Do not add cache
invalidation problems to avoid cheap computation.

### Collapse Parallel Code Paths

Two functions that differ only by mode are usually one function with a clear
option.

```ts
function getItems({
  config,
  includeDeprecated = false,
}: {
  config: Config;
  includeDeprecated?: boolean;
}) {
  // shared logic
}
```

Do not over-collapse true domain differences. If two code paths enforce
different invariants, keep the boundary and make the distinction explicit.

### Keep One Name Per Concept

Name drift creates mapping code that hides bugs. Carry the same concept name
through the stack unless crossing a real boundary or language convention.

```text
// Name drift.
repo layer      -> workspace
service layer   -> workspaceData
component layer -> currentContext

// One concept, one name.
repo layer      -> workspace
service layer   -> workspace
component layer -> workspace
```

Acceptable boundary changes include `workspace_id` at the database layer and
`workspaceId` in TypeScript. That is syntax convention, not semantic renaming.

### Pass Objects Whole

Do not destructure and rebuild objects just to rename fields. Preserve the
original shape and add only what is new.

```ts
const enrichedProject = {
  ...project,
  isActive: project.settings.active,
};
```

### Delete Translation Theater

Mapping functions that only pick fields and rename them are suspicious. Keep
them only when they enforce a real wire contract, privacy boundary, or versioned
API.

```ts
// Usually unnecessary if no boundary is being enforced.
function toSessionSummary(session: Session): SessionSummary {
  return {
    sessionId: session.id,
    sessionStatus: session.status,
    messageCount: session.messages.length,
  };
}
```

If the summary type is a public API response, the adapter may be correct. If it
is internal plumbing, delete it and use the original object.

## Anti-Patterns

| Smell | Better move |
| --- | --- |
| Helper used in one place | Inline unless it names a real boundary. |
| `useState` plus effect for derived data | Derive during render or memoize only when needed. |
| Value has three names across layers | Collapse to one concept name. |
| Same name used for different concepts | Disambiguate at the source. |
| Function destructures and rebuilds with new keys | Spread and extend, or delete the function. |
| Wrapper type only renames fields | Use the original type or define a real boundary DTO. |
| Admin/app duplicate functions | One function with a clear option if invariants match. |
| Stored field computable from existing data | Derive it unless persistence is required. |
| New helper when an existing one does most of it | Extend existing code or use it directly. |
| Dense reducer replacing clear code | Prefer readable multi-step code. |

## Review Output

When reporting simplification opportunities, keep them concrete:

```markdown
1. `<path>` / `<symbol>`
   Current shape: <what exists now>
   Simpler shape: <what to delete, inline, derive, or unify>
   Why it is safe: <behavior-preserving reason or boundary note>
   Impact: <rough line delta or removed concept>
```

For implementation, make one simplification at a time and run the narrowest
check that proves behavior stayed intact.

## Done Criteria

- Removed or collapsed at least one real source of complexity, or explicitly
  concluded that the current complexity earns its place.
- Preserved behavior and public contracts.
- Did not replace clear code with clever dense code.
- Ran a focused check when code changed.
- If line count increased, explained why the new shape is simpler.
