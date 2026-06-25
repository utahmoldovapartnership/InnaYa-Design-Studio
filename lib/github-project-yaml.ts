import { isKeystaticGithubStorage } from "@/lib/keystatic-admin-access";

function getGithubRepo(): string | null {
  const repo =
    process.env.KEYSTATIC_GITHUB_REPO ??
    process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO;
  return repo?.includes("/") ? repo : null;
}

function getAccessTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  for (const part of cookieHeader.split(";")) {
    const [name, ...valueParts] = part.trim().split("=");
    if (name === "keystatic-gh-access-token") {
      return decodeURIComponent(valueParts.join("="));
    }
  }

  return null;
}

export async function fetchProjectYamlFromGithub(
  relativePath: string,
  branch: string,
  request?: Request,
): Promise<string | null> {
  const repo = getGithubRepo();
  if (!repo || !isKeystaticGithubStorage()) {
    return null;
  }

  const token = request ? getAccessTokenFromRequest(request) : null;
  const apiUrl = `https://api.github.com/repos/${repo}/contents/${relativePath}?ref=${encodeURIComponent(branch)}`;

  if (token) {
    try {
      const response = await fetch(apiUrl, {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${token}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
        cache: "no-store",
      });

      if (response.ok) {
        const payload = (await response.json()) as { content?: string };
        if (payload.content) {
          return Buffer.from(payload.content, "base64").toString("utf8");
        }
      }
    } catch {
      // Fall through to raw URL.
    }
  }

  try {
    const rawUrl = `https://raw.githubusercontent.com/${repo}/${branch}/${relativePath}`;
    const response = await fetch(rawUrl, { cache: "no-store" });
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}
