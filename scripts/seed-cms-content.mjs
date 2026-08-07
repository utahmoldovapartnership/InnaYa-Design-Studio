/**
 * Seeds CMS YAML from existing site content (messages/*.json and live fallbacks).
 * Safe to re-run — refreshes page media files and technologies copy.
 */
import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { fileURLToPath } from "url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const mediaDir = path.join(root, "public/media/pages");

const MEDIA = {
  heroVideo: {
    url: "https://www.pexels.com/download/video/5384977/",
    filename: "hero-home.mp4",
  },
  aboutBackground: {
    url: "https://images.pexels.com/photos/4621657/pexels-photo-4621657.jpeg?auto=compress&cs=tinysrgb&w=1920",
    filename: "about-background.jpg",
  },
  vrImage: {
    url: "https://www.kanikadesign.com/wp-content/uploads/2023/09/virtual-reality-world-of-interior-design-img-1.jpg",
    filename: "vr-feature.jpg",
  },
};

async function downloadFile(url, dest) {
  const response = await fetch(url, {
    redirect: "follow",
    headers: { "User-Agent": "InnYa-Design-Seed/1.0" },
  });
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(dest, buffer);
}

function copyIfExists(src, dest) {
  if (!fs.existsSync(src)) return false;
  fs.copyFileSync(src, dest);
  return true;
}

async function seedPageMedia() {
  fs.mkdirSync(mediaDir, { recursive: true });

  const heroDest = path.join(mediaDir, MEDIA.heroVideo.filename);
  if (!fs.existsSync(heroDest)) {
    console.log("Downloading home hero video…");
    await downloadFile(MEDIA.heroVideo.url, heroDest);
  }

  const aboutDest = path.join(mediaDir, MEDIA.aboutBackground.filename);
  if (!fs.existsSync(aboutDest)) {
    console.log("Downloading about background…");
    await downloadFile(MEDIA.aboutBackground.url, aboutDest);
  }

  const vrDest = path.join(mediaDir, MEDIA.vrImage.filename);
  if (!fs.existsSync(vrDest)) {
    console.log("Downloading VR image…");
    await downloadFile(MEDIA.vrImage.url, vrDest);
  }

  return {
    heroVideo: fs.existsSync(heroDest) ? MEDIA.heroVideo.filename : null,
    aboutBackground: fs.existsSync(aboutDest)
      ? MEDIA.aboutBackground.filename
      : null,
    vrImage: fs.existsSync(vrDest) ? MEDIA.vrImage.filename : null,
  };
}

function loadServices(locale) {
  const file = path.join(root, "messages", `${locale}.json`);
  return JSON.parse(fs.readFileSync(file, "utf8")).services;
}

function joinParagraphs(paragraphs) {
  return paragraphs.join("\n\n");
}

function mapTechnologiesLocale(services) {
  return {
    pageTitle: services.title,
    metaDescription: services.metaDescription.replace(/Revit BIM,?\s*/gi, ""),
    vrEyebrow: services.vrEyebrow,
    vrTitle: services.vrTitle,
    vrIntro: joinParagraphs(services.vrIntro),
    vrBenefits: services.vrBenefits.map(({ title, body }) => ({ title, body })),
    vrClosing: joinParagraphs(services.vrClosing),
    vrImageAlt: services.vrImageAlt,
    leicaEyebrow: services.leicaEyebrow,
    leicaTitle: services.leicaTitle,
    leicaIntro: joinParagraphs(services.leicaIntro),
    leicaBenefits: services.leicaBenefits.map(({ title, body }) => ({
      title,
      body,
    })),
    leicaClosing: joinParagraphs(services.leicaClosing),
  };
}

const media = await seedPageMedia();

fs.writeFileSync(
  path.join(root, "content/home/index.yaml"),
  yaml.dump({ heroVideo: media.heroVideo }, { lineWidth: 120, noRefs: true }),
);

const aboutPath = path.join(root, "content/about/index.yaml");
const about = fs.existsSync(aboutPath)
  ? yaml.load(fs.readFileSync(aboutPath, "utf8"))
  : {};
const { background: _background, ...aboutLocales } = about;
fs.writeFileSync(
  aboutPath,
  yaml.dump(
    { background: media.aboutBackground, ...aboutLocales },
    { lineWidth: 120, noRefs: true },
  ),
);

const technologies = {
  vr: { image: media.vrImage },
  leica: { videoId: "CpSLmy0iI_g" },
  sections: [],
  en: mapTechnologiesLocale(loadServices("en")),
  uk: mapTechnologiesLocale(loadServices("uk")),
  ru: mapTechnologiesLocale(loadServices("ru")),
};

fs.writeFileSync(
  path.join(root, "content/technologies/index.yaml"),
  yaml.dump(technologies, { lineWidth: 120, noRefs: true }),
);

console.log("Seeded page media and content YAML:");
console.log(`  home heroVideo: ${media.heroVideo ?? "(missing)"}`);
console.log(`  about background: ${media.aboutBackground ?? "(missing)"}`);
console.log(`  technologies vr: ${media.vrImage ?? "(missing)"}`);
