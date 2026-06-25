"use client";

import { useEffect } from "react";
import type {
  GalleryMediaPreview,
  ProjectMediaPreview,
} from "@/lib/admin-project-media";

const LOCALE_TABS = [
  { id: "en", label: "English" },
  { id: "uk", label: "Ukrainian" },
  { id: "ru", label: "Russian" },
] as const;

const UPLOAD_FIELD_LABELS = new Set([
  "Cover image",
  "Image file",
  "Video file",
  "Cover image (thumbnail)",
]);

const UPLOAD_DESCRIPTION_SNIPPETS = [
  "Drag an image here or click to upload",
  "Main image on the portfolio grid",
  "Drag and drop or click to upload",
  "Drag an MP4 here or click to upload",
  "Shown in the portfolio grid",
];

const EMPTY_PROJECT_MEDIA: ProjectMediaPreview = {
  slug: "",
  title: "",
  cover: null,
  gallery: [],
};

function isLocaleTabForm(): boolean {
  return (
    /\/edit\/collection\/projects\/(item|create)/.test(
      window.location.pathname,
    ) || /\/edit\/singleton\/about/.test(window.location.pathname)
  );
}

function getProjectSlugFromPath(): string | null {
  const match = window.location.pathname.match(
    /\/edit\/collection\/projects\/item\/([^/]+)/,
  );
  return match?.[1] ?? null;
}

function isProjectEditForm(): boolean {
  return /\/edit\/collection\/projects\/(item|create)/.test(
    window.location.pathname,
  );
}

function isProjectsList(): boolean {
  return /\/edit\/collection\/projects\/?$/.test(
    window.location.pathname,
  );
}

function nodeMatchesLabel(node: Element, label: string): boolean {
  const text = node.textContent?.trim() ?? "";
  return text === label || text.startsWith(`${label} `);
}

function panelContainsOtherLocale(panel: Element, current: string): boolean {
  for (const tab of LOCALE_TABS) {
    if (tab.label === current) continue;
    for (const node of panel.querySelectorAll(
      "button, h2, h3, h4, label, legend",
    )) {
      if (nodeMatchesLabel(node, tab.label)) return true;
    }
  }
  return false;
}

function findLocalePanels(): Map<string, HTMLElement> {
  const panels = new Map<string, HTMLElement>();

  for (const tab of LOCALE_TABS) {
    const headings = [
      ...document.querySelectorAll(
        "button, h2, h3, h4, label, legend, span",
      ),
    ].filter((node) => nodeMatchesLabel(node, tab.label));

    for (const heading of headings) {
      let panel = heading.parentElement;
      while (panel && panel !== document.body) {
        const hasInputs = panel.querySelector(
          "input, textarea, [contenteditable='true']",
        );
        if (hasInputs && !panelContainsOtherLocale(panel, tab.label)) {
          panels.set(tab.id, panel);
          break;
        }
        panel = panel.parentElement;
      }
      if (panels.has(tab.id)) break;
    }
  }

  return panels;
}

function setupLocaleTabs(): (() => void) | null {
  if (!isLocaleTabForm()) return null;

  document
    .querySelectorAll<HTMLElement>("[data-locale-panel][hidden]")
    .forEach((panel) => {
      panel.hidden = false;
    });

  if (document.getElementById("portfolio-locale-tabs")) return () => {};

  const panels = findLocalePanels();
  if (panels.size !== LOCALE_TABS.length) return null;

  const anchor = panels.get("en");
  const parent = anchor?.parentElement;
  if (!anchor || !parent) return null;

  for (const tab of LOCALE_TABS) {
    const panel = panels.get(tab.id);
    if (!panel) continue;
    panel.dataset.localePanel = tab.id;
    panel.classList.add("portfolio-locale-panel");
    for (const heading of panel.querySelectorAll(
      "button, h2, h3, h4, label, legend",
    )) {
      if (nodeMatchesLabel(heading, tab.label)) {
        (heading as HTMLElement).style.display = "none";
      }
    }
  }

  const host = document.createElement("div");
  host.id = "portfolio-locale-tabs";
  host.className = "portfolio-locale-tabs portfolio-locale-tabs--bar";
  parent.insertBefore(host, anchor);

  const tabList = document.createElement("div");
  tabList.className = "portfolio-locale-tabs__list";
  tabList.setAttribute("role", "tablist");
  tabList.setAttribute("aria-label", "Project languages");

  const showPanel = (id: string) => {
    document.body.dataset.portfolioLocale = id;
    for (const tab of LOCALE_TABS) {
      const button = tabList.querySelector<HTMLButtonElement>(
        `[data-locale-tab="${tab.id}"]`,
      );
      if (button) {
        button.setAttribute("aria-selected", String(tab.id === id));
        button.tabIndex = tab.id === id ? 0 : -1;
      }
    }
  };

  for (const tab of LOCALE_TABS) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "portfolio-locale-tabs__tab";
    button.dataset.localeTab = tab.id;
    button.setAttribute("role", "tab");
    button.textContent = tab.label;
    button.addEventListener("click", () => showPanel(tab.id));
    tabList.appendChild(button);
  }

  host.appendChild(tabList);
  showPanel("en");

  return () => {
    document.body.removeAttribute("data-portfolio-locale");
    host.remove();
    for (const tab of LOCALE_TABS) {
      const panel = panels.get(tab.id);
      if (!panel) continue;
      panel.hidden = false;
      delete panel.dataset.localePanel;
      panel.classList.remove("portfolio-locale-panel");
      for (const heading of panel.querySelectorAll(
        "button, h2, h3, h4, label, legend",
      )) {
        if (nodeMatchesLabel(heading, tab.label)) {
          (heading as HTMLElement).style.display = "";
        }
      }
    }
  };
}

