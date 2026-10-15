import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  readlinkSync,
  realpathSync,
  rmSync,
  symlinkSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { findEntry, hasOwnedParents, planRetiredSkillPrune } from "./retired-skills.js";

const packageRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const toolSkillDirs = [
  ".claude/skills",
  ".cursor/skills",
  ".codex/skills",
  ".opencode/skills",
];

class UsageError extends Error {
  constructor(message) {
    super(message);
    this.name = "UsageError";
  }
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function printHelp() {
  console.log(`skills-init

Usage:
  skills-init [options]

Options:
  --target <dir>       Project directory to scaffold. Defaults to cwd.
  --overwrite          Replace existing installed skill directories.
  --prune              Remove unmodified retired 0.2.1 skills and tool views.
  --dry-run            Print planned writes without changing files.
  --no-links           Copy skills into .agents only; do not create tool links.
  --copy-links         Copy skills into tool folders instead of symlinking.
  --list               Print included skills.
  --help               Show this help.
  --version            Print package version.
`);
}

function parseArgs(argv) {
  const options = {
    copyLinks: false,
    dryRun: false,
    links: true,
    overwrite: false,
    prune: false,
    target: process.cwd(),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--version" || arg === "-v") {
      options.version = true;
    } else if (arg === "--list") {
      options.list = true;
    } else if (arg === "--target") {
      const value = argv[++index];
      if (!value) {
        throw new UsageError("--target requires a directory");
      }
      options.target = value;
    } else if (arg === "--overwrite") {
      options.overwrite = true;
    } else if (arg === "--prune") {
      options.prune = true;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--no-links") {
      options.links = false;
    } else if (arg === "--copy-links") {
      options.copyLinks = true;
    } else {
      throw new UsageError(`Unknown option: ${arg}`);
    }
  }

  return options;
}

