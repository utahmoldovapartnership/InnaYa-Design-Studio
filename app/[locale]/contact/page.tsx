import { getTranslations } from "next-intl/server";
import { FaEnvelope, FaInstagram, FaPhone, FaTiktok } from "react-icons/fa6";
import { ContactForm } from "@/components/contact/ContactForm";
import { buildLocaleAlternates } from "@/lib/seo";
import { getContactInfo } from "@/lib/site-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return {
    title: t("title"),
    description: t("intro"),
    alternates: buildLocaleAlternates(locale, "/contact"),
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;
  const t = await getTranslations("contact");
  const contact = await getContactInfo();

  return (
    <section className="flex min-h-[calc(100dvh-var(--header-height))] items-center px-5 py-10 md:px-8 md:py-0">
      <h1 className="sr-only">{t("title")}</h1>
      <div className="mx-auto w-full max-w-[1200px] -translate-y-[calc(var(--header-height)/4)] transform">
        <div className="grid w-full gap-14 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
          <div className="order-2 md:order-1 md:self-center">
            <div className="mx-auto w-fit -translate-y-4 space-y-6 pl-4 text-left text-sm text-muted md:mx-0 md:w-auto md:-translate-y-10 md:pl-8">
              <a
                href={contact.emailHref}
                className="flex items-start gap-3 transition-colors duration-200 hover:text-ink"
              >
                <FaEnvelope className="mt-0.5 h-4 w-4 shrink-0 text-ink" />
                <span>
                  <span className="block text-xs uppercase tracking-wider text-muted-2">
                    {t("emailLabel")}
                  </span>
                  {contact.email}
                </span>
              </a>
              <div className="flex items-start gap-3">
                <FaPhone className="mt-0.5 h-4 w-4 shrink-0 text-ink" />
                <div>
                  <span className="block text-xs uppercase tracking-wider text-muted-2">
                    {t("labelMd")}
                  </span>
                  <a
                    href={contact.moldovaPhoneHref}
                    className="transition-colors duration-200 hover:text-ink"
                  >
                    {contact.moldovaPhone}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaPhone className="mt-0.5 h-4 w-4 shrink-0 text-ink" />
                <div>
                  <span className="block text-xs uppercase tracking-wider text-muted-2">
                    {t("labelUa")}
                  </span>
                  <a
                    href={contact.ukrainePhoneHref}
                    className="transition-colors duration-200 hover:text-ink"
                  >
                    {contact.ukrainePhone}
                  </a>
                  <p className="mt-1 text-xs text-muted-2">{t("phoneNote")}</p>
                </div>
              </div>
              <a
                href={contact.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 transition-colors duration-200 hover:text-ink"
              >
                <FaInstagram className="mt-0.5 h-5 w-5 shrink-0 text-ink" />
                <span>
                  <span className="block text-xs uppercase tracking-wider text-muted-2">
                    {t("instagramLabel")}
                  </span>
                  {contact.instagram}
                </span>
              </a>
              <a
                href={contact.tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 transition-colors duration-200 hover:text-ink"
              >
                <FaTiktok className="mt-0.5 h-5 w-5 shrink-0 text-ink" />
                <span>
                  <span className="block text-xs uppercase tracking-wider text-muted-2">
                    {t("tiktokLabel")}
                  </span>
                  {contact.tiktok}
                </span>
              </a>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <ContactForm studioEmail={contact.email} />
          </div>
        </div>
      </div>
    </section>
  );
}