function withInterceptedFileInput(file: File, trigger: () => void): void {
  const originalCreate = document.createElement.bind(document);

  document.createElement = function createElement(
    tagName: string,
    options?: ElementCreationOptions,
  ) {
    const element = originalCreate(tagName, options);

    if (typeof tagName === "string" && tagName.toLowerCase() === "input") {
      document.createElement = originalCreate;

      const transfer = new DataTransfer();
      transfer.items.add(file);
      Object.defineProperty(element, "files", {
        value: transfer.files,
        configurable: true,
      });

      element.click = () => {
        element.dispatchEvent(new Event("change", { bubbles: true }));
      };
    }

    return element;
  } as typeof document.createElement;

  trigger();

  window.setTimeout(() => {
    document.createElement = originalCreate;
  }, 500);
}

function setupFileDropZones(): () => void {
  const onDragEnter = (event: DragEvent) => {
    if (!event.dataTransfer?.types.includes("Files")) return;
    const zone = (event.target as HTMLElement | null)?.closest(
      ".portfolio-dropzone",
    );
    if (!zone) return;
    event.preventDefault();
    zone.classList.add("portfolio-dropzone--active");
  };

  const onDragOver = (event: DragEvent) => {
    if (!event.dataTransfer?.types.includes("Files")) return;
    const zone = (event.target as HTMLElement | null)?.closest(
      ".portfolio-dropzone",
    );
    if (!zone) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    zone.classList.add("portfolio-dropzone--active");
  };

  const onDragLeave = (event: DragEvent) => {
    const zone = (event.target as HTMLElement | null)?.closest(
      ".portfolio-dropzone",
    );
    if (!zone) return;
    const related = event.relatedTarget as Node | null;
    if (related && zone.contains(related)) return;
    zone.classList.remove("portfolio-dropzone--active");
  };

  const onDrop = (event: DragEvent) => {
    document
      .querySelectorAll(".portfolio-dropzone--active")
      .forEach((node) => node.classList.remove("portfolio-dropzone--active"));

    const zone = (event.target as HTMLElement | null)?.closest(
      ".portfolio-dropzone",
    );
    const file = event.dataTransfer?.files?.[0];
    if (!zone || !file) return;

    event.preventDefault();

    const chooseButton = zone.querySelector<HTMLButtonElement>(
      ".portfolio-ks-actions button",
    );
    if (!chooseButton) return;

    withInterceptedFileInput(file, () => chooseButton.click());
  };

  const onClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement | null;
    const hint = target?.closest(".portfolio-dropzone__surface");
    if (!hint) return;

    const zone = hint.closest(".portfolio-dropzone");
    const chooseButton = zone?.querySelector<HTMLButtonElement>(
      ".portfolio-ks-actions button",
    );
    if (!chooseButton || target?.closest(".portfolio-media-slot__overlay")) {
      return;
    }

    event.preventDefault();
    chooseButton.click();
  };

  document.addEventListener("dragenter", onDragEnter);
  document.addEventListener("dragover", onDragOver);
  document.addEventListener("dragleave", onDragLeave);
  document.addEventListener("drop", onDrop);
  document.addEventListener("click", onClick);

  return () => {
    document.removeEventListener("dragenter", onDragEnter);
    document.removeEventListener("dragover", onDragOver);
    document.removeEventListener("dragleave", onDragLeave);
    document.removeEventListener("drop", onDrop);
    document.removeEventListener("click", onClick);
  };
}

function findGalleryList(): HTMLElement | null {
  const list = document.querySelector('[aria-label="Gallery"]');
  return list instanceof HTMLElement ? list : null;
}

let activeGalleryIndex: number | null = null;

function setupGalleryRowTracking(): () => void {
  const onClick = (event: MouseEvent) => {
    const row = (event.target as HTMLElement | null)?.closest(
      '[aria-label="Gallery"] [role="row"]',
    );
    if (!row) return;

    const index = getGalleryRows().indexOf(row);
    if (index >= 0) {
      activeGalleryIndex = index;
      findGalleryItemModal()?.removeAttribute("data-portfolio-enhance-key");
    }
  };

  document.addEventListener("click", onClick, true);
  return () => document.removeEventListener("click", onClick, true);
}

function findInputByLabel(
  root: ParentNode,
  labelText: string,
): HTMLInputElement | null {
  for (const label of root.querySelectorAll("label, span")) {
    if (label.textContent?.trim() !== labelText) continue;
    const group = label.closest('[role="group"]');
    if (!group || label.closest('[role="group"]') !== group) continue;
    const input = group.querySelector("input, textarea");
    if (input instanceof HTMLInputElement) return input;
  }
  return null;
}

function findButtonByText(
  root: ParentNode,
  text: string,
): HTMLButtonElement | null {
  for (const button of root.querySelectorAll("button")) {
    if (button.textContent?.trim() === text) {
      return button;
    }
  }
  return null;
}

function getDirectUploadFieldLabel(group: Element): string | null {
  for (const node of group.querySelectorAll("span, label")) {
    const text = node.textContent?.trim();
    if (!text || !UPLOAD_FIELD_LABELS.has(text)) continue;
    if (node.closest('[role="group"]') === group) {
      return text;
    }
  }
  return null;
}

