---
name: create-verification
description: Use when asked to create or update repo-local verification instructions for an actual app, CLI, or API, such as a verify-app skill. Do not use for ordinary implementation or one-off testing.
---

# Create verification

Write a repo-local `.agents/skills/verify-<app>/SKILL.md` that another agent can run to prove a real user journey. Adapt the name and location to an existing repo convention when one exists. Reuse the repository's working harness, fixtures, and checks before adding new ones.

Inspect the current entry points, startup commands, configuration, and app behavior. The recipe must identify the exact target and prove readiness, so an agent cannot accidentally test a stale server or the wrong environment. State required credentials and data as preconditions; do not embed secrets.

Make each journey reproducible:

1. Start or connect to the target, verify its identity and ready state, and prepare isolated data.
2. Perform a real action through the user-facing app, CLI, or API. Name the input and the expected visible result.
3. Read back the resulting state or side effect through an independent surface when available. Record evidence that remains after cleanup.
4. Remove only data and processes the recipe created. Track process ownership; never kill by a broad name or port match.

Use the environment the user asked to verify. For browser journeys, follow the user's preferred browser path and existing approval. Describe a blocked precondition honestly rather than replacing the real journey with a mock or a static check.

Run the written recipe, including the success and failure paths it claims to verify. Correct gaps found during that run. If access or setup prevents a path, mark it unverified and state the failed step, observed result, and what would unblock it. Keep the recipe short enough to run again; move long commands or fixture setup into a script only when that improves reliability.
