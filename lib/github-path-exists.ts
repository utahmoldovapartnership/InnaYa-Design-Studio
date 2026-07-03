function getGithubRepo(): string | null {
  const repo =
    process.env.KEYSTATIC_GITHUB_REPO ??
    process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO;
  return repo?.includes("/") ? repo : null;
}

export function getGithubAccessTokenFromCookie(
  cookieHeader: string | null,
): string | null {
  if (!cookieHeader) return null;

  for (const part of cookieHeader.split(";")) {
    const [name, ...valueParts] = part.trim().split("=");
    if (name === "keystatic-gh-access-token") {
      return decodeURIComponent(valueParts.join("="));
    }
  }

  return null;
}

export async function githubPathExistsAtRef(
  path: string,
  ref: string,
  token?: string | null,
): Promise<boolean> {
  const repo = getGithubRepo();
  if (!repo) return true;

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${repo}/contents/${path}?ref=${encodeURIComponent(ref)}`,
      { headers, cache: "no-store" },
    );
    return response.ok;
  } catch {
    return true;
  }
}

export async function filterExistingGithubDeletions(
  deletions: Array<{ path: string }>,
  ref: string,
  token?: string | null,
): Promise<Array<{ path: string }>> {
  if (!deletions.length || !ref) return deletions;

  const checked = await Promise.all(
    deletions.map(async (deletion) => {
      const exists = await githubPathExistsAtRef(deletion.path, ref, token);
      return exists ? deletion : null;
    }),
  );

  return checked.filter((entry): entry is { path: string } => entry !== null);
}
