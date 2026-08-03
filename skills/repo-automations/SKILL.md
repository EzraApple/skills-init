---
name: repo-automations
description: Use when creating, migrating, running, reviewing, or debugging repository-owned recurring, scheduled, webhook, event-driven, or agent-run automations; deciding whether behavior belongs in code, a playbook, or an external scheduler; or establishing a lightweight convention for automation instructions. Routes work to local playbooks and the owning runtime. Do not use for personal reminders or unrelated host-app automations.
---

# Repo automations

Use this skill as a router and ownership guide, not as a mandatory automation framework. Preserve the repository's established conventions unless they are the problem.

## Orient

1. Read the repository's agent guidance and automation documentation.
2. Locate the actual automation surfaces: playbooks, scripts, workflow files, scheduler configuration, webhook handlers, and run records.
3. If the request names an automation, find and read its playbook before acting. Search this directory and the repository rather than assuming a fixed layout.
4. Confirm which system owns the trigger, checkout or deployed version, credentials, execution, and delivery. Do not infer runtime state from repository files alone.

## Choose the owning layer

Use the smallest split that fits the existing system:

- Keep reviewable behavior, rules, and validation in the repository when practical.
- Keep timing, event bindings, runtime identity, and secret grants in the scheduler or automation host when that is where they naturally belong.
- Prefer code or workflow configuration for deterministic transformation and transport.
- Prefer an agent playbook when the work requires investigation, judgment, synthesis, or flexible tool use.

Do not migrate working provider-owned logic merely to conform to this pattern.

## Route through playbooks

When a repository keeps automation playbooks beside this skill, use ordinary, frontmatter-free Markdown such as `<slug>.md`. This keeps the root skill discoverable without advertising every routine as an independent skill.

For a new repeated or consequential automation, start from [TEMPLATE.md](TEMPLATE.md). Keep only the sections that improve execution; a short automation may need only a paragraph and a procedure.

Keep scheduler prompts thin when the host can read repository files: point to the playbook instead of duplicating its behavior. Add automation-specific trigger terms to this skill's description only when interactive discovery actually needs them.

## Work proportionally

- Before changing or running an automation, understand its inputs, side effects, permission boundary, and current state.
- Test through the cheapest witness that proves the behavior. Use a dry run or manual invocation when duplication or external writes matter.
- If the runtime clones or deploys the repository, make the referenced playbook available to that runtime before expecting a scheduled run to use it.
- During migrations, avoid overlapping old and new writers unless duplicate execution is explicitly safe.
- Verify the real output or run record; configuration alone proves intent, not execution.

## Debug the owning layer

Check only the layers relevant to the failure:

1. Did the trigger fire?
2. Did the intended version run?
3. Were credentials and tools available?
4. Did the procedure select or transform the right data?
5. Did the destination accept and expose the result?

Fix the layer that owns the failure. Do not compensate for scheduler, access, or delivery problems by making the playbook more elaborate.