function isUploadFieldGroup(group: Element): boolean {
  const label = getDirectUploadFieldLabel(group);
  if (!label) return false;
  if (!group.textContent?.includes("Choose file")) return false;

  // Match the inner upload field only, not the parent object section.
  if (label === "Cover image") {
    return !group.textContent?.includes("Alt text");
  }

  if (label === "Image file") {
    return !group.textContent?.includes("Display fit");
  }

  if (label === "Cover image (thumbnail)") {
    return !group.textContent?.includes("Video file");
  }

  return true;
}

function getPreviewFromGroup(group: Element): string | null {
  for (const image of group.querySelectorAll("img[src]")) {
    if (
      image instanceof HTMLImageElement &&
      !image.closest(".portfolio-media-slot")
    ) {
      return image.src;
    }
  }
  return null;
}

function fieldHasNativeMedia(group: Element): boolean {
  return Boolean(
    findButtonByText(group, "Remove") || getPreviewFromGroup(group),
  );
}

function findInnerUploadGroup(
  root: ParentNode,
  label: string,
): HTMLElement | null {
  const matches: HTMLElement[] = [];

  for (const group of root.querySelectorAll('[role="group"]')) {
    if (getDirectUploadFieldLabel(group) !== label) continue;
    if (!isUploadFieldGroup(group)) continue;
    matches.push(group as HTMLElement);
  }

  if (!matches.length) return null;

  return matches.sort(
    (left, right) => left.textContent!.length - right.textContent!.length,
  )[0];
}

function uploadFieldHasMedia(
  uploadGroup: HTMLElement,
  previewSrc: string | null,
): boolean {
  if (uploadGroup.dataset.clearedByUser === "true") return false;

  if (findButtonByText(uploadGroup, "Remove")) {
    delete uploadGroup.dataset.clearedByUser;
    return true;
  }

  if (getPreviewFromGroup(uploadGroup)) return true;
  if (previewSrc) return true;

  return false;
}

function triggerUploadRemove(uploadGroup: HTMLElement): void {
  const remove = findButtonByText(uploadGroup, "Remove");
  if (!remove) return;
  remove.click();
}

function markKeystaticFileUi(group: HTMLElement): void {
  const buttons = findButtonByText(group, "Choose file")?.parentElement;
  if (buttons) {
    buttons.classList.add("portfolio-ks-actions");
  }

  for (const image of group.querySelectorAll("img[src]")) {
    if (image.closest(".portfolio-media-slot")) continue;
    image.closest("div")?.classList.add("portfolio-ks-preview");
  }
}

function setUploadDescriptionsVisible(
  root: ParentNode,
  visible: boolean,
): void {
  for (const node of root.querySelectorAll<HTMLElement>("span, p")) {
    const text = node.textContent?.trim() ?? "";
    if (
      !UPLOAD_DESCRIPTION_SNIPPETS.some((snippet) => text.includes(snippet))
    ) {
      continue;
    }
    if (node.closest(".portfolio-media-slot")) continue;

    node.classList.add("portfolio-upload-description");
    if (node.hidden === !visible) continue;
    node.hidden = !visible;
  }
}

function setUploadFieldLabelVisible(
  uploadGroup: HTMLElement,
  visible: boolean,
): void {
  if (!isUploadFieldGroup(uploadGroup)) return;

  const fieldLabel = getDirectUploadFieldLabel(uploadGroup);
  if (!fieldLabel) return;

  const labelNode =
    uploadGroup.querySelector<HTMLElement>('[id$="-label"]') ??
    [...uploadGroup.querySelectorAll<HTMLElement>("span, label")].find(
      (node) =>
        node.textContent?.trim() === fieldLabel &&
        node.closest('[role="group"]') === uploadGroup,
    );

  if (!labelNode) return;

  labelNode.classList.add("portfolio-upload-field-label");
  if (labelNode.hidden === !visible) return;
  labelNode.hidden = !visible;
}

function normalizeMediaSlotStructure(slot: HTMLElement): void {
  const preview = slot.querySelector<HTMLElement>(".portfolio-media-slot__preview");
  const overlay = slot.querySelector<HTMLElement>(".portfolio-media-slot__overlay");
  if (preview && overlay && overlay.parentElement !== preview) {
    preview.appendChild(overlay);
  }
}

function findLabeledPanel(root: ParentNode, label: string): HTMLElement | null {
  for (const node of root.querySelectorAll<HTMLElement>(
    "button, h2, h3, h4, label, legend, span",
  )) {
    if (node.textContent?.trim() !== label) continue;
    const panel = node.closest('[role="group"]');
    if (panel instanceof HTMLElement) return panel;
  }
  return null;
}

function findUploadGroupIn(
  root: ParentNode,
  label: string,
): HTMLElement | null {
  return findInnerUploadGroup(root, label);
}

function insertBelowPanelHeading(
  panel: HTMLElement,
  element: HTMLElement,
): void {
  const heading = [...panel.querySelectorAll<HTMLElement>(
    "button, h2, h3, h4, label, legend",
  )].find((node) => node.closest('[role="group"]') === panel);

  if (heading?.parentElement) {
    heading.parentElement.insertBefore(element, heading.nextSibling);
    return;
  }

  panel.insertBefore(element, panel.firstChild);
}

