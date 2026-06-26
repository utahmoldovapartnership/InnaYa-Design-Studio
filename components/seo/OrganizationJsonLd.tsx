import { getTranslations } from "next-intl/server";
import { getContactInfo } from "@/lib/site-content";
import { getSiteUrl } from "@/lib/site-url";

type Props = {
  locale: string;
};

export async function OrganizationJsonLd({ locale }: Props) {
  const contact = await getContactInfo();
  const t = await getTranslations({ locale, namespace: "meta" });
  const siteUrl = getSiteUrl();

  const data = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: t("siteName"),
    url: `${siteUrl}/${locale}`,
    logo: `${siteUrl}/images/innaya-logo.png`,
    image: `${siteUrl}/images/innaya-logo.png`,
    description: t("description"),
    email: contact.email,
    telephone: [contact.moldovaPhone, contact.ukrainePhone],
    sameAs: [contact.instagramUrl, contact.tiktokUrl],
    areaServed: ["Ukraine", "Moldova", "Europe"],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
