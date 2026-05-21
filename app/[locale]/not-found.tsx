import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/Button";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-5 py-24 text-center">
      <h1 className="font-serif text-3xl text-ink md:text-4xl">{t("title")}</h1>
      <p className="mt-4 text-muted leading-relaxed">{t("body")}</p>
      <ButtonLink href="/" variant="outline" className="mt-10">
        {t("cta")}
      </ButtonLink>
    </div>
  );
}
