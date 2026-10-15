import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, readlinkSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const packageRoot = fileURLToPath(new URL("..", import.meta.url));
const binPath = join(packageRoot, "bin", "skills-init.js");
const coreSkills = [
  "trace-codebase",
  "systematic-debugging",
  "repo-automations",
  "adversarial-review",
  "arena",
  "simplify",
  "writing-skills",
  "create-verification",
  "prevent-repeat-mistakes",
];

const toolDirs = [".claude", ".cursor", ".codex", ".opencode"];

// Byte-for-byte 0.2.1 files exercise the immutable retirement digests.
const retiredFixtures = Object.fromEntries(
  ["outcome-first-workflows", "plan-changes", "interface-review"].map((name) => [
    name,
    readFileSync(join(packageRoot, "test", "fixtures", "retired-skills", `${name}.txt`)),
  ]),
);

function run(target, ...args) {
  return execFileSync(process.execPath, [binPath, "--target", target, ...args], { encoding: "utf8", stdio: "pipe" });
}

function retiredSource(target, name) {
  return join(target, ".agents", "skills", name);
}

function retiredView(target, toolDir, name) {
  return join(target, toolDir, "skills", name);
}

function installRetiredSource(target, name) {
  const path = retiredSource(target, name);
  mkdirSync(path, { recursive: true });
  writeFileSync(join(path, "SKILL.md"), retiredFixtures[name]);
  return path;
}

function installRetiredLink(target, toolDir, name) {
  const source = retiredSource(target, name);
  const view = retiredView(target, toolDir, name);
  mkdirSync(dirname(view), { recursive: true });
  symlinkSync(relative(dirname(view), source), view, "dir");
  return view;
}

function installRetiredCopy(target, toolDir, name) {
  const view = retiredView(target, toolDir, name);
  mkdirSync(view, { recursive: true });
  writeFileSync(join(view, "SKILL.md"), retiredFixtures[name]);
  return view;
}

