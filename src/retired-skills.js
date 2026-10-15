import { createHash } from "node:crypto";
import { lstatSync, readFileSync, readdirSync, readlinkSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";

// SHA256 of the SKILL.md files shipped in the 0.2.1 bundle.
const retiredSkills = {
  "outcome-first-workflows": "6e3386fa3ec0716ae2b5798826c2f0784ad7cd782d1aedc32edcae28bade7bdb",
  "plan-changes": "dd9d4fc0620fc25fb5a77f9a4b21b047c499dce4f4678227f0e12c64471632dd",
  "interface-review": "c9f9e0206ca1bc1e904022bea322d52deb1bed628cdf1a2ec9a15c6006d53613",
};

export function findEntry(path) {
  try {
    return lstatSync(path);
  } catch (error) {
    if (error.code === "ENOENT" || error.code === "ENOTDIR") return null;
    throw error;
  }
}

export function hasOwnedParents(targetRoot, path) {
  const rootEntry = findEntry(targetRoot);
  if (rootEntry && !rootEntry.isDirectory()) return false;
  const parts = relative(targetRoot, dirname(path)).split(sep).filter(Boolean);
  let parent = targetRoot;
  for (const part of parts) {
    parent = join(parent, part);
    const entry = findEntry(parent);
    if (entry && !entry.isDirectory()) return false;
  }
  return true;
}

function matchesBundleCopy(path, digest) {
  const entry = findEntry(path);
  if (!entry?.isDirectory()) return false;
  const files = readdirSync(path);
  if (files.length !== 1 || files[0] !== "SKILL.md") return false;
  if (!findEntry(join(path, "SKILL.md"))?.isFile()) return false;
  const actual = createHash("sha256").update(readFileSync(join(path, "SKILL.md"))).digest("hex");
  return actual === digest;
}

function expectedLinkTarget(linkPath, sourcePath) {
  const target = relative(dirname(linkPath), sourcePath);
  return target.startsWith(".") ? target : `.${target ? `/${target}` : ""}`;
}

function isOwnedLink(linkPath, sourcePath) {
  const actualTarget = readlinkSync(linkPath);
  if (actualTarget === expectedLinkTarget(linkPath, sourcePath)) return true;
  return process.platform === "win32" && resolve(dirname(linkPath), actualTarget) === sourcePath;
}

export function planRetiredSkillPrune(targetRoot, toolSkillDirs) {
  const actions = [];
  const preserved = [];
  const found = new Set();

  for (const [name, digest] of Object.entries(retiredSkills)) {
    const sourcePath = join(targetRoot, ".agents", "skills", name);
    const sourceEntry = findEntry(sourcePath);
    if (sourceEntry) found.add(name);
    const sourceOwned = hasOwnedParents(targetRoot, sourcePath) && matchesBundleCopy(sourcePath, digest);
    const sourceAbsent = !sourceEntry && hasOwnedParents(targetRoot, sourcePath);

    if (sourceEntry && !sourceOwned) {
      preserved.push({ path: sourcePath, reason: "customized source; tool views kept" });
    }

    for (const toolDir of toolSkillDirs) {
      const toolPath = join(targetRoot, toolDir, name);
      const entry = findEntry(toolPath);
      if (!entry) continue;
      found.add(name);

      if (!hasOwnedParents(targetRoot, toolPath) || (!sourceOwned && !sourceAbsent)) {
        preserved.push({ path: toolPath, reason: "customized source or parent; tool view kept" });
      } else if (entry.isSymbolicLink()) {
        if (isOwnedLink(toolPath, sourcePath)) {
          actions.push({ path: toolPath, kind: "link" });
        } else {
          preserved.push({ path: toolPath, reason: "custom link" });
        }
      } else if (matchesBundleCopy(toolPath, digest)) {
        actions.push({ path: toolPath, kind: "copy" });
      } else {
        preserved.push({ path: toolPath, reason: "custom tool copy or entry" });
      }
    }

    if (sourceOwned) actions.push({ path: sourcePath, kind: "source" });
  }

  return { actions, preserved, found: [...found] };
}
