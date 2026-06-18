import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, lstatSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const packageRoot = fileURLToPath(new URL("..", import.meta.url));
const binPath = join(packageRoot, "bin", "skills-init.js");

function makeTarget() {
  return mkdtempSync(join(tmpdir(), "skills-init-"));
}

test("installs core skills and all default tool links", () => {
  const target = makeTarget();

  execFileSync(process.execPath, [binPath, "--target", target], {
    encoding: "utf8",
  });

  for (const skill of ["adversarial-review", "writing-skills", "simplify"]) {
    assert.ok(existsSync(join(target, ".agents", "skills", skill, "SKILL.md")));

    for (const toolDir of [".claude", ".cursor", ".codex", ".opencode"]) {
      const linkPath = join(target, toolDir, "skills", skill);
      assert.equal(lstatSync(linkPath).isSymbolicLink(), true);
    }
  }

  assert.match(
    readFileSync(join(target, ".agents", "README.md"), "utf8"),
    /source of truth/,
  );
});

test("is idempotent without overwrite", () => {
  const target = makeTarget();

  execFileSync(process.execPath, [binPath, "--target", target], {
    encoding: "utf8",
  });
  const output = execFileSync(process.execPath, [binPath, "--target", target], {
    encoding: "utf8",
  });

  assert.match(output, /skip existing/);
  assert.match(output, /keep link/);
});

test("dry run does not create files", () => {
  const target = makeTarget();

  execFileSync(process.execPath, [binPath, "--target", target, "--dry-run"], {
    encoding: "utf8",
  });

  assert.equal(existsSync(join(target, ".agents")), false);
});
