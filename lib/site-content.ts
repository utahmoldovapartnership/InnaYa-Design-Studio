import { reader } from "@/lib/projects";
import { pageAssetUrl } from "@/lib/page-media-url";
import type { TechBenefit } from "@/components/technology/TechChapter";
import en from "@/messages/en.json";
import ru from "@/messages/ru.json";
import uk from "@/messages/uk.json";

export type { TechBenefit };

type Locale = "en" | "uk" | "ru";

type AboutEntry = {
  background?: string | null;
  en: string;
  uk: string;
  ru: string;
};

type HomeEntry = {
  heroVideo?: string | null;
};

type TechnologiesLocaleEntry = {
  pageTitle?: string | null;
  metaDescription?: string | null;
  vrEyebrow?: string | null;
  vrTitle?: string | null;
  vrIntro?: string | null;
  vrBenefits?: readonly TechBenefit[] | null;
  vrClosing?: string | null;
  vrImageAlt?: string | null;
  leicaEyebrow?: string | null;
  leicaTitle?: string | null;
  leicaIntro?: string | null;
  leicaBenefits?: readonly TechBenefit[] | null;
  leicaClosing?: string | null;
};

type TechnologiesEntry = {
  vr?: { image?: string | null } | null;
  leica?: { videoId?: string | null } | null;
  en?: TechnologiesLocaleEntry | null;
  uk?: TechnologiesLocaleEntry | null;
  ru?: TechnologiesLocaleEntry | null;
};

export type TechnologiesContent = {
  pageTitle: string;
  metaDescription: string;
  vrEyebrow: string;
  vrTitle: string;
  vrIntro: string[];
  vrBenefits: TechBenefit[];
  vrClosing: string[];
  vrImageAlt: string;
  leicaEyebrow: string;
  leicaTitle: string;
  leicaIntro: string[];
  leicaBenefits: TechBenefit[];
  leicaClosing: string[];
};

const DEFAULT_HOME_HERO_VIDEO =
  "https://www.pexels.com/download/video/5384977/";

const DEFAULT_ABOUT_BACKGROUND =
  "https://images.pexels.com/photos/4621657/pexels-photo-4621657.jpeg?auto=compress&cs=tinysrgb&w=1920";

const DEFAULT_TECH_IMAGES = {
  vr: "https://www.kanikadesign.com/wp-content/uploads/2023/09/virtual-reality-world-of-interior-design-img-1.jpg",
} as const;

const DEFAULT_LEICA_VIDEO_ID = "CpSLmy0iI_g";

type ServicesMessages = (typeof en)["services"];

const FALLBACK_TECH: Record<Locale, ServicesMessages> = {
  en: en.services,
  uk: uk.services,
  ru: ru.services,
};

function pickText(value: string | null | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed || fallback;
}

function pickParagraphs(
  value: string | null | undefined,
  fallback: string[],
): string[] {
  const paragraphs = splitBodyParagraphs(value?.trim() ?? "");
  return paragraphs.length > 0 ? paragraphs : fallback;
}

function pickBenefits(
  value: readonly TechBenefit[] | null | undefined,
  fallback: TechBenefit[],
): TechBenefit[] {
  const items = (value ?? []).filter(
    (item) => item.title?.trim() && item.body?.trim(),
  );
  return items.length > 0 ? [...items] : fallback;
}

function mapTechnologiesLocale(
  entry: TechnologiesLocaleEntry | null | undefined,
  fallback: ServicesMessages,
): TechnologiesContent {
  return {
    pageTitle: pickText(entry?.pageTitle, fallback.title),
    metaDescription: pickText(entry?.metaDescription, fallback.metaDescription),
    vrEyebrow: pickText(entry?.vrEyebrow, fallback.vrEyebrow),
    vrTitle: pickText(entry?.vrTitle, fallback.vrTitle),
    vrIntro: pickParagraphs(entry?.vrIntro, fallback.vrIntro),
    vrBenefits: pickBenefits(entry?.vrBenefits, fallback.vrBenefits),
    vrClosing: pickParagraphs(entry?.vrClosing, fallback.vrClosing),
    vrImageAlt: pickText(entry?.vrImageAlt, fallback.vrImageAlt),
    leicaEyebrow: pickText(entry?.leicaEyebrow, fallback.leicaEyebrow),
    leicaTitle: pickText(entry?.leicaTitle, fallback.leicaTitle),
    leicaIntro: pickParagraphs(entry?.leicaIntro, fallback.leicaIntro),
    leicaBenefits: pickBenefits(entry?.leicaBenefits, fallback.leicaBenefits),
    leicaClosing: pickParagraphs(entry?.leicaClosing, fallback.leicaClosing),
  };
}

