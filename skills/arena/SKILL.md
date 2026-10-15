---
name: arena
description: Produce and compare independent solutions using fresh-context subagents. Use for an arena or a request for competing designs, implementations, or other substantial artifacts.
---

# Compare independent solutions

Have several fresh subagents solve the same task independently, then integrate
one coherent result. Each candidate produces the whole artifact; splitting one
implementation among workers is a different workflow.

## Frame the task

Define the artifact, constraints, shared inputs, allowed changes, and checks that
would establish success. Set a few concrete comparison criteria before reading
the candidates. Choose a candidate count and resource budget appropriate to the
decision; avoid multiplying attempts without a useful reason.

Give every candidate the same task brief and starting state, including relevant
uncommitted changes. If the user specified alternatives to compare, preserve
that comparison. Otherwise let the candidates choose their approaches independently.

## Generate independently

Start each candidate in a fresh context window without inherited conversation
history, the builder's preferred solution, or another candidate's reasoning.
Share necessary facts and repository guidance through one concise grounding
packet. Keep the judge's scoring notes outside candidate contexts.

Prepare a separate worktree or output directory for each candidate from that
starting state. Candidates may write only their assigned outputs and run checks
within their authorized scope; they must not edit the shared checkout or other
candidates. External actions still require the user's authorization.

Run candidates in parallel when available. Require a complete artifact and a
short rationale naming important tradeoffs. If one fails, report the missing
candidate and assess whether the remaining comparison is still useful.

## Compare and integrate

After candidates finish, start a fresh, read-only judge with the original task
brief, constraints, relevant shared inputs, criteria, and completed artifacts.
Use neutral labels when practical. Have it assess each criterion with evidence
and recommend a base. Do not judge unfinished outputs.

The parent reads every candidate, checks the judge's evidence, and chooses the
base. Resolve disagreements through actual artifacts and constraints; agreement
between agents does not establish correctness. Prefer a maintainable boundary
when valid candidates are otherwise close. If none meets the task constraints,
explain the failure rather than forcing a winner.

Port only improvements that fit the chosen design. Reconcile ownership,
interfaces, and assumptions instead of mechanically merging implementations.
The parent owns integration and the final result.

## Verify the result

Check the integrated artifact against the original task and its real usage
surface. Checks on an individual candidate do not verify the combined result.
Address failures within scope; name any unresolved decision or blocked check.

Return the artifact with a short account of the chosen base, useful borrowed
ideas, rejected tradeoffs, checks, and remaining gaps. Preserve needed outputs
before cleaning up only the scratch spaces created for this run.
