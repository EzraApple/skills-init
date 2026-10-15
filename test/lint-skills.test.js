import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { lintSkills } from "../scripts/lint-skills.js";

function makeSkill(t, content) {
  const root = mkdtempSync(join(tmpdir(), "skills-lint-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, "sample", "references"), { recursive: true });
  writeFileSync(join(root, "sample", "SKILL.md"), content);
  return root;
}

test("checks linked resources recursively without enforcing a description phrase", (t) => {
  const root = makeSkill(t, "---\nname: sample\ndescription: Inspect a sample when its output is wrong.\n---\n[Details](references/details.md)\n");
  writeFileSync(join(root, "sample", "references", "details.md"), "[Recipe](recipe.md)\n");
  assert.deepEqual(lintSkills(root), [
    `${join(root, "sample", "references", "details.md")} has a missing reference: recipe.md`,
  ]);
  writeFileSync(join(root, "sample", "references", "recipe.md"), "Run the sample.\n");
  assert.deepEqual(lintSkills(root), []);
});

test("ignores external links, anchors, and fenced examples", (t) => {
  const root = makeSkill(t, "---\nname: sample\ndescription: Inspect a sample.\n---\n[Docs](https://example.com)\n[Here](#usage)\n```md\n[Example](not-a-real-file.md)\n```\n~~~md\n[Other](also-an-example.md)\n~~~\n");
  assert.deepEqual(lintSkills(root), []);
});

test("reports invalid discovery metadata and malformed frontmatter", (t) => {
  const root = makeSkill(t, "---\nname: other\ndescription: \n---\n");
  assert.match(lintSkills(root)[0], /nonempty string description/);
  writeFileSync(join(root, "sample", "SKILL.md"), "# Missing metadata\n");
  assert.match(lintSkills(root)[0], /missing YAML frontmatter/);
});

test("parses folded YAML descriptions and checks angle-wrapped paths with spaces", (t) => {
  const root = makeSkill(t, "---\r\nname: sample\r\ndescription: >-\r\n  Inspect a sample\r\n  when output is wrong.\r\n---\r\n[Recipe](<references/my recipe.md>)\r\n");
  assert.match(lintSkills(root)[0], /missing reference: references\/my recipe\.md/);
  writeFileSync(join(root, "sample", "references", "my recipe.md"), "Inspect the output.\n");
  assert.deepEqual(lintSkills(root), []);
});

test("rejects duplicate YAML fields rather than silently selecting one", (t) => {
  const root = makeSkill(t, "---\nname: sample\nname: other\ndescription: Inspect the sample.\n---\n");
  assert.match(lintSkills(root)[0], /invalid YAML/);
});
