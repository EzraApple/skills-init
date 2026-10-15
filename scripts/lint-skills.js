import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readSkillMetadata } from "./skill-metadata.js";

const packageRoot = fileURLToPath(new URL("..", import.meta.url));
const descriptionLimit = 1024;
const namePattern = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
const xmlTagPattern = /<[A-Za-z][^>]*>/;

function markdownLinks(content) {
  let fence;
  const prose = content.split("\n").filter((line) => {
    const marker = /^\s*(`{3,}|~{3,})/.exec(line);
    if (marker) {
      if (!fence) fence = marker[1][0];
      else if (marker[1][0] === fence) fence = undefined;
      return false;
    }
    return !fence;
  }).join("\n");
  return [...prose.matchAll(/\[[^\]]*\]\((?:<([^>]+)>|([^\s)]+))(?:\s+"[^"]*")?\)/g)]
    .map((match) => match[1] ?? match[2]);
}

function checkReferences(directory, errors) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      checkReferences(path, errors);
    } else if (entry.name.endsWith(".md")) {
      for (const link of markdownLinks(readFileSync(path, "utf8"))) {
        if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(link)) continue;
        try {
          const target = decodeURIComponent(link.split(/[?#]/, 1)[0]);
          if (target && !existsSync(resolve(dirname(path), target))) {
            errors.push(`${path} has a missing reference: ${link}`);
          }
        } catch {
          errors.push(`${path} has an invalid reference: ${link}`);
        }
      }
    }
  }
}

export function lintSkills(skillsRoot) {
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

    let frontmatter;
    try {
      frontmatter = readSkillMetadata(skillPath);
    } catch (error) {
      errors.push(error.message);
      continue;
    }

    if (!namePattern.test(frontmatter.name)) {
      errors.push(`${skillPath} has invalid name "${frontmatter.name}"`);
    } else if (frontmatter.name !== skillName) {
      errors.push(`${skillPath} name does not match directory "${skillName}"`);
    }

    if (frontmatter.description.length > descriptionLimit) {
      errors.push(`${skillPath} description exceeds ${descriptionLimit} characters`);
    }
    if (xmlTagPattern.test(frontmatter.description)) {
      errors.push(`${skillPath} description contains XML-style angle brackets`);
    }
    checkReferences(join(skillsRoot, skillName), errors);
  }
  return errors;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const errors = lintSkills(join(packageRoot, "skills"));
  if (errors.length > 0) {
    console.error("Skill lint failed:");
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
  } else {
    console.log("All skills passed metadata and reference checks.");
  }
}
