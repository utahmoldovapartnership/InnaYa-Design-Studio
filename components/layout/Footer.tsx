import { getTranslations } from "next-intl/server";
import { FaEnvelope, FaInstagram, FaPhone, FaTiktok } from "react-icons/fa6";
import { Link } from "@/i18n/navigation";
import { brandFont } from "@/lib/fonts/brand";
import { getContactInfo } from "@/lib/site-content";

export async function Footer() {
  const t = await getTranslations("footer");
  const contact = await getContactInfo();

  return (
    <footer className="border-t border-accent/80 bg-accent/15">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-5 py-12 md:flex-row md:items-start md:justify-between md:px-8">
        <div className="max-w-md">
          <p className={`${brandFont.className} text-lg tracking-wide text-ink`}>
            {t("brand")}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted">{t("tagline")}</p>

          <div className="mt-6 space-y-3 text-sm text-muted">
            <a
              href={contact.emailHref}
              className="flex items-center gap-3 hover:text-ink"
            >
              <FaEnvelope className="h-4 w-4 shrink-0 text-ink" aria-hidden />
              <span>{contact.email}</span>
            </a>
            <a
              href={contact.moldovaPhoneHref}
              className="flex items-center gap-3 hover:text-ink"
            >
              <FaPhone className="h-4 w-4 shrink-0 text-ink" aria-hidden />
              <span>{contact.moldovaPhone}</span>
            </a>
            <a
              href={contact.ukrainePhoneHref}
              className="flex items-center gap-3 hover:text-ink"
            >
              <FaPhone className="h-4 w-4 shrink-0 text-ink" aria-hidden />
              <span>{contact.ukrainePhone}</span>
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-4 text-sm text-muted">
          <Link href="/contact" className="hover:text-ink">
            {t("contactLink")}
          </Link>
          <div className="flex gap-4">
            <a
              href={contact.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink transition-opacity hover:opacity-70"
              aria-label="Instagram"
            >
              <FaInstagram className="h-5 w-5" />
            </a>
            <a
              href={contact.tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink transition-opacity hover:opacity-70"
              aria-label="TikTok"
            >
              <FaTiktok className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-accent/40 py-4">
        <p className="mx-auto w-full max-w-[1200px] px-5 text-center text-xs text-muted-2 md:px-8">
          {t("rights", { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  );
}
