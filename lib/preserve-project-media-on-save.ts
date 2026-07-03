import fs from "fs/promises";
import path from "path";
import yaml from "js-yaml";
import { fetchProjectYamlFromGithub } from "@/lib/github-project-yaml";
import { isKeystaticGithubStorage } from "@/lib/keystatic-admin-access";
import { isPageSingletonYamlPath } from "@/lib/normalize-page-media-yaml";
import {
  isProjectYamlPath,
  type ProjectYaml,
} from "@/lib/merge-project-media";
import {
  mergePageSingletonYamlAddition,
  mergeProjectYamlAddition,
  sanitizeKeystaticFileChanges,
} from "@/lib/sanitize-keystatic-commit";

type KeystaticUpdateBody = {
  additions: Array<{ path: string; contents: string }>;
  deletions: Array<{ path: string }>;
};

function getBranchFromRequest(request: Request): string {
  const referer = request.headers.get("referer");
  const match = referer?.match(/\/edit\/branch\/([^/]+)/);
  return match?.[1] ?? "main";
}

async function loadExistingYaml(
  relativePath: string,
  request?: Request,
): Promise<unknown | null> {
  if (isKeystaticGithubStorage() && request) {
    const branch = getBranchFromRequest(request);
    const fromGithub = await fetchProjectYamlFromGithub(
      relativePath,
      branch,
      request,
    );
    if (fromGithub) {
      return yaml.load(fromGithub);
    }
  }

  try {
    const filePath = path.join(process.cwd(), relativePath);
    const content = await fs.readFile(filePath, "utf8");
    return yaml.load(content);
  } catch {
    return null;
  }
}

export async function preserveProjectMediaInUpdateRequest(
  body: KeystaticUpdateBody,
  request?: Request,
): Promise<KeystaticUpdateBody> {
  const sanitized = await sanitizeKeystaticFileChanges(
    body,
    "",
    null,
    async (addition) => {
      const existing = await loadExistingYaml(addition.path, request);
      if (!existing) {
        return addition;
      }

      if (isProjectYamlPath(addition.path)) {
        return mergeProjectYamlAddition(addition, existing as ProjectYaml);
      }

      if (isPageSingletonYamlPath(addition.path)) {
        return mergePageSingletonYamlAddition(addition, existing);
      }

      return addition;
    },
  );

  return {
    additions: sanitized.additions ?? [],
    deletions: sanitized.deletions ?? [],
  };
}
