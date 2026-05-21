"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

export function ContactForm() {
  const t = useTranslations("contact.form");
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const website = fd.get("website");
    if (website && String(website).trim() !== "") {
      setStatus("ok");
      return;
    }

    const payload = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      projectType: String(fd.get("projectType") ?? ""),
      message: String(fd.get("message") ?? ""),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setStatus("err");
        setErrorMessage(
          res.status === 503 ? t("notConfigured") : data.error ?? t("error"),
        );
        return;
      }
      setStatus("ok");
      form.reset();
    } catch {
      setStatus("err");
      setErrorMessage(t("error"));
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-5 border border-accent/60 bg-accent/10 p-6 md:p-8"
    >
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="absolute -left-[9999px] h-px w-px opacity-0"
        aria-hidden
      />

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted">{t("name")}</span>
        <input
          name="name"
          required
          className="border border-accent/80 bg-background px-3 py-2 text-ink outline-none ring-0 focus:border-ink"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted">{t("email")}</span>
        <input
          name="email"
          type="email"
          required
          className="border border-accent/80 bg-background px-3 py-2 text-ink outline-none focus:border-ink"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted">{t("phone")}</span>
        <input
          name="phone"
          type="tel"
          required
          className="border border-accent/80 bg-background px-3 py-2 text-ink outline-none focus:border-ink"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted">{t("projectType")}</span>
        <select
          name="projectType"
          className="border border-accent/80 bg-background px-3 py-2 text-ink outline-none focus:border-ink"
          defaultValue="residential"
        >
          <option value="residential">{t("projectResidential")}</option>
          <option value="commercial">{t("projectCommercial")}</option>
          <option value="other">{t("projectOther")}</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted">{t("message")}</span>
        <textarea
          name="message"
          rows={4}
          className="resize-y border border-accent/80 bg-background px-3 py-2 text-ink outline-none focus:border-ink"
        />
      </label>

      {status === "ok" ? (
        <p className="text-sm text-muted">{t("success")}</p>
      ) : null}
      {status === "err" && errorMessage ? (
        <p className="text-sm text-red-800">{errorMessage}</p>
      ) : null}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-2 inline-flex self-start items-center justify-center rounded-full bg-ink px-5 py-2 text-sm font-medium tracking-wide text-background transition-colors hover:bg-ink/90 disabled:opacity-50"
      >
        {status === "sending" ? t("sending") : t("submit")}
      </button>
    </form>
  );
}