function removeMediaSlot(mount: ParentNode): void {
  mount.querySelector(".portfolio-media-slot")?.remove();
}

function getMediaSlotEnhanceKey(
  src: string | null,
  kind: GalleryMediaPreview["kind"],
  placement: "start" | "below-heading",
): string {
  return `${placement}:${kind}:${src ?? ""}`;
}

function ensureMediaSlot(
  mount: HTMLElement,
  src: string | null,
  kind: GalleryMediaPreview["kind"],
  onRemove: () => void,
  placement: "start" | "below-heading" = "start",
): void {
  const enhanceKey = getMediaSlotEnhanceKey(src, kind, placement);
  let slot = mount.querySelector<HTMLElement>(".portfolio-media-slot");

  if (
    slot?.dataset.portfolioEnhanceKey === enhanceKey &&
    slot.querySelector(".portfolio-media-slot__overlay")
  ) {
    const overlay = slot.querySelector<HTMLButtonElement>(
      ".portfolio-media-slot__overlay",
    );
    if (overlay) {
      overlay.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        onRemove();
      };
    }
    return;
  }

  if (!slot) {
    slot = document.createElement("div");
    slot.className = "portfolio-media-slot";

    const preview = document.createElement("div");
    preview.className = "portfolio-media-slot__preview";
    slot.appendChild(preview);

    const overlay = document.createElement("button");
    overlay.type = "button";
    overlay.className = "portfolio-media-slot__overlay";
    overlay.setAttribute("aria-label", "Remove image");
    overlay.innerHTML =
      '<span class="portfolio-media-slot__remove-icon" aria-hidden="true">×</span>';
    preview.appendChild(overlay);

    if (placement === "below-heading") {
      insertBelowPanelHeading(mount, slot);
    } else {
      const anchor =
        mount.querySelector(".portfolio-dropzone__surface") ??
        mount.querySelector(".portfolio-ks-actions");
      if (anchor) {
        anchor.insertAdjacentElement("beforebegin", slot);
      } else {
        mount.insertBefore(slot, mount.firstChild);
      }
    }
  } else if (placement === "below-heading" && slot.parentElement !== mount) {
    insertBelowPanelHeading(mount, slot);
  }

  normalizeMediaSlotStructure(slot);

  const overlay = slot.querySelector<HTMLButtonElement>(
    ".portfolio-media-slot__overlay",
  );
  if (overlay) {
    overlay.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      onRemove();
    };
  }

  const preview = slot.querySelector<HTMLElement>(
    ".portfolio-media-slot__preview",
  );
  if (preview) {
    setPreviewImage(preview, src, kind);
  }

  slot.dataset.portfolioEnhanceKey = enhanceKey;
}

function createThumbnail(
  src: string | null,
  kind: GalleryMediaPreview["kind"],
  size: "small" | "large" = "small",
): HTMLElement {
  const thumb = document.createElement("span");
  thumb.className = `portfolio-media-thumb portfolio-media-thumb--${size}`;
  thumb.setAttribute("aria-hidden", "true");

  if (kind === "video") {
    thumb.classList.add("portfolio-media-thumb--video");
  }

  if (src) {
    const image = document.createElement("img");
    image.src = src;
    image.alt = "";
    image.loading = "lazy";
    image.decoding = "async";
    thumb.appendChild(image);
  } else {
    thumb.classList.add("portfolio-media-thumb--placeholder");
    thumb.textContent = kind === "video" ? "▶" : "◇";
  }

  return thumb;
}

function setPreviewImage(
  container: HTMLElement,
  src: string | null,
  kind: GalleryMediaPreview["kind"],
): void {
  let thumb = container.querySelector<HTMLElement>(".portfolio-media-thumb");
  if (!thumb) {
    thumb = createThumbnail(src, kind, "large");
    container.appendChild(thumb);
    return;
  }

  thumb.classList.toggle("portfolio-media-thumb--video", kind === "video");
  thumb.classList.remove("portfolio-media-thumb--placeholder");
  thumb.textContent = "";

  if (src) {
    let image = thumb.querySelector("img");
    if (!image) {
      image = document.createElement("img");
      image.alt = "";
      image.loading = "lazy";
      image.decoding = "async";
      thumb.appendChild(image);
    }
    if (image.src !== new URL(src, window.location.origin).href) {
      image.src = src;
    }
  } else {
    thumb.classList.add("portfolio-media-thumb--placeholder");
    thumb.textContent = kind === "video" ? "▶" : "◇";
    thumb.querySelector("img")?.remove();
  }
}

function getGalleryRows(): Element[] {
  const list = findGalleryList();
  if (!list) return [];

  return [...list.querySelectorAll('[role="row"]')].filter(
    (row) =>
      row.querySelector("button") &&
      row.getAttribute("aria-hidden") !== "true",
  );
}

function getGalleryLabelCell(row: Element): HTMLElement | null {
  const cells = [...row.querySelectorAll('[role="gridcell"]')];
  const contentCell =
    cells.find(
      (cell) =>
        cell.textContent?.trim() &&
        !cell.querySelector("[draggable='true']") &&
        !cell.querySelector("input[type='checkbox']"),
    ) ?? cells.at(-2);

  return (contentCell as HTMLElement | null) ?? null;
}

