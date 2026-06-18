---
name: writing-skills
description: Use when creating, editing, packaging, consolidating, routing, validating, or publishing agent skills under .agents/skills or a tool-specific skill directory.
---

# Writing Skills

A skill is reusable operational guidance that helps a future agent recognize a
situation and apply a proven approach. Treat skill writing like product work for
agents: define the job, make discovery reliable, keep the path through the docs
obvious, and verify that the skill changes behavior.

## Start With Intent

Before writing or editing a skill, answer these from the current task and the
target project. Ask only for gaps that cannot be inferred.

- What task should this help agents do?
- When should it trigger? Include user phrases, symptoms, tools, paths, and
  near-miss cases.
- What should the agent produce or decide after reading it?
- What 2-3 concrete tasks should it handle end to end?
- Who is the audience: repository developer agents, user-facing runtime agents,
  or a packaged skill bundle for many projects?
- What existing skill, always-on guidance, script, lint, or test already covers
  part of this?

Those concrete tasks become the should-trigger prompts used during validation.

## Choose The Right Home

Do placement before writing content.

| Home | Use for |
| --- | --- |
| `.agents/skills/<skill>/SKILL.md` | Project-local source of truth for reusable skills. |
| Tool-specific links, such as `.claude/skills` | Generated symlinks or copies that point back to `.agents/skills`. |
| `AGENTS.md` or equivalent always-on guidance | Broad rules that should apply even when no skill is invoked. |
| `scripts/`, lint, or tests | Mechanical behavior that can be enforced automatically. |
| Runtime workspace skill directory | User-facing skills that must be visible to a sandbox or runtime agent. |

Search before adding a top-level skill:

```bash
rg --files .agents/skills | rg '/SKILL\.md$' | sort
rg -n "keyword|tool|old-skill-name" .agents AGENTS.md .
```

Prefer adding a nested reference file under an existing skill when the new
guidance is really a variant of an existing workflow. Keep a separate top-level
skill when separate discovery metadata matters.

## When To Create Or Keep A Skill

Create or keep a skill when the guidance is reusable and requires judgment.

Good fits:

- non-obvious techniques;
- repeated debugging or review workflows;
- routing decisions;
- tool-specific setup or failure modes;
- API or command references that agents often misuse;
- rubrics, quality gates, and heuristics.

Poor fits:

- one-off history;
- project facts that belong in always-on guidance;
- mechanical checks that should be linted;
- obvious language or library docs;
- postmortems with no reusable decision rule.

If reliable automation can enforce the behavior, add or use the automation and
make the skill point to the command.

## Frontmatter

Every `SKILL.md` needs:

```yaml
---
name: lowercase-hyphen-name
description: Use when triggering situations, symptoms, tools, paths, and user phrases apply.
---
```

Rules:

- `name` is lowercase hyphen-separated and matches the directory.
- `description` is the main discovery surface.
- Start descriptions with `Use when`.
- Describe triggering conditions, not the workflow.
- Include concrete keywords an agent or user would mention.
- Include near-miss routing when adjacent skills could compete.
- Keep descriptions under 1024 characters.
- Keep XML-style angle brackets out of descriptions because descriptions are
  often injected into structured prompts.

Bad:

```yaml
description: Use when debugging - checks logs and writes a fix.
```

Good:

```yaml
description: Use when production errors, service health regressions, logs, traces, incidents, or failing monitors need investigation.
```

## Body Content

Write for a future agent under time pressure.

- Lead with the core principle in 1-3 sentences.
- Put routing decisions near the top.
- Use imperative instructions when the agent must do something.
- Explain why a rule matters when that helps the agent generalize.
- Prefer one excellent example over several generic examples.
- Use tables for quick reference and comparisons.
- Keep examples copy-pasteable when they are commands or code.
- Avoid generic labels like `step1`, `helper2`, or `pattern3`.
- Avoid all-caps rules unless the constraint is safety-critical or agents have
  repeatedly rationalized around it.

Do not include:

- storytelling about a specific past session;
- long transcripts or postmortems;
- multiple language examples for the same idea;
- full API docs that could live in `references/`;
- instructions to use skills that are not installed with this package.

