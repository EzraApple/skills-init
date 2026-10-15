# Trustworthy measurements

State the claim and workload before measuring. Read the measurement code: what
does its timed region include, and what does it omit? Verify correct outputs,
error counts, and completed work. Fast rejection, skipped work, stale caches,
unawaited promises, and unused lazy results are common false wins.

Compare the same workload, versions, hardware, concurrency, and intended runtime
configuration. Record warmup and cache state. A debug build against a release
build measures that difference. If configurations cannot be made comparable,
limit the claim or mark the comparison inconclusive.

Repeat enough to distinguish the effect from ordinary variation. Alternate or
randomize baseline and treatment order so drift favors neither. Keep raw results
and report the sample definition, run count, units, and spread. A gap inside the
noise is no demonstrated improvement. Label a requested one-run estimate as such.

Find the resource or operation that limits the result. Use a separate profiling
run when instrumentation would distort the timed run. Check whether the load
generator saturated first. Sanity-check the number against bandwidth, available
cores, and the changed operation's share of total time.

Pair a microbenchmark with the user-visible path when making a product claim.
For iterative optimization, keep the workload and measurement command fixed,
change one hypothesis at a time, and retain a change only when correctness holds
and the improvement exceeds noise. If the harness is wrong, correct it and
re-establish both sides rather than comparing incompatible results.

Report faster, slower, no measurable difference, or inconclusive. Keep the
workload, errors, completed-work checks, limiter evidence, and raw runs with the
number so another person can assess the claim.
