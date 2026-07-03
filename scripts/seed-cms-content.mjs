/**
 * Seeds CMS YAML from existing site content (messages/*.json and local assets).
 * Safe to re-run — overwrites technologies/index.yaml with current message copy.
 */
import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { fileURLToPath } from "url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

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
    metaDescription: services.metaDescription,
    revitEyebrow: services.revitEyebrow,
    revitTitle: services.revitTitle,
    revitIntro: joinParagraphs(services.revitIntro),
    revitBenefitsTitle: services.revitBenefitsTitle,
    revitBenefits: services.revitBenefits.map(({ title, body }) => ({
      title,
      body,
    })),
    revitImageAlt: services.revitImageAlt,
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

const revitSrc = path.join(root, "public/images/technologies/revit-feature.jpg");
const revitDest = path.join(root, "public/media/pages/revit-feature.jpg");
fs.mkdirSync(path.dirname(revitDest), { recursive: true });
if (fs.existsSync(revitSrc)) {
  fs.copyFileSync(revitSrc, revitDest);
}

const technologies = {
  revit: { image: fs.existsSync(revitDest) ? "revit-feature.jpg" : null },
  vr: { image: null },
  leica: { videoId: "CpSLmy0iI_g" },
  en: mapTechnologiesLocale(loadServices("en")),
  uk: mapTechnologiesLocale(loadServices("uk")),
  ru: mapTechnologiesLocale(loadServices("ru")),
};

fs.writeFileSync(
  path.join(root, "content/technologies/index.yaml"),
  yaml.dump(technologies, { lineWidth: 120, noRefs: true }),
);

console.log("Seeded content/technologies/index.yaml");
