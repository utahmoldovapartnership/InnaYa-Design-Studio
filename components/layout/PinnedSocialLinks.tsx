import { FaInstagram, FaTiktok } from "react-icons/fa6";
import { getTranslations } from "next-intl/server";

export async function PinnedSocialLinks() {
  const tNav = await getTranslations("nav");

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-end gap-3 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:px-8 md:pb-8">
      <a
        href="https://www.instagram.com/innaya_d_studio/"
        target="_blank"
        rel="noopener noreferrer"
        className="pointer-events-auto grid h-10 w-10 place-items-center rounded-full bg-white text-ink transition-opacity hover:opacity-75"
        aria-label={`${tNav("brand")} Instagram`}
      >
        <FaInstagram className="h-5 w-5" />
      </a>
      <a
        href="https://www.tiktok.com/@innaya.design"
        target="_blank"
        rel="noopener noreferrer"
        className="pointer-events-auto grid h-10 w-10 place-items-center rounded-full bg-white text-ink transition-opacity hover:opacity-75"
        aria-label={`${tNav("brand")} TikTok`}
      >
        <FaTiktok className="h-5 w-5" />
      </a>
    </div>
  );
}