function decorateGalleryRow(row: Element, item: GalleryMediaPreview): void {
  const labelCell = getGalleryLabelCell(row);
  if (!labelCell) return;

  labelCell.classList.add("portfolio-gallery-row__content");

  let thumb = labelCell.querySelector<HTMLElement>(".portfolio-gallery-thumb");
  if (!thumb) {
    thumb = createThumbnail(item.thumb, item.kind, "small");
    thumb.classList.add("portfolio-gallery-thumb");
    labelCell.insertBefore(thumb, labelCell.firstChild);
  } else {
    setPreviewImage(thumb, item.thumb, item.kind);
  }

  let badge = labelCell.querySelector<HTMLElement>(".portfolio-gallery-row__type");
  if (!badge) {
    badge = document.createElement("span");
    badge.className = "portfolio-gallery-row__type";
    labelCell.appendChild(badge);
  }
  badge.textContent = item.kind === "video" ? "Video" : "Image";

  row.classList.add("portfolio-gallery-row");
}

function injectGalleryThumbnails(gallery: GalleryMediaPreview[]): void {
  const rows = getGalleryRows();
  if (!rows.length) return;

  const matched = new Set<Element>();

  for (const item of gallery) {
    const row = rows.find(
      (candidate) =>
        !matched.has(candidate) &&
        candidate.textContent?.includes(item.alt),
    );
    if (!row) continue;
    matched.add(row);
    decorateGalleryRow(row, item);
  }

  for (let index = 0; index < gallery.length && index < rows.length; index++) {
    const row = rows[index];
    if (matched.has(row)) continue;
    decorateGalleryRow(row, gallery[index]);
  }
}

function injectProjectListThumbnails(projects: ProjectMediaPreview[]): void {
  for (const project of projects) {
    const link = document.querySelector<HTMLAnchorElement>(
      `a[href*="/edit/collection/projects/item/${project.slug}"]`,
    );
    if (!link) continue;

    const row =
      link.closest('[role="row"], [role="option"]') ?? link.parentElement;
    if (!row) continue;

    row.classList.add("portfolio-project-row");

    const labelCell =
      row.querySelector('[role="gridcell"]') ??
      link.closest('[role="gridcell"]') ??
      row;

    let inner = labelCell.querySelector<HTMLElement>(
      ".portfolio-project-row__inner",
    );
    if (!inner) {
      inner = document.createElement("div");
      inner.className = "portfolio-project-row__inner";
      labelCell.insertBefore(inner, labelCell.firstChild);
    }

    let thumb = inner.querySelector<HTMLElement>(".portfolio-project-thumb");
    if (!thumb) {
      thumb = createThumbnail(project.cover, "image", "small");
      thumb.classList.add("portfolio-project-thumb");
      inner.insertBefore(thumb, inner.firstChild);
    } else {
      setPreviewImage(thumb, project.cover, "image");
    }

    let text = inner.querySelector<HTMLElement>(".portfolio-project-row__text");
    if (!text) {
      text = document.createElement("div");
      text.className = "portfolio-project-row__text";
      inner.appendChild(text);
    }
    text.textContent = project.title;
  }
}

function findGalleryItemModal(): HTMLElement | null {
  const dialog = [...document.querySelectorAll('[role="dialog"]')].find(
    (node) =>
      node.textContent?.includes("Edit item") ||
      node.textContent?.includes("Add item"),
  );
  return dialog instanceof HTMLElement ? dialog : null;
}

function findActiveGalleryItem(
  gallery: GalleryMediaPreview[],
): GalleryMediaPreview | null {
  if (activeGalleryIndex !== null && gallery[activeGalleryIndex]) {
    return gallery[activeGalleryIndex];
  }

  const modal = findGalleryItemModal();
  if (!modal) return null;

  const descriptionInput = findInputByLabel(modal, "Description");
  const alt = descriptionInput?.value?.trim();
  if (!alt) return null;

  return gallery.find((entry) => entry.alt === alt) ?? null;
}

function resolveUploadPreview(
  label: string,
  project: ProjectMediaPreview,
  activeGalleryItem: GalleryMediaPreview | null,
  group: Element,
): { src: string | null; kind: GalleryMediaPreview["kind"] } {
  let kind: GalleryMediaPreview["kind"] = "image";
  let src: string | null = null;

  if (label === "Cover image") {
    src = project.cover;
  } else if (label === "Image file") {
    if (activeGalleryItem) {
      src = activeGalleryItem.preview;
      kind = activeGalleryItem.kind;
    }
  } else if (label === "Video file") {
    kind = "video";
    if (activeGalleryItem?.kind === "video") {
      src = activeGalleryItem.preview;
    }
  } else if (label === "Cover image (thumbnail)") {
    kind = "video";
    if (activeGalleryItem?.kind === "video") {
      src = activeGalleryItem.preview;
    }
  }

  return { src: src ?? getPreviewFromGroup(group), kind };
}