## Progressive Disclosure

Skills should load only the context needed for the task.

- Keep `SKILL.md` as the entry point and router.
- Move heavy material over roughly 100-300 lines into `references/`.
- Put deterministic or repetitive work in `scripts/`.
- Put reusable prompts, templates, and assets in `templates/` or `assets/`.
- In the root doc, say exactly when to read each nested file.
- Use repo-relative file paths for local references.

## Cross-References

Make dependency strength explicit.

- Use `REQUIRED: Use <skill-name>` when the other skill must be followed.
- Use `REQUIRED BACKGROUND: Read <skill-name>` when concepts from another skill
  are needed.
- Use `Optional reference: <path>` for supporting docs.
- Avoid vague "see also" lists.

## Validation

Skill writing is documentation, but the output is agent behavior. Validate
enough for the risk.

### Lightweight Validation

Use for small edits, reference updates, and typo-level fixes.

- Search for stale references with `rg`.
- Check local paths exist.
- Run the package or repo skill linter.
- Regenerate symlinks or tool copies.

### Standard Validation

Use for new skills, routing changes, and meaningful behavior changes.

- Write 2-3 realistic prompts that should trigger the skill.
- Write 2-3 near-miss prompts that should not trigger it.
- Read the skill as the future agent and trace what instruction each prompt
  should use.
- If practical, compare with-skill behavior against without-skill behavior.
- Fix gaps where the agent would fail to discover, over-apply, or misroute the
  skill.

### Rigorous Validation

Use for high-risk discipline skills, broad consolidations, or skills that
enforce behavior agents tend to rationalize away.

- Define pressure scenarios first.
- Observe the baseline failure if practical.
- Write the minimal guidance that addresses the failure mode.
- Rerun the scenario.
- Prefer scripts or assertions for objectively checkable outputs.
- Use human review for subjective quality.

Do not turn every skill edit into an eval project. Use rigor where the cost of a
bad skill is meaningful.

## Improving Existing Skills

- Preserve the original skill name unless intentionally renaming or
  consolidating.
- Read references and callers before changing routing.
- Prefer deleting stale guidance over layering exceptions.
- If feedback came from a review, fix both the specific issue and the pattern
  that allowed it.
- Call out non-obvious tradeoffs in release notes or PR descriptions.

## Description Quality Pass

Before finishing, test the description mentally against realistic prompts.

- Would expected user phrasing trigger this skill?
- Would common setup, review, or debugging workflows route correctly?
- Would near misses avoid triggering it?
- Does the description avoid summarizing the workflow?
- Does it include old names or synonyms that users still say?

If discovery is shaky, improve the description before expanding the body.

## Anti-Patterns

| Anti-pattern | Why it fails | Fix |
| --- | --- | --- |
| Narrative skill | Future agents cannot reuse a one-off story. | Extract the repeatable decision, command, or pattern. |
| Workflow hidden in description | Agent may follow the summary and skip the body. | Put triggers in description, steps in body. |
| Missing synonyms | Users mention old tool names and the skill does not trigger. | Add old names, symptoms, and common phrasing. |
| Link-only routing | Agents do not know when to open which doc. | Add explicit routing bullets. |
| Overgrown root file | Agents load too much irrelevant context. | Move heavy sections to references. |
| Excessive hard rules | Agents follow rigidly or fight the instruction. | Explain why; reserve hard rules for real constraints. |
| Untested routing change | Skill looks clean but is undiscoverable. | Run trigger and near-miss checks. |

## Checklist

- [ ] Correct home: `.agents/skills`, tool-specific link, always-on guidance,
      script, or runtime workspace skill.
- [ ] Top-level skill is justified.
- [ ] Name is lowercase hyphen-separated and matches the directory.
- [ ] Frontmatter has `name` and `description`.
- [ ] Description starts with `Use when` and contains concrete triggers.
- [ ] Description does not summarize the workflow.
- [ ] Description is under 1024 characters and has no XML-style tags.
- [ ] Local references point to existing files.
- [ ] Heavy details are moved to references, templates, assets, or scripts.
- [ ] Examples are reusable, not narrative.
- [ ] Validation level matches risk.
