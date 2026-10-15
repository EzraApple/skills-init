# Change impact

Look for the breakage a symbol search misses. Start with the assumptions that
make the change safe, such as a cache operation being side-effect free or a
consumer accepting the new representation. Prioritize the assumptions whose
failure would change the review verdict.

Trace relevant boundaries beyond direct callers:

- serialized data, persisted rows, messages, and readers in other languages;
- pinned library behavior and local patches;
- lifecycle ordering, microtasks, cancellation, unmount, and teardown;
- configuration, feature gates, old clients, and rolling deployments.

For each material risk, name the trigger, violated contract, affected consumer,
and consequence. Read the actual implementation or authoritative versioned
contract. When a small test or script can settle the safety assumption, run the
real code rather than restating the claim in prose.

Distinguish a risk you proved, one you cleared with evidence, and an assumption
that remains unverified. Do not invent consumers or probabilities. An inability
to run a probe is a coverage gap, not automatically a defect. Report the cheapest
remaining check that would resolve it.