function enhanceUploadField(
  slotMount: HTMLElement,
  uploadGroup: HTMLElement,
  label: string,
  previewSrc: string | null,
  kind: GalleryMediaPreview["kind"],
  inDialog: boolean,
  slotPlacement: "start" | "below-heading" = "start",
): void {
  const hasMedia = uploadFieldHasMedia(uploadGroup, previewSrc);

  markKeystaticFileUi(uploadGroup);
  uploadGroup.classList.add("portfolio-upload-field", "portfolio-dropzone");
  uploadGroup.classList.toggle("portfolio-upload-field--in-dialog", inDialog);
  slotMount.classList.toggle(
    "portfolio-upload-preview-host",
    slotMount !== uploadGroup,
  );
  slotMount.classList.toggle(
    "portfolio-upload-preview-host--filled",
    hasMedia,
  );

  const showEmptyState = () => {
    uploadGroup.classList.remove("portfolio-upload-field--filled");
    uploadGroup.classList.add("portfolio-upload-field--empty");
    slotMount.classList.remove("portfolio-upload-preview-host--filled");
    setUploadDescriptionsVisible(uploadGroup, true);
    setUploadFieldLabelVisible(uploadGroup, true);
    if (slotMount !== uploadGroup) {
      setUploadDescriptionsVisible(slotMount, true);
    }
    removeMediaSlot(slotMount);
    ensureDropzoneSurface(uploadGroup, label);
  };

  if (hasMedia) {
    uploadGroup.classList.add("portfolio-upload-field--filled");
    uploadGroup.classList.remove("portfolio-upload-field--empty");
    setUploadDescriptionsVisible(uploadGroup, false);
    setUploadFieldLabelVisible(uploadGroup, false);
    if (slotMount !== uploadGroup) {
      setUploadDescriptionsVisible(slotMount, false);
    }

    const src = getPreviewFromGroup(uploadGroup) ?? previewSrc;
    ensureMediaSlot(
      slotMount,
      src,
      kind,
      () => {
        uploadGroup.dataset.clearedByUser = "true";
        findGalleryItemModal()?.removeAttribute("data-portfolio-enhance-key");
        triggerUploadRemove(uploadGroup);
        showEmptyState();
        window.setTimeout(() => {
          enhanceUploadField(
            slotMount,
            uploadGroup,
            label,
            null,
            kind,
            inDialog,
            slotPlacement,
          );
        }, 80);
      },
      slotPlacement,
    );
  } else {
    showEmptyState();
  }
}

function getGalleryModalEnhanceKey(
  modal: HTMLElement,
  activeItem: GalleryMediaPreview | null,
  label: string,
): string {
  if (!activeItem) {
    const visibleLabels = [...modal.querySelectorAll('[role="group"]')]
      .filter((group) => isUploadFieldGroup(group))
      .map((group) => getDirectUploadFieldLabel(group))
      .filter(Boolean)
      .join("|");
    return `new:${visibleLabels || label}`;
  }
  return `${label}:${activeItem.kind}:${activeItem.alt}:${activeItem.preview ?? ""}`;
}

function enhanceGalleryEditModal(project: ProjectMediaPreview): void {
  const modal = findGalleryItemModal();
  if (!modal || modal.dataset.portfolioEnhancing === "true") return;

  const activeItem = findActiveGalleryItem(project.gallery);
  const enhanceKey = getGalleryModalEnhanceKey(
    modal,
    activeItem,
    activeItem?.kind === "video" ? "video" : "image",
  );

  if (modal.dataset.portfolioEnhanceKey === enhanceKey) return;

  modal.dataset.portfolioEnhancing = "true";

  try {
    if (activeItem?.kind === "image") {
      const settingsPanel = findLabeledPanel(modal, "Image settings");
      const uploadGroup = findUploadGroupIn(modal, "Image file");
      if (settingsPanel && uploadGroup) {
        enhanceUploadField(
          settingsPanel,
          uploadGroup,
          "Image file",
          activeItem.preview,
          "image",
          true,
          "below-heading",
        );
      }
      modal.dataset.portfolioEnhanceKey = enhanceKey;
      return;
    }

    if (activeItem?.kind === "video") {
      const settingsPanel = findLabeledPanel(modal, "Video settings");
      const posterGroup = findUploadGroupIn(modal, "Cover image (thumbnail)");
      if (settingsPanel && posterGroup) {
        enhanceUploadField(
          settingsPanel,
          posterGroup,
          "Cover image (thumbnail)",
          activeItem.preview,
          "video",
          true,
          "below-heading",
        );
      }

      const videoGroup = findUploadGroupIn(modal, "Video file");
      if (videoGroup) {
        if (fieldHasNativeMedia(videoGroup)) {
          markKeystaticFileUi(videoGroup);
          videoGroup.classList.add(
            "portfolio-upload-field",
            "portfolio-dropzone",
            "portfolio-upload-field--filled",
            "portfolio-upload-field--in-dialog",
          );
          setUploadDescriptionsVisible(videoGroup, false);
          setUploadFieldLabelVisible(videoGroup, false);
          removeMediaSlot(videoGroup);
        } else {
          enhanceUploadField(
            videoGroup,
            videoGroup,
            "Video file",
            null,
            "video",
            true,
          );
        }
      }
      modal.dataset.portfolioEnhanceKey = enhanceKey;
      return;
    }

    for (const group of modal.querySelectorAll('[role="group"]')) {
      if (!isUploadFieldGroup(group)) continue;
      const uploadLabel = getDirectUploadFieldLabel(group);
      if (!uploadLabel) continue;

      const { src: previewSrc, kind } = resolveUploadPreview(
        uploadLabel,
        project,
        activeItem,
        group,
      );

      enhanceUploadField(
        group as HTMLElement,
        group as HTMLElement,
        uploadLabel,
        previewSrc,
        kind,
        true,
      );
    }

    modal.dataset.portfolioEnhanceKey = enhanceKey;
  } finally {
    delete modal.dataset.portfolioEnhancing;
  }
}