type ContactEntry = {
  email: string;
  moldovaPhone: string;
  ukrainePhone: string;
  instagram: string;
  tiktok: string;
};

export type ContactInfo = ContactEntry & {
  emailHref: string;
  moldovaPhoneHref: string;
  ukrainePhoneHref: string;
  instagramUrl: string;
  tiktokUrl: string;
};

const DEFAULT_ABOUT: AboutEntry = {
  en: "",
  uk: "",
  ru: "",
};

const FALLBACK_ABOUT_PARAGRAPHS: Record<Locale, string[]> = {
  en: en.about.paragraphs,
  uk: uk.about.paragraphs,
  ru: ru.about.paragraphs,
};

const DEFAULT_CONTACT: ContactEntry = {
  email: "innaya.d.studio@gmail.com",
  moldovaPhone: "+373 60 285 316",
  ukrainePhone: "+380 66 185 5688",
  instagram: "@innaya_d_studio",
  tiktok: "@innaya.design",
};

function toLocale(value: string): Locale {
  if (value === "en" || value === "uk" || value === "ru") {
    return value;
  }
  return "uk";
}

function telHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  return `tel:${digits}`;
}

function socialUrl(handle: string, platform: "instagram" | "tiktok"): string {
  const user = handle.replace(/^@/, "").trim();
  if (platform === "instagram") {
    return `https://www.instagram.com/${user}/`;
  }
  return `https://www.tiktok.com/@${user}`;
}

function mapContact(entry: ContactEntry): ContactInfo {
  return {
    ...entry,
    emailHref: `mailto:${entry.email}`,
    moldovaPhoneHref: telHref(entry.moldovaPhone),
    ukrainePhoneHref: telHref(entry.ukrainePhone),
    instagramUrl: socialUrl(entry.instagram, "instagram"),
    tiktokUrl: socialUrl(entry.tiktok, "tiktok"),
  };
}

export function splitBodyParagraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export async function getHomeHeroVideoSrc(): Promise<string> {
  const entry = (await reader.singletons.home.read()) as HomeEntry | null;
  return (
    pageAssetUrl(entry?.heroVideo) ||
    DEFAULT_HOME_HERO_VIDEO
  );
}

export async function getAboutBackgroundSrc(): Promise<string> {
  const entry = (await reader.singletons.about.read()) as AboutEntry | null;
  return (
    pageAssetUrl(entry?.background) ||
    DEFAULT_ABOUT_BACKGROUND
  );
}

export async function getTechnologiesContent(
  locale: string,
): Promise<TechnologiesContent> {
  const loc = toLocale(locale);
  const entry = (await reader.singletons.technologies.read()) as
    | TechnologiesEntry
    | null;
  return mapTechnologiesLocale(entry?.[loc], FALLBACK_TECH[loc]);
}

export async function getTechnologiesMedia(): Promise<{
  vrImageSrc: string;
  leicaVideoId: string;
}> {
  const entry = (await reader.singletons.technologies.read()) as
    | TechnologiesEntry
    | null;

  return {
    vrImageSrc: pageAssetUrl(entry?.vr?.image) || DEFAULT_TECH_IMAGES.vr,
    leicaVideoId:
      entry?.leica?.videoId?.trim() || DEFAULT_LEICA_VIDEO_ID,
  };
}

export async function getAboutBody(locale: string): Promise<string> {
  const entry = (await reader.singletons.about.read()) as AboutEntry | null;
  const loc = toLocale(locale);
  return entry?.[loc]?.trim() || DEFAULT_ABOUT[loc];
}

export async function getAboutParagraphs(locale: string): Promise<string[]> {
  const body = await getAboutBody(locale);
  const paragraphs = splitBodyParagraphs(body);
  if (paragraphs.length > 0) {
    return paragraphs;
  }

  return FALLBACK_ABOUT_PARAGRAPHS[toLocale(locale)];
}

export async function getContactInfo(): Promise<ContactInfo> {
  const entry = (await reader.singletons.contact.read()) as ContactEntry | null;
  return mapContact({
    email: entry?.email?.trim() || DEFAULT_CONTACT.email,
    moldovaPhone: entry?.moldovaPhone?.trim() || DEFAULT_CONTACT.moldovaPhone,
    ukrainePhone: entry?.ukrainePhone?.trim() || DEFAULT_CONTACT.ukrainePhone,
    instagram: entry?.instagram?.trim() || DEFAULT_CONTACT.instagram,
    tiktok: entry?.tiktok?.trim() || DEFAULT_CONTACT.tiktok,
  });
}
