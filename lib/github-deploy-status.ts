import { getKeystaticGithubRepo } from "@/lib/keystatic-github-repo";
import { getGithubAccessTokenFromCookie } from "@/lib/github-path-exists";

export type DeployStatusState = "building" | "ready" | "error";

export type DeployStatus = {
  state: DeployStatusState;
  message: string;
  commitSha: string;
  details?: string;
};

type GithubHeaders = Record<string, string>;

function githubHeaders(token?: string | null): GithubHeaders {
  const headers: GithubHeaders = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

function parseRepo(): { owner: string; name: string } | null {
  const repo = getKeystaticGithubRepo();
  if (!repo) return null;
  const [owner, name] = repo.split("/");
  if (!owner || !name) return null;
  return { owner, name };
}

function statusFromChecks(
  combinedState: string | undefined,
  checkStates: string[],
): DeployStatusState {
  if (checkStates.some((state) => state === "failure" || state === "cancelled")) {
    return "error";
  }

  if (
    checkStates.length > 0 &&
    checkStates.every((state) => state === "success" || state === "skipped")
  ) {
    return "ready";
  }

  if (combinedState === "success") {
    return "ready";
  }

  if (combinedState === "failure") {
    return "error";
  }

  return "building";
}

export async function getGithubDeployStatus(
  commitSha: string,
  token?: string | null,
): Promise<DeployStatus> {
  const repo = parseRepo();
  if (!repo) {
    return {
      state: "ready",
      message: "Deploy status unavailable",
      commitSha,
    };
  }

  const headers = githubHeaders(token);
  const base = `https://api.github.com/repos/${repo.owner}/${repo.name}/commits/${commitSha}`;

  try {
    const [statusResponse, checksResponse] = await Promise.all([
      fetch(`${base}/status`, { headers, cache: "no-store" }),
      fetch(`${base}/check-runs`, { headers, cache: "no-store" }),
    ]);

    let combinedState: string | undefined;
    if (statusResponse.ok) {
      const statusPayload = (await statusResponse.json()) as {
        state?: string;
      };
      combinedState = statusPayload.state;
    }

    const checkStates: string[] = [];
    if (checksResponse.ok) {
      const checksPayload = (await checksResponse.json()) as {
        check_runs?: Array<{ status?: string; conclusion?: string | null; name?: string }>;
      };

      for (const run of checksPayload.check_runs ?? []) {
        if (run.status !== "completed") {
          checkStates.push("pending");
          continue;
        }
        checkStates.push(run.conclusion ?? "pending");
      }
    }

    const state = statusFromChecks(combinedState, checkStates);

    if (state === "ready") {
      return {
        state,
        message: "Deployment finished",
        commitSha,
      };
    }

    if (state === "error") {
      return {
        state,
        message: "Deployment failed",
        commitSha,
        details: "Check the Vercel dashboard for details.",
      };
    }

    return {
      state: "building",
      message: "Deployment in progress",
      commitSha,
    };
  } catch {
    return {
      state: "building",
      message: "Checking deployment status",
      commitSha,
    };
  }
}

export function getGithubTokenFromRequest(request: Request): string | null {
  return getGithubAccessTokenFromCookie(request.headers.get("cookie"));
}