function enhanceUploadFields(
  project: ProjectMediaPreview,
): void {
  const coverGroup = findInnerUploadGroup(document, "Cover image");
  if (coverGroup) {
    const { src: previewSrc, kind } = resolveUploadPreview(
      "Cover image",
      project,
      null,
      coverGroup,
    );
    enhanceUploadField(
      coverGroup,
      coverGroup,
      "Cover image",
      previewSrc,
      kind,
      false,
    );
  }

  for (const group of document.querySelectorAll('[role="group"]')) {
    if (group === coverGroup) continue;
    if (group.closest('[role="dialog"]')) continue;
    if (!isUploadFieldGroup(group)) continue;

    const label = getDirectUploadFieldLabel(group);
    if (!label || label === "Cover image") continue;

    const { src: previewSrc, kind } = resolveUploadPreview(
      label,
      project,
      null,
      group,
    );

    enhanceUploadField(
      group as HTMLElement,
      group as HTMLElement,
      label,
      previewSrc,
      kind,
      false,
    );
  }
}

function ensureDropzoneSurface(group: HTMLElement, label: string): void {
  if (group.querySelector(".portfolio-dropzone__surface")) return;

  const surface = document.createElement("div");
  surface.className = "portfolio-dropzone__surface";
  surface.innerHTML = `
    <span class="portfolio-dropzone__icon" aria-hidden="true">↑</span>
    <span class="portfolio-dropzone__title">${label}</span>
    <span class="portfolio-dropzone__hint">Drag & drop a file here, or click to browse</span>
  `;

  const actions = group.querySelector(".portfolio-ks-actions");
  const anchor = actions ?? group.querySelector("button")?.parentElement;
  anchor?.insertAdjacentElement("beforebegin", surface);
}

function wrapFormSections(): void {
  const galleryList = findGalleryList();
  galleryList
    ?.closest("div")
    ?.classList.add("portfolio-section", "portfolio-section--gallery");

  for (const group of document.querySelectorAll('[role="group"]')) {
    if (getDirectUploadFieldLabel(group) !== "Cover image") continue;
    const coverGroup = findInnerUploadGroup(document, "Cover image") ?? group;
    const section =
      coverGroup.parentElement?.closest<HTMLElement>('[role="group"]') ??
      coverGroup.closest("div");
    section?.classList.add("portfolio-section", "portfolio-section--cover");
    break;
  }
}

function formHasUnenhancedUploadFields(): boolean {
  return [...document.querySelectorAll('[role="group"]')].some(
    (group) =>
      isUploadFieldGroup(group) &&
      !group.classList.contains("portfolio-upload-field"),
  );
}

function applyProjectMedia(project: ProjectMediaPreview): void {
  const modalOpen = Boolean(findGalleryItemModal());
  const userIsTyping = document.activeElement?.matches(
    "input, textarea, [contenteditable='true']",
  );

  if (!userIsTyping || modalOpen) {
    injectGalleryThumbnails(project.gallery);
    wrapFormSections();
  }

  if (!modalOpen && !userIsTyping) {
    enhanceUploadFields(project);
  }

  if (modalOpen) {
    const modal = findGalleryItemModal();
    if (modal?.dataset.portfolioEnhancing !== "true") {
      enhanceGalleryEditModal(project);
    }
  }
}

function scheduleModalRefresh(project: ProjectMediaPreview): void {
  for (const delay of [0, 120, 300, 600, 1000]) {
    window.setTimeout(() => {
      if (findGalleryItemModal()) {
        enhanceGalleryEditModal(project);
      }
    }, delay);
  }
}

