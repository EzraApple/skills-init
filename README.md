![skills-init banner](./assets/banner.png)

# skills-init

Drop a small, opinionated agent skill system into any new project.

`skills-init` creates a single source of truth at `.agents/skills`, installs a
portable baseline of high-leverage skills, and symlinks those skills into the
tool-specific folders agents already know how to read:

```text
.claude/skills/<skill>   -> ../../.agents/skills/<skill>
.cursor/skills/<skill>   -> ../../.agents/skills/<skill>
.codex/skills/<skill>    -> ../../.agents/skills/<skill>
.opencode/skills/<skill> -> ../../.agents/skills/<skill>
```

The idea is simple: your project carries the actual context once, and every
agent surface sees the same guidance.

## Quick Start

Install the default skill pack in a repo:

```bash
npx skills-init
```

Or preview the writes first:

```bash
npx skills-init --dry-run
```

Useful options:

```bash
skills-init --target .
skills-init --target . --dry-run
skills-init --target . --overwrite
skills-init --target . --no-links
skills-init --target . --copy-links
skills-init --list
```

Package: https://www.npmjs.com/package/skills-init

Repo: https://github.com/EzraApple/skills-init

## What It Installs

Default profile: `core`

```text
.agents/
  README.md
  skills/
    outcome-first-workflows/
      SKILL.md
    trace-codebase/
      SKILL.md
    plan-changes/
      SKILL.md
    systematic-debugging/
      SKILL.md
    repo-automations/
      SKILL.md
      TEMPLATE.md
    adversarial-review/
      SKILL.md
    interface-review/
      SKILL.md
    simplify/
      SKILL.md
    writing-skills/
      SKILL.md
  mcps/
    README.md

.claude/skills/*   -> .agents/skills/*
.cursor/skills/*   -> .agents/skills/*
.codex/skills/*    -> .agents/skills/*
.opencode/skills/* -> .agents/skills/*
```

`.agents/mcps` is intentionally just a placeholder today. The package is built
around profiles so MCP setup, tool config, and additional skill packs can be
added later without changing the core installer model.

## Included Skills

### `outcome-first-workflows`

Finish substantial work against an observable outcome, explicit constraints,
and claim-matched evidence.

Includes:

- compact outcome, non-goal, and stopping-condition contracts;
- witness selection for user flows, hidden state, code contracts, performance,
  deployments, and external artifacts;
- bounded parallel-work rules for runtimes that support it;
- honest completion checks that distinguish activity from proof.

### `trace-codebase`

Map an unfamiliar subsystem from real code without producing an encyclopedia.

Includes:

- scope and entrypoint discovery;
- representative data, control, state, and error-flow tracing;
- selective history and provenance rules;
- boundary maps, change seams, and a prioritized reading order.

### `plan-changes`

Turn broad implementation or refactor requests into the smallest
decision-complete plan.

Includes:

- current-boundary and constraint discovery;
- direct-versus-durable approach comparison;
- explicit invariants and non-goals;
- independently verifiable steps with claim-matched witnesses;
- rollout, rollback, compatibility, and risk coverage when relevant.

### `systematic-debugging`

Prove root causes before proposing or implementing fixes.

Includes:

- exact symptom and reproduction framing;
- backward causal tracing and falsifiable hypothesis ledgers;
- precise root-cause standards;
- smallest-owning-boundary fixes;
- verification against the original failure surface.

### `repo-automations`

Route repository-owned scheduled, event-driven, webhook, and agent-run
automations without imposing a specific scheduler or workflow platform.

Includes:

- a lightweight boundary between repo logic and runtime orchestration;
- routing to repo-local, frontmatter-free automation playbooks;
- judgment for choosing code, workflow configuration, or an agent playbook;
- proportional testing, migration, and failure-layer guidance;
- a small playbook template whose irrelevant sections should be deleted.

### `adversarial-review`

High-scrutiny independent review for code, PRs, changed files, plans, or
specific paths.

Includes:

- scope selection for PRs, diffs, files, and local changes;
- reviewer lane selection based on risk and user intent;
- correctness, security, architecture, interface, test/ops, and UX lane
  templates;
- clustering findings by root cause;
- validator passes whose job is to kill weak findings;
- an iterative hardening loop for fix, check, and rerun cycles;
- final report shape with verdict, action items, findings, and coverage.

Use this when you want a skeptical second opinion, not a polite rubber stamp.

### `interface-review`

Caller-focused review for APIs, exported functions, service methods, hooks,
component props, schemas, commands, events, and extension points.

Includes:

- duplicate-boundary and hidden-side-effect detection;
- mode, option, and domain-input shape review;
- provider and implementation-leakage checks;
- concrete replacement shapes with compatibility and migration notes.

### `writing-skills`

The meta-skill for creating and maintaining useful skills.

Includes:

- how to define a skill's job, trigger phrases, audience, and output;
- where skills should live: `.agents/skills`, tool links, always-on guidance,
  scripts, or runtime workspace directories;
- frontmatter rules for discoverable `name` and `description`;
- guidance for progressive disclosure with `references/`, `scripts/`,
  `templates/`, and `assets/`;
- validation levels from lightweight checks to rigorous pressure scenarios;
- anti-patterns like narrative skills, workflow-hidden descriptions, and
  untested routing changes.

Use this when you are turning repeated agent behavior into durable project
context.

### `simplify`

Deletion-first code simplification for agents that tend to add wrappers,
helpers, and speculative abstractions.

Includes:

- direct-version-first thinking;
- single-use helper inlining;
- guard-clause and flattening guidance;
- deriving values instead of synchronizing state;
- collapsing parallel code paths;
- one-name-per-concept naming discipline;
- rules for passing objects whole and deleting translation theater;
- near-miss guidance for cases where added lines are still the simpler choice.

Use this after implementation or during review to ask: what can we delete
without losing clarity or safety?

## Why This Exists

Agent tools are getting better, but new projects still start cold. The same
instructions get pasted into prompts, copied between repos, or forgotten until a
review goes sideways.

`skills-init` makes project context explicit and portable:

- skills live in the repo;
- tool-specific folders are generated;
- repeated judgment becomes reusable guidance;
- future MCP and tool setup has a place to grow.

## Repo Structure

```text
assets/                 README images and package-visible assets
bin/                    CLI entrypoint
profiles/               data-driven install profiles
scripts/                package validation scripts
skills/                 source skills copied into target projects
src/                    installer implementation
templates/              files written into target projects
test/                   Node test runner coverage
```

## Local Development

Run from this checkout:

```bash
node bin/skills-init.js --target /path/to/project
```

Run checks:

```bash
npm run check
```

This validates skill frontmatter, runs installer tests, and verifies package
contents with `npm pack --dry-run`.

## Releasing

Releases publish from GitHub Actions through npm trusted publishing. The tag
must match the version in `package.json`.

```bash
npm version patch
git push origin main --follow-tags
```

The npm trusted publisher is scoped to `EzraApple/skills-init` and
`.github/workflows/publish.yml`; no npm token is stored in GitHub.

## Extending

Add a skill:

1. Create `skills/<skill-name>/SKILL.md`.
2. Add the skill name to `profiles/core.json` or a new profile.
3. Run `npm run check`.

Add future MCP support:

1. Put MCP templates or descriptors under `templates/` or a future `mcps/`
   source directory.
2. Add profile entries describing when they install.
3. Keep writes idempotent.
4. Never overwrite user config unless `--overwrite` explicitly allows it.

The installer should stay boring: copy durable source context into `.agents`,
then generate tool-specific views over that context.

## License

MIT
