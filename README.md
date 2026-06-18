# skills-init

Portable agent-skill scaffolding for new projects.

This package installs a small default skill set into `.agents/skills`, then
symlinks tool-specific skill folders back to that source of truth. The package
is intentionally data-driven: profiles list skills, link targets, and future
setup steps so MCPs or tool-specific config can be added without rewriting the
CLI.

The external package/repo name is still provisional. If published as
`skills-init`, use:

```bash
npx skills-init
```

If published under a scope such as `@ezra/skills`, use:

```bash
npx @ezra/skills
```

## What It Installs

Default profile: `core`

- `adversarial-review`: high-scrutiny independent review workflow.
- `writing-skills`: skill authoring, routing, validation, and packaging rubric.
- `simplify`: deletion-first code simplification pass, adapted for portable use.

It creates:

```text
.agents/
  README.md
  skills/
    adversarial-review/
    writing-skills/
    simplify/
  mcps/
    README.md
```

By default, it also creates these symlinks for every installed skill:

```text
.claude/skills/<skill>   -> ../../.agents/skills/<skill>
.cursor/skills/<skill>   -> ../../.agents/skills/<skill>
.codex/skills/<skill>    -> ../../.agents/skills/<skill>
.opencode/skills/<skill> -> ../../.agents/skills/<skill>
```

`.agents/skills` carries the actual context. Tool-specific skill directories are
generated views over that shared source.

## Local Development

Run the CLI from this checkout:

```bash
node bin/skills-init.js --target /path/to/project
```

Useful options:

```bash
skills-init --list
skills-init --dry-run
skills-init --target .
skills-init --target . --overwrite
skills-init --target . --no-links
skills-init --target . --copy-links
```

`--copy-links` copies skills into tool-specific folders instead of symlinking.
Use it only for tools or filesystems that cannot follow symlinks; `.agents` is
still treated as the source of truth.

## Extending

Add a skill by placing it under `skills/<skill-name>/SKILL.md`, then add the
skill name to `profiles/core.json` or a new profile.

Future MCP support should follow the same shape:

- put MCP templates or descriptors under `mcps/` or `templates/`;
- add profile entries for when they should install;
- keep writes idempotent and never overwrite user config unless `--overwrite`
  explicitly allows it.

## Checks

```bash
npm run check
```

This validates skill frontmatter, runs the installer tests, and verifies the npm
package contents with `npm pack --dry-run`.
