import fs from "fs/promises";
import yaml from "js-yaml";
import path from "path";
import { fetchProjectYamlFromGithub } from "@/lib/github-project-yaml";
import {
  decodeKeystaticFileContents,
  encodeKeystaticFileContents,
} from "@/lib/keystatic-file-encoding";
import { isKeystaticGithubStorage } from "@/lib/keystatic-admin-access";
import {
  isProjectYamlPath,
  mergeProjectMedia,
  type ProjectYaml,
} from "@/lib/merge-project-media";

type KeystaticUpdateBody = {
  additions: Array<{ path: string; contents: string }>;
  deletions: Array<{ path: string }>;
};

function getBranchFromRequest(request: Request): string {
  const referer = request.headers.get("referer");
  const match = referer?.match(/\/edit\/branch\/([^/]+)/);
  return match?.[1] ?? "main";
}

async function loadExistingProjectYaml(
  relativePath: string,
  request?: Request,
): Promise<ProjectYaml | null> {
  if (isKeystaticGithubStorage() && request) {
    const branch = getBranchFromRequest(request);
    const fromGithub = await fetchProjectYamlFromGithub(
      relativePath,
      branch,
      request,
    );
    if (fromGithub) {
      return yaml.load(fromGithub) as ProjectYaml;
    }
  }

  try {
    const filePath = path.join(process.cwd(), relativePath);
    const content = await fs.readFile(filePath, "utf8");
    return yaml.load(content) as ProjectYaml;
  } catch {
    return null;
  }
}

async function preserveProjectYamlAddition(
  addition: { path: string; contents: string },
  request?: Request,
): Promise<{ path: string; contents: string }> {
  if (!isProjectYamlPath(addition.path)) {
    return addition;
  }

  const existing = await loadExistingProjectYaml(addition.path, request);
  if (!existing) {
    return addition;
  }

  const incoming = yaml.load(
    decodeKeystaticFileContents(addition.contents),
  ) as ProjectYaml;
  const merged = mergeProjectMedia(incoming, existing);

  return {
    path: addition.path,
    contents: encodeKeystaticFileContents(
      yaml.dump(merged, { lineWidth: -1 }),
    ),
  };
}

export async function preserveProjectMediaInUpdateRequest(
  body: KeystaticUpdateBody,
  request?: Request,
): Promise<KeystaticUpdateBody> {
  const additions = await Promise.all(
    body.additions.map((addition) =>
      preserveProjectYamlAddition(addition, request),
    ),
  );

  return {
    ...body,
    additions,
  };
}
