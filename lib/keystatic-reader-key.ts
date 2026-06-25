import { getAllowedDirectories } from "@keystatic/core/api/utils";
import type { Config } from "@keystatic/core";
import { createHash } from "crypto";
import fs from "fs/promises";
import path from "path";
import keystaticConfig from "@/keystatic.config";

async function getDirKeyComponents(
  dirpath: string,
): Promise<Array<[string, number] | [string, unknown[]] | null>> {
  return Promise.all(
    (
      await fs.readdir(dirpath, { withFileTypes: true })
    ).map(async (entry) => {
      const joined = path.join(dirpath, entry.name);
      if (entry.isFile()) {
        const stat = await fs.stat(joined);
        return [entry.name, stat.mtimeMs] as [string, number];
      }
      if (entry.isDirectory() && entry.name !== "node_modules") {
        return [entry.name, await getDirKeyComponents(joined)] as [
          string,
          unknown[],
        ];
      }
      return null;
    }),
  );
}

async function getPathKeyComponents(
  targetPath: string,
): Promise<[string, number] | unknown[] | null> {
  try {
    const stat = await fs.stat(targetPath);
    if (stat.isFile()) {
      return [path.basename(targetPath), stat.mtimeMs];
    }
    if (stat.isDirectory()) {
      return await getDirKeyComponents(targetPath);
    }
  } catch {
    return null;
  }
  return null;
}

export function getContentPaths(): string[] {
  const directories = getAllowedDirectories(keystaticConfig as Config);
  const repoPath = path.resolve(process.cwd());
  return directories.map((entry) => path.join(repoPath, entry));
}

export async function getContentReaderKey(): Promise<string> {
  const paths = getContentPaths();
  const data = JSON.stringify(
    await Promise.all(
      paths.map(async (entry) => [entry, await getPathKeyComponents(entry)]),
    ),
  );
  return createHash("sha1").update(data).digest("hex");
}
