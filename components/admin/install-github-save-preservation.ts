"use client";

import yaml from "js-yaml";
import {
  decodeKeystaticFileContents,
  encodeKeystaticFileContents,
} from "@/lib/keystatic-file-encoding";
import {
  isProjectYamlPath,
  mergeProjectMedia,
  type ProjectYaml,
} from "@/lib/merge-project-media";

type FileAddition = {
  path: string;
  contents: string;
};

type GraphQLRequestBody = {
  query?: string;
  variables?: {
    input?: {
      fileChanges?: {
        additions?: FileAddition[];
        deletions?: Array<{ path: string }>;
      };
    };
  };
};

function getGithubRepo(): string | null {
  const repo = process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO;
  return repo?.includes("/") ? repo : null;
}

function getBranchFromPath(): string {
  const match = window.location.pathname.match(/\/edit\/branch\/([^/]+)/);
  return match?.[1] ?? "main";
}

async function fetchExistingProjectYaml(
  filePath: string,
  branch: string,
): Promise<ProjectYaml | null> {
  try {
    const response = await fetch(
      `/api/admin/project-yaml/${filePath}?branch=${encodeURIComponent(branch)}`,
    );
    if (response.ok) {
      return yaml.load(await response.text()) as ProjectYaml;
    }
  } catch {
    // Fall through to raw GitHub.
  }

  const repo = getGithubRepo();
  if (!repo) return null;

  try {
    const response = await fetch(
      `https://raw.githubusercontent.com/${repo}/${branch}/${filePath}`,
      { cache: "no-store" },
    );
    if (!response.ok) return null;
    return yaml.load(await response.text()) as ProjectYaml;
  } catch {
    return null;
  }
}

async function preserveFileChanges(
  additions: FileAddition[],
): Promise<FileAddition[]> {
  const branch = getBranchFromPath();

  return Promise.all(
    additions.map(async (addition) => {
      if (!isProjectYamlPath(addition.path)) {
        return addition;
      }

      const existing = await fetchExistingProjectYaml(addition.path, branch);
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
    }),
  );
}

function isCreateCommitRequest(body: GraphQLRequestBody): boolean {
  const fileChanges = body.variables?.input?.fileChanges;
  return Boolean(
    body.query?.includes("createCommitOnBranch") &&
      fileChanges?.additions?.length,
  );
}

export function installGithubSavePreservation(): () => void {
  if (!getGithubRepo()) {
    return () => {};
  }

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input, init) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof Request
          ? input.url
          : input.toString();

    if (
      url.includes("api.github.com/graphql") &&
      init?.body &&
      typeof init.body === "string"
    ) {
      try {
        const body = JSON.parse(init.body) as GraphQLRequestBody;

        if (isCreateCommitRequest(body)) {
          const fileChanges = body.variables!.input!.fileChanges!;
          const preservedAdditions = await preserveFileChanges(
            fileChanges.additions ?? [],
          );

          const nextBody: GraphQLRequestBody = {
            ...body,
            variables: {
              ...body.variables,
              input: {
                ...body.variables!.input!,
                fileChanges: {
                  ...fileChanges,
                  additions: preservedAdditions,
                },
              },
            },
          };

          init = {
            ...init,
            body: JSON.stringify(nextBody),
          };
        }
      } catch {
        // If parsing fails, continue with the original request.
      }
    }

    return originalFetch(input, init);
  };

  return () => {
    window.fetch = originalFetch;
  };
}
