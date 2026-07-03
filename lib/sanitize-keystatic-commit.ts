import yaml from "js-yaml";
import {
  decodeKeystaticFileContents,
  encodeKeystaticFileContents,
} from "@/lib/keystatic-file-encoding";
import { filterExistingGithubDeletions } from "@/lib/github-path-exists";
import {
  isPageSingletonYamlPath,
  normalizePageMediaYaml,
} from "@/lib/normalize-page-media-yaml";
import { mergePageMediaYaml } from "@/lib/merge-page-media-yaml";
import {
  isProjectYamlPath,
  mergeProjectMedia,
  type ProjectYaml,
} from "@/lib/merge-project-media";

type FileAddition = {
  path: string;
  contents: string;
};

type FileChanges = {
  additions?: FileAddition[];
  deletions?: Array<{ path: string }>;
};

function normalizeYamlAddition(addition: FileAddition): FileAddition {
  if (!isPageSingletonYamlPath(addition.path)) {
    return addition;
  }

  const parsed = yaml.load(
    decodeKeystaticFileContents(addition.contents),
  ) as unknown;
  const normalized = normalizePageMediaYaml(addition.path, parsed);

  return {
    path: addition.path,
    contents: encodeKeystaticFileContents(
      yaml.dump(normalized, { lineWidth: -1 }),
    ),
  };
}

export function mergeProjectYamlAddition(
  addition: FileAddition,
  existing: ProjectYaml | null,
): FileAddition {
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

export function mergePageSingletonYamlAddition(
  addition: FileAddition,
  existing: unknown | null,
): FileAddition {
  const incoming = yaml.load(
    decodeKeystaticFileContents(addition.contents),
  ) as unknown;
  const normalized = normalizePageMediaYaml(addition.path, incoming);
  const merged = existing
    ? mergePageMediaYaml(addition.path, normalized, existing)
    : normalized;

  return {
    path: addition.path,
    contents: encodeKeystaticFileContents(
      yaml.dump(merged, { lineWidth: -1 }),
    ),
  };
}

export async function sanitizeKeystaticFileChanges(
  fileChanges: FileChanges,
  ref: string,
  token?: string | null,
  mergeExistingYaml?: (addition: FileAddition) => Promise<FileAddition>,
): Promise<FileChanges> {
  const additions = await Promise.all(
    (fileChanges.additions ?? []).map(async (addition) => {
      const normalized = normalizeYamlAddition(addition);

      if (
        mergeExistingYaml &&
        (isProjectYamlPath(addition.path) ||
          isPageSingletonYamlPath(addition.path))
      ) {
        return mergeExistingYaml(normalized);
      }

      return normalized;
    }),
  );

  const deletions = await filterExistingGithubDeletions(
    fileChanges.deletions ?? [],
    ref,
    token,
  );

  return {
    ...fileChanges,
    additions,
    deletions,
  };
}
