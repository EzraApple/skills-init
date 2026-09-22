import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  readlinkSync,
  rmSync,
  symlinkSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

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
  if (existsSync(to)) {
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

  if (existsSync(linkPath)) {
    const stat = lstatSync(linkPath);
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

function installSkills(options) {
  const targetRoot = resolve(options.target);
  const runOptions = { ...options, targetRoot };
  const agentsSkillsDir = join(targetRoot, ".agents", "skills");
  const skillNames = includedSkills();

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
