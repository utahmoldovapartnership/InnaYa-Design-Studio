import { createStore, del } from "idb-keyval";

const draftStore = createStore("keystatic", "items");

export function getKeystaticDraftKeyFromPath(
  pathname = window.location.pathname,
): readonly string[] | null {
  const path = pathname.replace(/\/edit\/branch\/[^/]+/, "/edit");

  const singleton = path.match(/\/edit\/singleton\/([^/]+)/);
  if (singleton?.[1]) {
    return ["singleton", singleton[1]];
  }

  const collectionItem = path.match(/\/edit\/collection\/([^/]+)\/item\/([^/]+)/);
  if (collectionItem?.[1] && collectionItem?.[2]) {
    return ["collection", collectionItem[1], collectionItem[2]];
  }

  const collectionCreate = path.match(/\/edit\/collection\/([^/]+)\/create/);
  if (collectionCreate?.[1]) {
    const duplicate = new URL(pathname, window.location.origin).searchParams.get(
      "duplicate",
    );
    return duplicate
      ? ["collection-create", collectionCreate[1], duplicate]
      : ["collection-create", collectionCreate[1]];
  }

  return null;
}

export async function clearKeystaticDraft(
  key: readonly string[],
): Promise<void> {
  await del([...key], draftStore);
}

export async function clearCurrentKeystaticDraft(): Promise<void> {
  const key = getKeystaticDraftKeyFromPath();
  if (!key) return;
  await clearKeystaticDraft(key);
}

export function stripSavedQueryParam(): void {
  const url = new URL(window.location.href);
  if (!url.searchParams.has("saved")) return;
  url.searchParams.delete("saved");
  window.history.replaceState({}, "", url.toString());
}
