# Runtime artifacts

Match the artifact to the symptom: CPU samples for busy loops, a trace for
timing and scheduling, heap snapshots for retained objects, and process or
system counters for resource limits. Capture the failing state and identify the
build, workload, interval, and instrumentation overhead.

For an existing capture, preserve it and use a parser suited to its format.
Reduce large payloads into queryable samples, frames, events, or retainers rather
than reading raw dumps into context. Find the hot call chain, recurring event,
blocked thread, or retainer path to a garbage-collection root.

Map the relevant frame or allocation back to the actual source and version.
Unresolved symbols are a limitation. A hot frame shows cost, not necessarily why
the work occurred. Follow the caller, scheduler, or retaining owner to explain
the mechanism.

Use a discriminating observation or paired capture to test the explanation.
Without one, report the strongest supported hypothesis rather than claiming a
confirmed cause. Stay within the requested environment and side-effect scope;
read-only diagnosis does not authorize live code changes or process mutation.
