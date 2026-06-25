"use client";

import { Button } from "@/components/ui/Button";
import { useTranslations } from "next-intl";
import { useState } from "react";

type ContactFormProps = {
  studioEmail: string;
};

function buildInquiryMailto(
  studioEmail: string,
  fields: {
    name: string;
    email: string;
    phone: string;
    projectTypeLabel: string;
    message: string;
  },
) {
  const subject = `InnaYa inquiry — ${fields.name}`;
  const body = [
    `Name: ${fields.name}`,
    `Email: ${fields.email}`,
    `Phone: ${fields.phone}`,
    `Project type: ${fields.projectTypeLabel}`,
    "",
    fields.message || "—",
  ].join("\n");

  const params = new URLSearchParams({
    subject,
    body,
  });

  return `mailto:${studioEmail}?${params.toString()}`;
}

export function ContactForm({ studioEmail }: ContactFormProps) {
  const t = useTranslations("contact.form");
  const [status, setStatus] = useState<"idle" | "opening" | "ok">("idle");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("opening");
    const form = e.currentTarget;
    const fd = new FormData(form);
    const website = fd.get("website");
    if (website && String(website).trim() !== "") {
      setStatus("ok");
      return;
    }

    const projectType = String(fd.get("projectType") ?? "residential");
    const projectTypeLabel =
      projectType === "commercial"
        ? t("projectCommercial")
        : projectType === "other"
          ? t("projectOther")
          : t("projectResidential");

    const mailto = buildInquiryMailto(studioEmail, {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      projectTypeLabel,
      message: String(fd.get("message") ?? ""),
    });

    window.location.href = mailto;
    setStatus("ok");
    form.reset();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-5 rounded-sm border border-accent/60 bg-accent/10 p-6 md:p-8"
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
          placeholder={t("namePlaceholder")}
          className="rounded-sm border border-accent/80 bg-background px-3 py-2 text-ink outline-none ring-0 placeholder:text-muted-2 focus:border-ink"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted">{t("email")}</span>
        <input
          name="email"
          type="email"
          required
          placeholder={t("emailPlaceholder")}
          className="rounded-sm border border-accent/80 bg-background px-3 py-2 text-ink outline-none placeholder:text-muted-2 focus:border-ink"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted">{t("phone")}</span>
        <input
          name="phone"
          type="tel"
          required
          placeholder={t("phonePlaceholder")}
          className="rounded-sm border border-accent/80 bg-background px-3 py-2 text-ink outline-none placeholder:text-muted-2 focus:border-ink"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted">{t("projectType")}</span>
        <select
          name="projectType"
          className="rounded-sm border border-accent/80 bg-background px-3 py-2 text-ink outline-none focus:border-ink"
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
          placeholder={t("messagePlaceholder")}
          className="resize-y rounded-sm border border-accent/80 bg-background px-3 py-2 text-ink outline-none placeholder:text-muted-2 focus:border-ink"
        />
      </label>

      {status === "ok" ? (
        <p className="text-sm text-muted">{t("success")}</p>
      ) : null}

      <Button
        type="submit"
        disabled={status === "opening"}
        className="mt-2 self-start"
      >
        {status === "opening" ? t("opening") : t("submit")}
      </Button>
    </form>
  );
}
