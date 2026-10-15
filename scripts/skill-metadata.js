import { readFileSync } from "node:fs";
import { parseDocument } from "yaml";

export function readSkillMetadata(path) {
  const source = readFileSync(path, "utf8");
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(source)?.[1];
  if (frontmatter === undefined) throw new Error(`${path} is missing YAML frontmatter`);
  const document = parseDocument(frontmatter);
  if (document.errors.length) {
    throw new Error(`${path} has invalid YAML: ${document.errors[0].message}`);
  }
  const metadata = document.toJS();
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    throw new Error(`${path} frontmatter must be a mapping`);
  }
  for (const field of ["name", "description"]) {
    if (typeof metadata[field] !== "string" || !metadata[field].trim()) {
      throw new Error(`${path} is missing a nonempty string ${field}`);
    }
  }
  return metadata;
}
