import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-5 py-24 text-center">
      <h1 className="font-serif text-3xl text-ink md:text-4xl">{t("title")}</h1>
      <p className="mt-4 text-muted leading-relaxed">{t("body")}</p>
      <Link
        href="/"
        className="mt-10 inline-block border border-ink px-6 py-3 text-sm tracking-wide text-ink transition-colors hover:bg-ink hover:text-background"
      >
        {t("cta")}
      </Link>
    </div>
  );
}
