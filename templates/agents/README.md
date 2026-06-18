# Agent Skills

This directory is the source of truth for project-local agent guidance.

- Put reusable skills under `.agents/skills/<skill-name>/SKILL.md`.
- Keep tool-specific directories (`.claude/skills`, `.cursor/skills`,
  `.codex/skills`, `.opencode/skills`) as generated links back to this
  directory.
- Put future MCP descriptors, setup notes, or templates under `.agents/mcps`
  unless a tool requires a different physical location.

Regenerate installed skills by rerunning the package initializer.
