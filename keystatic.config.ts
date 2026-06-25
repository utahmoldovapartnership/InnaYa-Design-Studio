import { collection, config, fields, singleton } from "@keystatic/core";
import { EmptyBrandMark } from "@/components/admin/EmptyBrandMark";

const portfolioMedia = {
  directory: "public/images/portfolio",
  publicPath: "/images/portfolio/",
} as const;

function localeFields(label: string) {
  return fields.object(
    {
      title: fields.text({
        label: "Title",
        validation: { isRequired: true },
      }),
      location: fields.text({
        label: "Location",
        validation: { isRequired: true },
      }),
      excerpt: fields.text({
        label: "Short description",
        description: "Shown on the portfolio grid and in search results.",
        multiline: true,
        validation: { isRequired: true },
      }),
      typology: fields.text({
        label: "Typology",
        description: "e.g. Architecture, Interior design, Space planning",
        validation: { isRequired: true },
      }),
      status: fields.text({
        label: "Status",
        description: "Optional. Leave empty to use the default site label.",
      }),
    },
    { label },
  );
}

const galleryMediaField = fields.conditional(
  fields.select({
    label: "Media type",
    options: [
      { label: "Image", value: "image" },
      { label: "Video", value: "video" },
    ],
    defaultValue: "image",
  }),
  {
    image: fields.object(
      {
        image: fields.image({
          label: "Image file",
          description: "Drag an image here or click to upload.",
          ...portfolioMedia,
        }),
        fit: fields.select({
          label: "Display fit",
          description: "Use Contain for floor plans.",
          options: [
            { label: "Cover (default)", value: "cover" },
            { label: "Contain (floor plans)", value: "contain" },
          ],
          defaultValue: "cover",
        }),
        orientation: fields.select({
          label: "Orientation",
          options: [
            { label: "Landscape", value: "landscape" },
            { label: "Portrait", value: "portrait" },
          ],
          defaultValue: "landscape",
        }),
        width: fields.integer({
          label: "Width (px)",
          description: "Optional. Usually not needed.",
        }),
        height: fields.integer({
          label: "Height (px)",
          description: "Optional. Usually not needed.",
        }),
      },
      { label: "Image settings", layout: [12, 6, 6, 6, 6] },
    ),
    video: fields.object(
      {
        file: fields.file({
          label: "Video file",
          description: "Drag an MP4 here or click to upload.",
          ...portfolioMedia,
        }),
        poster: fields.image({
          label: "Cover image (thumbnail)",
          description:
            "Shown in the portfolio grid. Upload a still frame from the video.",
          ...portfolioMedia,
        }),
        orientation: fields.select({
          label: "Orientation",
          options: [
            { label: "Landscape", value: "landscape" },
            { label: "Portrait", value: "portrait" },
          ],
          defaultValue: "landscape",
        }),
      },
      { label: "Video settings", layout: [12, 12, 12] },
    ),
  },
);

function aboutLocaleFields(label: string) {
  return fields.text({
    label,
    description: "Separate paragraphs with a blank line.",
    multiline: true,
    validation: { isRequired: true },
  });
}

function getStorage():
  | { kind: "local" }
  | { kind: "github"; repo: `${string}/${string}` } {
  // Server-only KEYSTATIC_GITHUB_REPO works for API routes; the admin UI
  // bundle needs NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO at build time.
  const repo =
    process.env.KEYSTATIC_GITHUB_REPO ??
    process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO;
  if (repo && repo.includes("/")) {
    return {
      kind: "github",
      repo: repo as `${string}/${string}`,
    };
  }
  return { kind: "local" };
}

export default config({
  storage: getStorage(),
  ui: {
    brand: {
      mark: EmptyBrandMark,
      name: "Dashboard",
    },
    navigation: {
      Pages: ["projects", "about", "contact"],
    },
  },
  singletons: {
    about: singleton({
      label: "About",
      path: "content/about/",
      format: { data: "yaml" },
      previewUrl: "/uk/about",
      schema: {
        en: aboutLocaleFields("English"),
        uk: aboutLocaleFields("Ukrainian"),
        ru: aboutLocaleFields("Russian"),
      },
    }),
    contact: singleton({
      label: "Contact",
      path: "content/contact/",
      format: { data: "yaml" },
      previewUrl: "/uk/contact",
      schema: {
        email: fields.text({
          label: "Email",
          validation: { isRequired: true },
        }),
        moldovaPhone: fields.text({
          label: "Moldova",
          description: "Phone number for Moldova.",
          validation: { isRequired: true },
        }),
        ukrainePhone: fields.text({
          label: "Ukraine",
          description: "Phone number for Ukraine.",
          validation: { isRequired: true },
        }),
        instagram: fields.text({
          label: "Instagram",
          description: "Handle, e.g. @innaya_d_studio",
          validation: { isRequired: true },
        }),
        tiktok: fields.text({
          label: "TikTok",
          description: "Handle, e.g. @innaya.design",
          validation: { isRequired: true },
        }),
      },
    }),
  },
  collections: {
    projects: collection({
      label: "Portfolio",
      slugField: "slug",
      path: "content/projects/*",
      format: { data: "yaml" },
      entryLayout: "form",
      columns: ["year", "area"],
      previewUrl: "/uk/portfolio/{slug}",
      schema: {
        slug: fields.slug({
          name: {
            label: "Name",
            validation: { isRequired: false },
          },
          slug: {
            label: "Project slug",
            description:
              "URL path: /portfolio/[slug]. Use lowercase letters and hyphens only.",
          },
        }),
        year: fields.text({
          label: "Year",
          validation: { isRequired: true },
        }),
        area: fields.text({
          label: "Area (m²)",
          description: "Optional. Leave empty if not applicable.",
        }),
        en: localeFields("English"),
        uk: localeFields("Ukrainian"),
        ru: localeFields("Russian"),
        cover: fields.object(
          {
            image: fields.image({
              label: "Cover image",
              description:
                "Main image on the portfolio grid. Drag and drop or click to upload.",
              ...portfolioMedia,
            }),
            alt: fields.text({
              label: "Alt text",
              validation: { isRequired: true },
            }),
            orientation: fields.select({
              label: "Orientation",
              options: [
                { label: "Landscape", value: "landscape" },
                { label: "Portrait", value: "portrait" },
              ],
              defaultValue: "landscape",
            }),
          },
          { label: "Cover image", layout: [12, 8, 4] },
        ),
        gallery: fields.array(
          fields.object(
            {
              alt: fields.text({
                label: "Description",
                description: "Short label for this image or video.",
                validation: { isRequired: true },
              }),
              media: galleryMediaField,
            },
            { label: "Gallery item" },
          ),
          {
            label: "Gallery",
            description:
              "Drag items to reorder. Images and videos appear in this order on the project page.",
            itemLabel: (props) =>
              props.fields.alt.value ?? "Gallery item",
          },
        ),
      },
    }),
  },
});