function snapshot(path) {
  let entry;
  try {
    entry = lstatSync(path);
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
  if (entry.isSymbolicLink()) return { link: readlinkSync(path) };
  if (entry.isFile()) return { sha256: createHash("sha256").update(readFileSync(path)).digest("hex") };
  return Object.fromEntries(readdirSync(path).map((name) => [name, snapshot(join(path, name))]));
}

function makeTarget() {
  return mkdtempSync(join(tmpdir(), "skills-init-"));
}

test("installs core skills and all default tool links", () => {
  const target = makeTarget();

  execFileSync(process.execPath, [binPath, "--target", target], {
    encoding: "utf8",
  });

  for (const skill of coreSkills) {
    assert.ok(existsSync(join(target, ".agents", "skills", skill, "SKILL.md")));

    for (const toolDir of toolDirs) {
      const linkPath = join(target, toolDir, "skills", skill);
      assert.equal(lstatSync(linkPath).isSymbolicLink(), true);
    }
  }

  assert.ok(
    existsSync(
      join(target, ".agents", "skills", "repo-automations", "TEMPLATE.md"),
    ),
  );

  for (const [skill, reference] of [
    ["adversarial-review", "change-impact.md"],
    ["systematic-debugging", "benchmarks.md"],
  ]) {
    assert.ok(existsSync(join(target, ".agents", "skills", skill, "references", reference)));
  }

  assert.equal(existsSync(join(target, ".agents", "README.md")), false);
  assert.equal(existsSync(join(target, ".agents", "mcps")), false);
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

test("preserves custom active links unless overwrite is explicit", () => {
  const target = makeTarget();
  run(target);
  const link = join(target, ".claude", "skills", "trace-codebase");
  rmSync(link);
  symlinkSync("../missing-skill", link, "dir");

  assert.throws(() => run(target), /points elsewhere/);
  assert.equal(readlinkSync(link), "../missing-skill");
  const output = run(target, "--overwrite");
  assert.match(output, /replace link \.claude\/skills\/trace-codebase/);
  assert.ok(existsSync(join(link, "SKILL.md")));
});

test("rejects symlinked skill parents before writing through them", () => {
  const target = makeTarget();
  const outside = makeTarget();
  mkdirSync(join(target, ".claude"));
  symlinkSync(outside, join(target, ".claude", "skills"), "dir");
  const beforeTarget = snapshot(target);
  const beforeOutside = snapshot(outside);

  assert.throws(() => run(target, "--prune"), /symlinked or non-directory parent/);
  assert.deepEqual(snapshot(target), beforeTarget);
  assert.deepEqual(snapshot(outside), beforeOutside);
});

test("accepts an explicitly selected symlinked project root", () => {
  const project = makeTarget();
  const alias = join(makeTarget(), "project");
  symlinkSync(project, alias, "dir");

  run(alias, "--dry-run", "--no-links");
  assert.deepEqual(snapshot(project), {});
  run(alias, "--no-links");
  assert.ok(existsSync(join(project, ".agents", "skills", "simplify", "SKILL.md")));
  assert.equal(existsSync(join(project, ".claude")), false);
});

test("dry run does not create files", () => {
  const target = makeTarget();

  execFileSync(process.execPath, [binPath, "--target", target, "--dry-run"], {
    encoding: "utf8",
  });

  assert.equal(existsSync(join(target, ".agents")), false);
});

test("prunes exact retired 0.2.1 sources, copies, and links", () => {
  const target = makeTarget();
  run(target);

  for (const name of Object.keys(retiredFixtures)) {
    installRetiredSource(target, name);
    installRetiredLink(target, ".claude", name);
    installRetiredCopy(target, ".cursor", name);
  }

  const withoutPrune = run(target);
  assert.match(withoutPrune, /Retired skills found:.*skills-init --target <project> --prune/);
  assert.ok(existsSync(retiredSource(target, "plan-changes")));

  const output = run(target, "--prune");
  assert.match(output, /remove retired source: \.agents\/skills\/plan-changes/);
  for (const name of Object.keys(retiredFixtures)) {
    assert.equal(existsSync(retiredSource(target, name)), false);
    assert.equal(snapshot(retiredView(target, ".claude", name)), null);
    assert.equal(snapshot(retiredView(target, ".cursor", name)), null);
  }
  assert.ok(existsSync(join(target, ".agents", "skills", "create-verification", "SKILL.md")));
});

test("preserves customized retired sources, extra files, and their tool views", () => {
  const target = makeTarget();
  run(target);
  const modifiedSource = installRetiredSource(target, "plan-changes");
  writeFileSync(join(modifiedSource, "SKILL.md"), "custom skill\n");
  const modifiedLink = installRetiredLink(target, ".claude", "plan-changes");
  const modifiedCopy = installRetiredCopy(target, ".cursor", "plan-changes");
  const extraSource = installRetiredSource(target, "interface-review");
  writeFileSync(join(extraSource, "notes.md"), "keep me\n");
  const extraLink = installRetiredLink(target, ".claude", "interface-review");

  const output = run(target, "--prune");
  assert.match(output, /preserve retired \.agents\/skills\/plan-changes/);
  assert.match(output, /preserve retired \.agents\/skills\/interface-review/);
  assert.ok(existsSync(join(modifiedSource, "SKILL.md")));
  assert.ok(existsSync(join(extraSource, "notes.md")));
  assert.ok(lstatSync(modifiedLink).isSymbolicLink());
  assert.ok(existsSync(join(modifiedCopy, "SKILL.md")));
  assert.ok(lstatSync(extraLink).isSymbolicLink());
});

test("keeps a modified tool copy while removing an exact source and owned link", () => {
  const target = makeTarget();
  run(target);
  installRetiredSource(target, "outcome-first-workflows");
  const link = installRetiredLink(target, ".claude", "outcome-first-workflows");
  const copy = installRetiredCopy(target, ".cursor", "outcome-first-workflows");
  writeFileSync(join(copy, "SKILL.md"), "custom tool copy\n");

  run(target, "--prune");
  assert.equal(existsSync(retiredSource(target, "outcome-first-workflows")), false);
  assert.equal(snapshot(link), null);
  assert.equal(readFileSync(join(copy, "SKILL.md"), "utf8"), "custom tool copy\n");
});

test("removes an owned dangling link but preserves a custom link", () => {
  const target = makeTarget();
  run(target);
  const owned = installRetiredLink(target, ".claude", "plan-changes");
  const custom = retiredView(target, ".cursor", "plan-changes");
  mkdirSync(dirname(custom), { recursive: true });
  symlinkSync("../somewhere-else", custom, "dir");

  const output = run(target, "--prune");
  assert.match(output, /remove retired link: \.claude\/skills\/plan-changes/);
  assert.equal(snapshot(owned), null);
  assert.equal(readlinkSync(custom), "../somewhere-else");
});

test("does not prune through a symlinked tool directory", () => {
  const target = makeTarget();
  const outside = makeTarget();
  mkdirSync(join(outside, "skills"), { recursive: true });
  mkdirSync(join(target, ".claude"), { recursive: true });
  symlinkSync(join(outside, "skills"), join(target, ".claude", "skills"), "dir");
  const redirected = join(outside, "skills", "plan-changes");
  mkdirSync(redirected);
  writeFileSync(join(redirected, "SKILL.md"), retiredFixtures["plan-changes"]);

  const output = run(target, "--prune", "--no-links");
  assert.match(output, /preserve retired \.claude\/skills\/plan-changes/);
  assert.ok(existsSync(join(redirected, "SKILL.md")));
});

test("dry-run prune reports the same removals and writes nothing", () => {
  const target = makeTarget();
  run(target);
  installRetiredSource(target, "plan-changes");
  installRetiredLink(target, ".claude", "plan-changes");
  installRetiredCopy(target, ".cursor", "plan-changes");
  const before = snapshot(target);

  const preview = run(target, "--dry-run", "--prune");
  assert.deepEqual(snapshot(target), before);
  const actual = run(target, "--prune");
  const removalLines = (output) => output.split("\n").filter((line) => line.includes("remove retired"))
    .map((line) => line.replace("[dry-run] ", ""));
  assert.deepEqual(removalLines(preview), removalLines(actual));
});

test("does not prune retired guidance when installing its replacement fails", () => {
  const target = makeTarget();
  const source = installRetiredSource(target, "plan-changes");
  const conflict = join(target, ".claude", "skills", "simplify");
  mkdirSync(conflict, { recursive: true });
  writeFileSync(join(conflict, "SKILL.md"), "custom installed skill\n");

  assert.throws(() => run(target, "--prune"), /already exists and is not a symlink/);
  assert.deepEqual(readFileSync(join(source, "SKILL.md")), retiredFixtures["plan-changes"]);
  assert.equal(readFileSync(join(conflict, "SKILL.md"), "utf8"), "custom installed skill\n");
});