function setupMediaThumbnails(): (() => void) | null {
  if (!isProjectEditForm()) return null;

  const slug = getProjectSlugFromPath();
  let cancelled = false;
  let lastData: ProjectMediaPreview = { ...EMPTY_PROJECT_MEDIA };
  let dialogOpen = false;
  let enhanceTimer: number | null = null;

  const apply = (data: ProjectMediaPreview) => {
    lastData = data;
    applyProjectMedia(data);
  };

  const scheduleFormEnhance = () => {
    if (enhanceTimer) window.clearTimeout(enhanceTimer);
    enhanceTimer = window.setTimeout(() => {
      if (!cancelled) applyProjectMedia(lastData);
    }, 120);
  };

  const refresh = async () => {
    if (cancelled) return;

    if (!slug) {
      apply({ ...EMPTY_PROJECT_MEDIA, slug: "" });
      return;
    }

    try {
      const response = await fetch(`/api/admin/project-media/${slug}`);
      if (!response.ok || cancelled) return;

      apply((await response.json()) as ProjectMediaPreview);
    } catch {
      // Keystatic may render before the API route is ready.
    }
  };

  const observer = new MutationObserver(() => {
    if (cancelled) return;

    const modal = findGalleryItemModal();
    const modalOpen = Boolean(modal);

    if (modalOpen && !dialogOpen) {
      dialogOpen = true;
      modal?.removeAttribute("data-portfolio-enhance-key");
      scheduleModalRefresh(lastData);
      return;
    }

    if (!modalOpen && dialogOpen) {
      dialogOpen = false;
      activeGalleryIndex = null;
      findGalleryItemModal()?.removeAttribute("data-portfolio-enhance-key");
      window.setTimeout(() => applyProjectMedia(lastData), 80);
      return;
    }

    if (modalOpen) {
      const needsModalEnhance = [...modal!.querySelectorAll('[role="group"]')].some(
        (group) =>
          isUploadFieldGroup(group) &&
          !group.classList.contains("portfolio-upload-field"),
      );
      if (needsModalEnhance) {
        modal?.removeAttribute("data-portfolio-enhance-key");
        scheduleModalRefresh(lastData);
      }
      return;
    }

    if (formHasUnenhancedUploadFields()) {
      scheduleFormEnhance();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  void refresh();
  const interval = window.setInterval(() => {
    void refresh();
  }, slug ? 3000 : 1500);

  return () => {
    cancelled = true;
    if (enhanceTimer) window.clearTimeout(enhanceTimer);
    clearInterval(interval);
    observer.disconnect();
  };
}

function setupProjectListThumbnails(): (() => void) | null {
  if (!isProjectsList()) return null;

  let cancelled = false;

  const refresh = async () => {
    if (cancelled) return;

    try {
      const response = await fetch("/api/admin/project-media");
      if (!response.ok || cancelled) return;

      const data = (await response.json()) as ProjectMediaPreview[];
      injectProjectListThumbnails(data);
    } catch {
      // Ignore transient fetch errors while the admin UI loads.
    }
  };

  void refresh();
  const interval = window.setInterval(() => {
    void refresh();
  }, 3000);

  return () => {
    cancelled = true;
    clearInterval(interval);
  };
}

function setupAdminLabels(): () => void {
  const replaceDashboardLabels = () => {
    const title = document.querySelector<HTMLElement>(
      "body.portfolio-admin h1#page-title",
    );
    if (title?.textContent?.trim() === "Dashboard") {
      title.textContent = "Home";
    }

    for (const node of document.querySelectorAll(
      "body.portfolio-admin nav a, body.portfolio-admin a[href*='/edit']",
    )) {
      if (node.textContent?.trim() !== "Dashboard") continue;
      if (node.closest("header")) continue;
      node.textContent = "Home";
    }

    for (const node of document.querySelectorAll(
      "body.portfolio-admin button",
    )) {
      if (node.textContent?.trim() === "Dashboard") {
        node.textContent = "Home";
      }
    }

    for (const node of document.querySelectorAll("body.portfolio-admin *")) {
      const text = node.textContent?.trim();
      if (!text) continue;
      if (node.children.length > 0) continue;

      if (text === "Collections" || text === "Collection") {
        node.textContent = text === "Collection" ? "Page" : "Pages";
        continue;
      }

      if (/\d+ entries$/.test(text)) {
        node.textContent = text.replace(/ entries$/, " projects");
        continue;
      }

      if (/\d+ entry$/.test(text)) {
        node.textContent = text.replace(/ entry$/, " project");
      }
    }
  };

  replaceDashboardLabels();
  const observer = new MutationObserver(replaceDashboardLabels);
  observer.observe(document.body, { childList: true, subtree: true });

  return () => observer.disconnect();
}

export function KeystaticEnhancements() {
  useEffect(() => {
    document.body.classList.add("portfolio-admin");

    let cleanupTabs: (() => void) | null = null;
    let cleanupMedia: (() => void) | null = null;
    let mounted = false;
    let lastPath = window.location.pathname;
    const cleanupDrop = setupFileDropZones();
    const cleanupGalleryTracking = setupGalleryRowTracking();
    const cleanupLabels = setupAdminLabels();

    const tryMountEnhancements = () => {
      if (!cleanupMedia) {
        cleanupMedia =
          setupMediaThumbnails() ?? setupProjectListThumbnails();
      }

      if (mounted && !(isLocaleTabForm() && !document.getElementById("portfolio-locale-tabs"))) {
        return;
      }
      const cleanup = setupLocaleTabs();
      if (cleanup) {
        cleanupTabs = cleanup;
        if (document.getElementById("portfolio-locale-tabs")) {
          mounted = true;
        }
      }
    };

    tryMountEnhancements();
    const interval = window.setInterval(tryMountEnhancements, 400);
    const timeout = window.setTimeout(() => clearInterval(interval), 15000);

    const onNavigate = () => {
      if (window.location.pathname === lastPath) return;
      lastPath = window.location.pathname;

      mounted = false;
      cleanupTabs?.();
      cleanupTabs = null;
      cleanupMedia?.();
      cleanupMedia = null;
      document.body.removeAttribute("data-portfolio-locale");
      document.getElementById("portfolio-locale-tabs")?.remove();
      document
        .querySelectorAll<HTMLElement>("[data-locale-panel][hidden]")
        .forEach((panel) => {
          panel.hidden = false;
        });
      window.setTimeout(tryMountEnhancements, 250);
    };

    const onKeystaticNavigate = () => {
      window.setTimeout(onNavigate, 0);
    };

    window.addEventListener("popstate", onNavigate);
    window.addEventListener("hashchange", onKeystaticNavigate);
    const navInterval = window.setInterval(() => {
      if (window.location.pathname !== lastPath) {
        onNavigate();
      }
    }, 500);

    return () => {
      document.body.classList.remove("portfolio-admin");
      clearInterval(interval);
      clearTimeout(timeout);
      clearInterval(navInterval);
      window.removeEventListener("popstate", onNavigate);
      window.removeEventListener("hashchange", onKeystaticNavigate);
      cleanupTabs?.();
      cleanupMedia?.();
      cleanupDrop();
      cleanupGalleryTracking();
      cleanupLabels();
    };
  }, []);

  return null;
}
