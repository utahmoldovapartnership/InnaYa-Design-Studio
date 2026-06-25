import { watch } from "chokidar";
import fs from "fs/promises";
import {
  getContentPaths,
  getContentReaderKey,
} from "@/lib/keystatic-reader-key";

export const runtime = "nodejs";

function createWatcher(watcher: ReturnType<typeof watch>) {
  let state: "init" | "started" | "ready" = "init";
  let eventQueue: Array<{ type: string; path?: string }> = [];
  let resolveNext: (() => void) | null = null;
  let lastError: Error | null = null;

  function emitEvent(event: { type: string; path?: string }) {
    eventQueue.push(event);
    if (eventQueue.length === 1) {
      resolveNext?.();
    }
  }

  return async () => {
    if (lastError) {
      const err = lastError;
      lastError = null;
      throw err;
    }

    if (state === "init") {
      state = "started";
      watcher.on("ready", () => {
        state = "ready";
        emitEvent({ type: "ready" });
      });
      for (const eventName of ["add", "change", "unlink"] as const) {
        watcher.on(eventName, (filePath) => {
          if (state !== "ready") return;
          emitEvent({ type: eventName, path: filePath });
        });
      }
      watcher.on("error", (err) => {
        lastError = err instanceof Error ? err : new Error(String(err));
      });
    }

    if (eventQueue.length === 0) {
      await new Promise<void>((resolve) => {
        resolveNext = resolve;
      });
    }

    const currentEventQueue = eventQueue;
    eventQueue = [];
    resolveNext = null;
    return currentEventQueue;
  };
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ key: string }> },
) {
  if (process.env.NODE_ENV !== "development") {
    return new Response(null, { status: 404 });
  }

  const { key } = await context.params;
  const watchTargets = (
    await Promise.all(
      getContentPaths().map(async (entry) => {
        try {
          await fs.stat(entry);
          return entry;
        } catch {
          return null;
        }
      }),
    )
  ).filter((entry): entry is string => entry !== null);
  const readerKey = await getContentReaderKey();

  if (key !== readerKey) {
    return new Response(readerKey, { status: 200 });
  }

  const watcher = watch(watchTargets, { ignored: [/node_modules/] });
  const waitForNextEvent = createWatcher(watcher);

  try {
    while (true) {
      await waitForNextEvent();
      const nextKey = await getContentReaderKey();
      if (key !== nextKey) {
        return new Response(nextKey, { status: 200 });
      }
    }
  } catch {
    return new Response(null, { status: 500 });
  } finally {
    await watcher.close();
  }
}
