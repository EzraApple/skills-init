# skills-init

Install a small set of focused engineering skills into a project, with one
source of truth shared by Claude, Cursor, Codex, and OpenCode.

```sh
npx skills-init
```

The installer copies skills into `.agents/skills` and creates relative links in
`.claude/skills`, `.cursor/skills`, `.codex/skills`, and `.opencode/skills`.
Your project owns the installed copies.

## The pack

| Skill | Use it for |
| --- | --- |
| `adversarial-review` | Fresh-context reviewer subagents find issues; separate validator subagents challenge them. Optional references cover change impact and caller-facing interfaces. |
| `arena` | Fresh subagents produce competing solutions; a separate judge compares them before the parent integrates and verifies one result. |
| `systematic-debugging` | Causal diagnosis and focused repairs. Optional references cover trustworthy benchmarks and runtime artifacts. |
| `simplify` | Behavior-preserving cleanup that reduces indirection, duplicate ownership, and hidden state. |
| `trace-codebase` | Subsystem walkthroughs and ownership questions grounded in representative flows. |
| `create-verification` | Creating repo-specific instructions that launch, drive, observe, and clean up a real app, CLI, or API. |
| `prevent-repeat-mistakes` | Replacing recurring corrections with clearer ownership, types, lint, or tests. |
| `repo-automations` | Repository playbooks, runtime ownership, retry safety, and delivery failures. |
| `writing-skills` | Creating and maintaining focused skills and supporting resources. |

The skills assume a capable agent. They supply specific decision rules and
operational knowledge. They do not impose a planning ceremony, fixed reviewer
panels, model names, or a report template on every task.

Descriptions determine when a skill is considered. The main file contains the
shared guidance; substantial details load only for the relevant mode. Review
and diagnosis requests preserve their read-only scope unless fixes are also
authorized.

## Options

```sh
skills-init --target /path/to/project
skills-init --dry-run
skills-init --overwrite
skills-init --prune
skills-init --no-links
skills-init --copy-links
skills-init --list
```

- `--target` selects the project directory. The default is the current directory.
- `--dry-run` describes changes without writing.
- `--overwrite` replaces existing copies and custom links for currently bundled skills, including local edits.
- `--prune` removes recognized, unmodified retired skills and their owned tool views.
- `--no-links` installs only the source copies under `.agents/skills`.
- `--copy-links` creates tool-specific copies instead of symlinks.
- `--list` prints the bundled names.

## Upgrading from 0.2.1

Three broad skills have left the default pack:

| Removed name | What replaces it |
| --- | --- |
| `outcome-first-workflows` | The agent's normal task execution and your project guidance. |
| `plan-changes` | The agent's normal planning, with specialized skills used where relevant. |
| `interface-review` | The interface lens under `adversarial-review/references/interfaces.md`. |

Preview the upgrade before replacing local skill copies:

```sh
npx skills-init --overwrite --prune --dry-run
npx skills-init --overwrite --prune
```

Pruning checks file contents against the exact retired skills shipped in 0.2.1.
This lets it remove untouched old copies while preserving local edits. It also
preserves directories with extra files, custom links, and modified tool copies,
and reports what needs manual review. It does not remove unrelated skills.
Without `--prune`, retired installations remain and the installer reports them.

The installer refuses to write through symlinked skill-parent directories. Use
project-local directories, or `--no-links` to leave tool directories alone.

## Development

This package has no runtime dependencies. Its layout is:

```text
bin/          CLI entrypoint
src/          installer and retirement metadata
skills/       bundled skills and conditional references
scripts/      metadata and reference checks
test/         installer and tooling tests
```

From this checkout:

```sh
npm ci
npm run check
```

This validates skill metadata and local references, checks installer behavior,
and verifies the npm package contents.

The published package includes `bin/`, `src/`, and `skills/`. Development tooling
stays in this repository.

## Release

GitHub Actions publishes through npm trusted publishing. The tag must match
`package.json`. After review and validation, use the appropriate version bump
and push the release tag through the repository's normal process.

## Design sources

The pack draws on [pstack](https://github.com/cursor/plugins/tree/main/pstack)
and current [OpenAI skill guidance](https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra).
Keep additions only when they supply useful knowledge or change a demonstrated
decision. Prefer structural enforcement over accumulating prompt rules.

## License

MIT
