import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = fileURLToPath(new URL("..", import.meta.url));
const skillsRoot = join(packageRoot, "skills");
const descriptionLimit = 1024;
const namePattern = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
const xmlTagPattern = /<[A-Za-z][^>]*>/;

function parseFrontmatter(content, path) {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(content);
  if (!match) {
    throw new Error(`${path} is missing YAML frontmatter`);
  }

  const frontmatter = {};
  for (const line of match[1].split("\n")) {
    const field = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (field) {
      frontmatter[field[1]] = field[2].replace(/^["']|["']$/g, "");
    }
  }
  return frontmatter;
}

const errors = [];

for (const entry of readdirSync(skillsRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) {
    continue;
  }

  const skillName = entry.name;
  const skillPath = join(skillsRoot, skillName, "SKILL.md");
  if (!existsSync(skillPath)) {
    errors.push(`${skillName} is missing SKILL.md`);
    continue;
  }

  const content = readFileSync(skillPath, "utf8");
  const frontmatter = parseFrontmatter(content, skillPath);

  if (!frontmatter.name) {
    errors.push(`${skillPath} is missing name`);
  } else if (!namePattern.test(frontmatter.name)) {
    errors.push(`${skillPath} has invalid name "${frontmatter.name}"`);
  } else if (frontmatter.name !== skillName) {
    errors.push(`${skillPath} name does not match directory "${skillName}"`);
  }

  if (!frontmatter.description) {
    errors.push(`${skillPath} is missing description`);
  } else {
    if (!frontmatter.description.startsWith("Use when")) {
      errors.push(`${skillPath} description must start with "Use when"`);
    }
    if (frontmatter.description.length > descriptionLimit) {
      errors.push(`${skillPath} description exceeds ${descriptionLimit} characters`);
    }
    if (xmlTagPattern.test(frontmatter.description)) {
      errors.push(`${skillPath} description contains XML-style angle brackets`);
    }
  }
}

if (errors.length > 0) {
  console.error("Skill lint failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("All skills passed lint.");
