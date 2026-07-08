"use client";

import {
  clearCurrentKeystaticDraft,
  stripSavedQueryParam,
} from "@/lib/clear-keystatic-draft";
const OVERLAY_ID = "portfolio-deploy-wait";
const POLL_INTERVAL_MS = 4000;
const MAX_WAIT_MS = 10 * 60 * 1000;
const FALLBACK_READY_MS = 90 * 1000;

let active = false;
let pollTimer: number | null = null;
let fallbackTimer: number | null = null;
let startedAt = 0;

function ensureOverlay(): HTMLElement {
  let overlay = document.getElementById(OVERLAY_ID);
  if (overlay) return overlay;

  overlay = document.createElement("div");
  overlay.id = OVERLAY_ID;
  overlay.className = "portfolio-deploy-wait";
  overlay.innerHTML = `
    <div class="portfolio-deploy-wait__panel" role="status" aria-live="polite">
      <div class="portfolio-deploy-wait__spinner" aria-hidden="true"></div>
      <p class="portfolio-deploy-wait__title">Збереження змін…</p>
      <p class="portfolio-deploy-wait__message">
        Сайт оновлюється на Vercel. Зачекайте, будь ласка — не редагуйте сторінку, поки деплой не завершиться.
      </p>
      <p class="portfolio-deploy-wait__note">Зазвичай це займає близько 1 хвилини.</p>
      <button type="button" class="portfolio-deploy-wait__dismiss" hidden>
        Закрити
      </button>
    </div>
  `;

  overlay.querySelector<HTMLButtonElement>(".portfolio-deploy-wait__dismiss")?.addEventListener(
    "click",
    () => {
      hideDeployWaitOverlay();
    },
  );

  document.body.appendChild(overlay);
  return overlay;
}

function setOverlayMessage(
  title: string,
  message: string,
  showDismiss = false,
  showNote = false,
): void {
  const overlay = ensureOverlay();
  const titleNode = overlay.querySelector<HTMLElement>(".portfolio-deploy-wait__title");
  const messageNode = overlay.querySelector<HTMLElement>(".portfolio-deploy-wait__message");
  const noteNode = overlay.querySelector<HTMLElement>(".portfolio-deploy-wait__note");
  const dismiss = overlay.querySelector<HTMLButtonElement>(".portfolio-deploy-wait__dismiss");
  const spinner = overlay.querySelector<HTMLElement>(".portfolio-deploy-wait__spinner");

  if (titleNode) titleNode.textContent = title;
  if (messageNode) messageNode.textContent = message;
  if (noteNode) noteNode.hidden = !showNote;
  if (dismiss) dismiss.hidden = !showDismiss;
  if (spinner) spinner.hidden = showDismiss;
}

function clearTimers(): void {
  if (pollTimer) {
    window.clearInterval(pollTimer);
    pollTimer = null;
  }
  if (fallbackTimer) {
    window.clearTimeout(fallbackTimer);
    fallbackTimer = null;
  }
}

export function isDeployWaitActive(): boolean {
  return active;
}

export function showDeployWaitOverlay(phase: "saving" | "deploying" = "saving"): void {
  active = true;
  document.body.dataset.deployWait = "true";
  ensureOverlay().hidden = false;

  if (phase === "saving") {
    setOverlayMessage(
      "Збереження змін…",
      "Зачекайте, поки зміни буде надіслано до GitHub.",
      false,
      true,
    );
    return;
  }

  setOverlayMessage(
    "Сайт оновлюється…",
    "Vercel збирає нову версію сайту. Будь ласка, не редагуйте сторінку, поки деплой не завершиться.",
    false,
    true,
  );
}

export function hideDeployWaitOverlay(): void {
  active = false;
  delete document.body.dataset.deployWait;
  clearTimers();
  document.getElementById(OVERLAY_ID)?.remove();
}

async function pollDeployStatus(commitSha: string): Promise<"ready" | "error" | "building"> {
  try {
    const response = await fetch(
      `/api/admin/deploy-status?sha=${encodeURIComponent(commitSha)}`,
      { cache: "no-store" },
    );
    if (!response.ok) return "building";
    const payload = (await response.json()) as { state?: string };
    if (payload.state === "ready") return "ready";
    if (payload.state === "error") return "error";
    return "building";
  } catch {
    return "building";
  }
}

function finishWithReload(): void {
  setOverlayMessage(
    "Готово!",
    "Деплой завершено. Оновлюємо сторінку редагування…",
  );
  void clearCurrentKeystaticDraft().finally(() => {
    window.setTimeout(() => {
      const url = new URL(window.location.href);
      url.searchParams.set("saved", String(Date.now()));
      window.location.replace(url.toString());
    }, 800);
  });
}

export function startDeployWaitForCommit(commitSha: string): void {
  if (!commitSha) return;

  startedAt = Date.now();
  showDeployWaitOverlay("deploying");
  clearTimers();

  const check = async () => {
    if (!active) return;

    if (Date.now() - startedAt > MAX_WAIT_MS) {
      setOverlayMessage(
        "Деплой триває довго",
        "Можна закрити це вікно та оновити сторінку вручну, коли Vercel завершить збірку.",
        true,
      );
      clearTimers();
      return;
    }

    const state = await pollDeployStatus(commitSha);
    if (state === "ready") {
      clearTimers();
      finishWithReload();
      return;
    }

    if (state === "error") {
      clearTimers();
      setOverlayMessage(
        "Помилка деплою",
        "Збереження пройшло, але Vercel повідомив про помилку. Перевірте логи деплою на Vercel.",
        true,
      );
    }
  };

  void check();
  pollTimer = window.setInterval(() => {
    void check();
  }, POLL_INTERVAL_MS);

  fallbackTimer = window.setTimeout(() => {
    if (!active) return;
    finishWithReload();
  }, FALLBACK_READY_MS);
}

type GraphQLCommitResponse = {
  data?: {
    createCommitOnBranch?: {
      ref?: {
        target?: {
          oid?: string;
        };
      };
    };
  };
};

export function extractCommitShaFromGraphQLResponse(
  payload: unknown,
): string | null {
  if (!payload || typeof payload !== "object") return null;
  const data = payload as GraphQLCommitResponse;
  return data.data?.createCommitOnBranch?.ref?.target?.oid ?? null;
}

export async function onKeystaticSaveCommitted(commitSha: string | null): Promise<void> {
  await clearCurrentKeystaticDraft();
  if (commitSha) {
    startDeployWaitForCommit(commitSha);
    return;
  }
  hideDeployWaitOverlay();
}
