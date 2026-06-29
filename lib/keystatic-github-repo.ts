/** Shared GitHub repo env lookup for Keystatic admin + storage. */
export function getKeystaticGithubRepo(): string | undefined {
  const repo =
    process.env.KEYSTATIC_GITHUB_REPO ??
    process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO;

  if (!repo?.includes("/")) {
    return undefined;
  }

  return repo;
}
