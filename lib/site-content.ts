import { reader } from "@/lib/projects";

type Locale = "en" | "uk" | "ru";

type AboutEntry = {
  en: string;
  uk: string;
  ru: string;
};

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

export async function getAboutBody(locale: string): Promise<string> {
  const entry = (await reader.singletons.about.read()) as AboutEntry | null;
  const loc = toLocale(locale);
  return entry?.[loc]?.trim() || DEFAULT_ABOUT[loc];
}

export async function getAboutParagraphs(locale: string): Promise<string[]> {
  const body = await getAboutBody(locale);
  return splitBodyParagraphs(body);
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
