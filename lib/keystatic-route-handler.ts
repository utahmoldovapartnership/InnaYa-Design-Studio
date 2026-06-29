import { makeRouteHandler } from "@keystatic/next/route-handler";
import keystaticConfig from "@/keystatic.config";
import { getKeystaticGithubRepo } from "@/lib/keystatic-github-repo";

export function createKeystaticRouteHandler() {
  const repo = getKeystaticGithubRepo();

  if (!repo) {
    return makeRouteHandler({ config: keystaticConfig });
  }

  return makeRouteHandler({
    config: {
      ...keystaticConfig,
      storage: {
        kind: "github",
        repo: repo as `${string}/${string}`,
      },
    },
  });
}
