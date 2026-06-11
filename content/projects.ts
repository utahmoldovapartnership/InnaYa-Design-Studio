export type ProjectImageOrientation = "portrait" | "landscape";

export type ProjectImage = {
  src: string;
  alt: string;
  kind?: "image" | "video";
  /** Still used as the portfolio grid thumbnail when kind is video. */
  poster?: string;
  orientation?: ProjectImageOrientation;
  /** Show the full image at gallery width without cropping. */
  fit?: "cover" | "contain";
  width?: number;
  height?: number;
};

export function isPortraitMedia(item: ProjectImage) {
  return item.orientation === "portrait";
}

export function coverAspectClass(cover: ProjectImage) {
  return isPortraitMedia(cover) ? "aspect-[3/4]" : "aspect-[4/3]";
}

export type Project = {
  slug: string;
  cover: ProjectImage;
  gallery: ProjectImage[];
  area?: string;
};

const velikiyDalnikGallery: ProjectImage[] = [
  {
    src: "/images/portfolio/velikiy-dalnik-house/floor-1.jpg",
    alt: "First floor plan",
    fit: "contain",
    width: 4963,
    height: 3509,
  },
  {
    src: "/images/portfolio/velikiy-dalnik-house/floor-2.jpg",
    alt: "Second floor plan",
    fit: "contain",
    width: 4963,
    height: 3509,
  },
  { src: "/images/portfolio/velikiy-dalnik-house/render-1.jpg", alt: "Exterior view" },
  { src: "/images/portfolio/velikiy-dalnik-house/render-2.jpg", alt: "Exterior view" },
  { src: "/images/portfolio/velikiy-dalnik-house/render-3.jpg", alt: "Exterior view" },
  { src: "/images/portfolio/velikiy-dalnik-house/render-4.jpg", alt: "Exterior view" },
  { src: "/images/portfolio/velikiy-dalnik-house/render-5.jpg", alt: "Exterior view" },
  { src: "/images/portfolio/velikiy-dalnik-house/render-6.jpg", alt: "Exterior view" },
  { src: "/images/portfolio/velikiy-dalnik-house/render-7.jpg", alt: "Exterior view" },
];

const sukhoyLimanGallery: ProjectImage[] = [
  {
    src: "/images/portfolio/sukhoy-liman-house/floor-1.jpg",
    alt: "First floor plan",
    fit: "contain",
    width: 3509,
    height: 4961,
  },
  {
    src: "/images/portfolio/sukhoy-liman-house/floor-2.jpg",
    alt: "Second floor plan",
    fit: "contain",
    width: 3509,
    height: 4961,
  },
  { src: "/images/portfolio/sukhoy-liman-house/render-1.jpg", alt: "Interior view" },
  { src: "/images/portfolio/sukhoy-liman-house/render-2.jpg", alt: "Interior view" },
  { src: "/images/portfolio/sukhoy-liman-house/render-3.jpg", alt: "Interior view" },
  { src: "/images/portfolio/sukhoy-liman-house/render-4.jpg", alt: "Interior view" },
  { src: "/images/portfolio/sukhoy-liman-house/render-5.jpg", alt: "Interior view" },
  { src: "/images/portfolio/sukhoy-liman-house/render-6.jpg", alt: "Interior view" },
  { src: "/images/portfolio/sukhoy-liman-house/render-7.jpg", alt: "Interior view" },
  { src: "/images/portfolio/sukhoy-liman-house/render-8.jpg", alt: "Interior view" },
];

const belyyShokoladGallery: ProjectImage[] = [
  {
    src: "/images/portfolio/belyy-shokolad-apartments/plan.mp4",
    alt: "Floor plan walkthrough",
    kind: "video",
    poster: "/images/portfolio/belyy-shokolad-apartments/plan-cover.jpg",
    orientation: "portrait",
  },
];

const istraGallery: ProjectImage[] = [
  {
    src: "/images/portfolio/istra-house/floor-plan.jpg",
    alt: "Floor plan",
    fit: "contain",
    width: 9934,
    height: 7017,
  },
  { src: "/images/portfolio/istra-house/photo-1.jpg", alt: "Construction progress" },
  { src: "/images/portfolio/istra-house/photo-2.jpg", alt: "Construction progress" },
  { src: "/images/portfolio/istra-house/photo-3.jpg", alt: "Construction progress" },
  { src: "/images/portfolio/istra-house/photo-4.jpg", alt: "Construction progress" },
  { src: "/images/portfolio/istra-house/photo-5.jpg", alt: "Construction progress" },
  { src: "/images/portfolio/istra-house/photo-6.jpg", alt: "Construction progress" },
  { src: "/images/portfolio/istra-house/photo-7.jpg", alt: "Construction progress" },
  { src: "/images/portfolio/istra-house/photo-8.jpg", alt: "Construction progress" },
  { src: "/images/portfolio/istra-house/photo-9.jpg", alt: "Construction progress" },
  { src: "/images/portfolio/istra-house/photo-10.jpg", alt: "Construction progress" },
  { src: "/images/portfolio/istra-house/photo-11.jpg", alt: "Construction progress" },
  { src: "/images/portfolio/istra-house/photo-12.jpg", alt: "Exterior view" },
  { src: "/images/portfolio/istra-house/photo-interior.jpg", alt: "Interior view" },
];

export const projectList: Project[] = [
  {
    slug: "velikiy-dalnik-house",
    cover: {
      src: "/images/portfolio/velikiy-dalnik-house/cover.jpg",
      alt: "Private house exterior, Velykyi Dalnyk",
    },
    gallery: velikiyDalnikGallery,
  },
  {
    slug: "sukhoy-liman-house",
    area: "190",
    cover: {
      src: "/images/portfolio/sukhoy-liman-house/cover.jpg",
      alt: "Interior bathroom, Sukhoy Liman",
    },
    gallery: sukhoyLimanGallery,
  },
  {
    slug: "belyy-shokolad-apartments",
    cover: {
      src: "/images/portfolio/belyy-shokolad-apartments/plan-cover.jpg",
      alt: "Floor plan, Belyy Shokolad apartments",
    },
    gallery: belyyShokoladGallery,
  },
  {
    slug: "istra-house",
    area: "171",
    cover: {
      src: "/images/portfolio/istra-house/cover.jpg",
      alt: "Private house exterior, Istra district",
    },
    gallery: istraGallery,
  },
];

export type ProjectSlug = (typeof projectList)[number]["slug"];

export function getProjectBySlug(slug: string) {
  return projectList.find((p) => p.slug === slug);
}