function includedSkills() {
  return readdirSync(join(packageRoot, "skills"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function logStep({ dryRun, message }) {
  console.log(`${dryRun ? "[dry-run] " : ""}${message}`);
}

function ensureDir(path, options) {
  if (options.dryRun) {
    logStep({ dryRun: true, message: `mkdir -p ${path}` });
    return;
  }
  mkdirSync(path, { recursive: true });
}

function copyDirectory({ from, to, label, options }) {
  if (findEntry(to)) {
    if (!options.overwrite) {
      logStep({
        dryRun: options.dryRun,
        message: `skip existing ${label}: ${to}`,
      });
      return;
    }
    if (!options.dryRun) {
      rmSync(to, { recursive: true, force: true });
    }
  }

  logStep({
    dryRun: options.dryRun,
    message: `copy ${label}: ${relative(options.targetRoot, to) || "."}`,
  });

  if (!options.dryRun) {
    mkdirSync(dirname(to), { recursive: true });
    cpSync(from, to, { recursive: true, dereference: false });
  }
}

function relativeLinkTarget({ fromPath, toPath }) {
  const target = relative(dirname(fromPath), toPath);
  return target.startsWith(".") ? target : `.${target ? `/${target}` : ""}`;
}

function installToolSkill({ skillName, linkDir, sourceSkillDir, options }) {
  const linkPath = join(linkDir, skillName);

  if (options.copyLinks) {
    copyDirectory({
      from: sourceSkillDir,
      to: linkPath,
      label: `${skillName} tool copy`,
      options,
    });
    return;
  }

  const expectedTarget = relativeLinkTarget({
    fromPath: linkPath,
    toPath: sourceSkillDir,
  });

  const stat = findEntry(linkPath);
  if (stat) {
    if (!stat.isSymbolicLink()) {
      throw new UsageError(
        `${linkPath} already exists and is not a symlink. Move it aside or rerun with --copy-links.`,
      );
    }

    if (readlinkSync(linkPath) === expectedTarget) {
      logStep({
        dryRun: options.dryRun,
        message: `keep link ${relative(options.targetRoot, linkPath)} -> ${expectedTarget}`,
      });
      return;
    }

    if (!options.overwrite) {
      throw new UsageError(
        `${linkPath} points elsewhere. Rerun with --overwrite to replace this custom link.`,
      );
    }

    logStep({
      dryRun: options.dryRun,
      message: `replace link ${relative(options.targetRoot, linkPath)} -> ${expectedTarget}`,
    });
    if (!options.dryRun) {
      rmSync(linkPath, { force: true });
    }
  } else {
    logStep({
      dryRun: options.dryRun,
      message: `link ${relative(options.targetRoot, linkPath)} -> ${expectedTarget}`,
    });
  }

  if (!options.dryRun) {
    mkdirSync(dirname(linkPath), { recursive: true });
    symlinkSync(expectedTarget, linkPath, process.platform === "win32" ? "junction" : "dir");
  }
}

function updateRetiredSkills(options) {
  const { targetRoot } = options;
  const retired = planRetiredSkillPrune(targetRoot, toolSkillDirs);
  if (options.prune) {
    for (const { path, reason } of retired.preserved) {
      logStep({ dryRun: options.dryRun, message: `preserve retired ${relative(targetRoot, path)}: ${reason}` });
    }
    for (const { path, kind } of retired.actions) {
      logStep({ dryRun: options.dryRun, message: `remove retired ${kind}: ${relative(targetRoot, path)}` });
      if (!options.dryRun) {
        rmSync(path, { recursive: kind !== "link", force: true });
      }
    }
  } else if (retired.found.length > 0) {
    console.log(`Retired skills found: ${retired.found.join(", ")}. To remove only unmodified 0.2.1 copies, run skills-init --target <project> --prune.`);
  }
}

function installSkills(options) {
  const requestedRoot = resolve(options.target);
  const targetRoot = existsSync(requestedRoot) ? realpathSync(requestedRoot) : requestedRoot;
  const runOptions = { ...options, targetRoot };
  const agentsSkillsDir = join(targetRoot, ".agents", "skills");
  const skillNames = includedSkills();

  const parentDirs = [".agents/skills", ...(options.links ? toolSkillDirs : [])];
  for (const directory of parentDirs) {
    const probe = join(targetRoot, directory, "unused");
    if (!hasOwnedParents(targetRoot, probe)) {
      throw new UsageError(
        `${directory} has a symlinked or non-directory parent. Use a project-local skills directory or --no-links for tool directories.`,
      );
    }
  }

  ensureDir(agentsSkillsDir, runOptions);
  for (const skillName of skillNames) {
    const sourceSkillDir = join(packageRoot, "skills", skillName);
    const targetSkillDir = join(agentsSkillsDir, skillName);
    if (!existsSync(join(sourceSkillDir, "SKILL.md"))) {
      throw new UsageError(`Included skill is missing SKILL.md: ${skillName}`);
    }

    copyDirectory({
      from: sourceSkillDir,
      to: targetSkillDir,
      label: `${skillName} skill`,
      options: runOptions,
    });
  }

  if (!options.links) {
    updateRetiredSkills(runOptions);
    return;
  }

  for (const toolDir of toolSkillDirs) {
    const linkDir = join(targetRoot, toolDir);
    ensureDir(linkDir, runOptions);

    for (const skillName of skillNames) {
      installToolSkill({
        linkDir,
        options: runOptions,
        skillName,
        sourceSkillDir: join(agentsSkillsDir, skillName),
      });
    }
  }

  updateRetiredSkills(runOptions);
}

function listSkills() {
  for (const skillName of includedSkills()) {
    console.log(skillName);
  }
}

export async function run(argv) {
  const options = parseArgs(argv);

  if (options.help) {
    printHelp();
    return;
  }

  if (options.version) {
    const packageJson = readJson(join(packageRoot, "package.json"));
    console.log(packageJson.version);
    return;
  }

  if (options.list) {
    listSkills();
    return;
  }

  installSkills(options);
}
