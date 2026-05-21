import { getTranslations } from "next-intl/server";
import { FaEnvelope, FaPhone } from "react-icons/fa6";
import { ContactForm } from "@/components/contact/ContactForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  const meta = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("title"),
    description: meta("description"),
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;
  const t = await getTranslations("contact");

  return (
    <div className="mx-auto grid max-w-page gap-14 px-5 py-16 md:grid-cols-2 md:gap-16 md:px-8 md:py-24">
      <div>
        <h1 className="font-serif text-4xl text-ink md:text-5xl">{t("title")}</h1>
        <p className="mt-6 leading-relaxed text-muted">{t("intro")}</p>

        <div className="mt-10 space-y-6 text-sm text-muted">
          <a
            href={`mailto:${t("emailValue")}`}
            className="flex items-start gap-3 hover:text-ink"
          >
            <FaEnvelope className="mt-0.5 h-4 w-4 shrink-0 text-ink" />
            <span>
              <span className="block text-xs uppercase tracking-wider text-muted-2">
                {t("emailLabel")}
              </span>
              {t("emailValue")}
            </span>
          </a>
          <div className="flex items-start gap-3">
            <FaPhone className="mt-0.5 h-4 w-4 shrink-0 text-ink" />
            <div>
              <span className="block text-xs uppercase tracking-wider text-muted-2">
                {t("labelMd")}
              </span>
              <a href="tel:+37360285316" className="hover:text-ink">
                {t("phoneMd")}
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FaPhone className="mt-0.5 h-4 w-4 shrink-0 text-ink" />
            <div>
              <span className="block text-xs uppercase tracking-wider text-muted-2">
                {t("labelUa")}
              </span>
              <a href="tel:+380661855688" className="hover:text-ink">
                {t("phoneUa")}
              </a>
              <p className="mt-1 text-xs text-muted-2">{t("phoneNote")}</p>
            </div>
          </div>
        </div>
      </div>
      <ContactForm />
    </div>
  );
}
