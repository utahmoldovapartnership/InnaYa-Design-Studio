import { collection, config, fields, singleton } from "@keystatic/core";
import { EmptyBrandMark } from "@/components/admin/EmptyBrandMark";
import {
  ADMIN_LOCALE,
  adminFields as f,
  adminNav,
  localeTabLabels,
} from "@/lib/admin-labels";
import { getKeystaticGithubRepo } from "@/lib/keystatic-github-repo";

const portfolioMedia = {
  directory: "public/images/portfolio",
  publicPath: "/images/portfolio/",
} as const;

const pageMedia = {
  directory: "public/media/pages",
  publicPath: "/media/pages/",
} as const;

function localeFields(label: string) {
  return fields.object(
    {
      title: fields.text({
        label: f.title,
        validation: { isRequired: true },
      }),
      location: fields.text({
        label: f.location,
        validation: { isRequired: true },
      }),
      excerpt: fields.text({
        label: f.excerpt,
        description: f.excerptHint,
        multiline: true,
        validation: { isRequired: true },
      }),
      typology: fields.text({
        label: f.typology,
        description: f.typologyHint,
        validation: { isRequired: true },
      }),
      status: fields.text({
        label: f.status,
        description: f.statusHint,
      }),
    },
    { label },
  );
}

const galleryMediaField = fields.conditional(
  fields.select({
    label: f.mediaType,
    options: [
      { label: f.image, value: "image" },
      { label: f.video, value: "video" },
    ],
    defaultValue: "image",
  }),
  {
    image: fields.object(
      {
        image: fields.image({
          label: f.imageFile,
          description: f.imageFileHint,
          ...portfolioMedia,
        }),
        fit: fields.select({
          label: f.displayFit,
          description: f.displayFitHint,
          options: [
            { label: f.fitCover, value: "cover" },
            { label: f.fitContain, value: "contain" },
          ],
          defaultValue: "cover",
        }),
        orientation: fields.select({
          label: f.orientation,
          options: [
            { label: f.landscape, value: "landscape" },
            { label: f.portrait, value: "portrait" },
          ],
          defaultValue: "landscape",
        }),
        width: fields.integer({
          label: f.widthPx,
          description: f.optionalHint,
        }),
        height: fields.integer({
          label: f.heightPx,
          description: f.optionalHint,
        }),
      },
      { label: f.imageSettings, layout: [12, 6, 6, 6, 6] },
    ),
    video: fields.object(
      {
        file: fields.file({
          label: f.videoFile,
          description: f.videoFileHint,
          ...portfolioMedia,
        }),
        poster: fields.image({
          label: f.coverThumbnail,
          description: f.coverThumbnailHint,
          ...portfolioMedia,
        }),
        orientation: fields.select({
          label: f.orientation,
          options: [
            { label: f.landscape, value: "landscape" },
            { label: f.portrait, value: "portrait" },
          ],
          defaultValue: "landscape",
        }),
      },
      { label: f.videoSettings, layout: [12, 12, 12] },
    ),
  },
);

function aboutLocaleFields(label: string) {
  return fields.text({
    label,
    description: f.aboutTextHint,
    multiline: true,
    validation: { isRequired: true },
  });
}

function techBenefitField() {
  return fields.object(
    {
      title: fields.text({ label: f.benefitTitle }),
      body: fields.text({ label: f.benefitBody, multiline: true }),
    },
    { label: f.benefitItem },
  );
}

function techParagraphField(label: string) {
  return fields.text({
    label,
    description: f.techParagraphHint,
    multiline: true,
  });
}

function technologiesLocaleFields(label: string) {
  return fields.object(
    {
      pageTitle: fields.text({ label: f.pageTitle }),
      metaDescription: fields.text({
        label: f.metaDescription,
        multiline: true,
      }),
      vrEyebrow: fields.text({ label: f.vrEyebrow }),
      vrTitle: fields.text({ label: f.vrTitle }),
      vrIntro: techParagraphField(f.vrIntro),
      vrBenefits: fields.array(techBenefitField(), {
        label: f.vrBenefits,
        itemLabel: (props) =>
          props.fields.title.value?.trim() || f.benefitItem,
      }),
      vrClosing: techParagraphField(f.vrClosing),
      vrImageAlt: fields.text({ label: f.vrImageAlt }),
      leicaEyebrow: fields.text({ label: f.leicaEyebrow }),
      leicaTitle: fields.text({ label: f.leicaTitle }),
      leicaIntro: techParagraphField(f.leicaIntro),
      leicaBenefits: fields.array(techBenefitField(), {
        label: f.leicaBenefits,
        itemLabel: (props) =>
          props.fields.title.value?.trim() || f.benefitItem,
      }),
      leicaClosing: techParagraphField(f.leicaClosing),
    },
    { label },
  );
}

function getStorage():
  | { kind: "local" }
  | { kind: "github"; repo: `${string}/${string}` } {
  const repo = getKeystaticGithubRepo();
  if (repo) {
    return {
      kind: "github",
      repo: repo as `${string}/${string}`,
    };
  }
  return { kind: "local" };
}

export default config({
  locale: ADMIN_LOCALE,
  storage: getStorage(),
  ui: {
    brand: {
      mark: EmptyBrandMark,
      name: adminNav.brand,
    },
    navigation: {
      [adminNav.pages]: [
        "home",
        "about",
        "projects",
        "technologies",
        "contact",
      ],
    },
  },
  singletons: {
    home: singleton({
      label: adminNav.home,
      path: "content/home/",
      format: { data: "yaml" },
      previewUrl: "/uk",
      schema: {
        heroVideo: fields.file({
          label: f.homeHeroVideo,
          description: f.homeHeroVideoHint,
          ...pageMedia,
        }),
      },
    }),
    about: singleton({
      label: adminNav.about,
      path: "content/about/",
      format: { data: "yaml" },
      previewUrl: "/uk/about",
      schema: {
        background: fields.image({
          label: f.aboutBackground,
          description: f.aboutBackgroundHint,
          ...pageMedia,
        }),
        en: aboutLocaleFields(localeTabLabels.en),
        uk: aboutLocaleFields(localeTabLabels.uk),
        ru: aboutLocaleFields(localeTabLabels.ru),
      },
    }),
    technologies: singleton({
      label: adminNav.technologies,
      path: "content/technologies/",
      format: { data: "yaml" },
      previewUrl: "/uk/technologies",
      schema: {
        vr: fields.object(
          {
            image: fields.image({
              label: f.vrImage,
              description: f.vrImageHint,
              ...pageMedia,
            }),
          },
          { label: f.vrSection },
        ),
        leica: fields.object(
          {
            videoId: fields.text({
              label: f.leicaVideoId,
              description: f.leicaVideoIdHint,
            }),
          },
          { label: f.leicaSection },
        ),
        en: technologiesLocaleFields(localeTabLabels.en),
        uk: technologiesLocaleFields(localeTabLabels.uk),
        ru: technologiesLocaleFields(localeTabLabels.ru),
      },
    }),
    contact: singleton({
      label: adminNav.contact,
      path: "content/contact/",
      format: { data: "yaml" },
      previewUrl: "/uk/contact",
      schema: {
        email: fields.text({
          label: f.email,
          validation: { isRequired: true },
        }),
        moldovaPhone: fields.text({
          label: f.moldovaPhone,
          description: f.moldovaPhoneHint,
          validation: { isRequired: true },
        }),
        ukrainePhone: fields.text({
          label: f.ukrainePhone,
          description: f.ukrainePhoneHint,
          validation: { isRequired: true },
        }),
        instagram: fields.text({
          label: f.instagram,
          description: f.instagramHint,
          validation: { isRequired: true },
        }),
        tiktok: fields.text({
          label: f.tiktok,
          description: f.tiktokHint,
          validation: { isRequired: true },
        }),
      },
    }),
  },
  collections: {
    projects: collection({
      label: adminNav.projects,
      slugField: "slug",
      path: "content/projects/*",
      format: { data: "yaml" },
      entryLayout: "form",
      columns: ["year", "area"],
      previewUrl: "/uk/portfolio/{slug}",
      schema: {
        slug: fields.slug({
          name: {
            label: f.name,
            validation: { isRequired: false },
          },
          slug: {
            label: f.projectSlug,
            description: f.projectSlugHint,
          },
        }),
        year: fields.text({
          label: f.year,
          validation: { isRequired: true },
        }),
        area: fields.text({
          label: f.area,
          description: f.areaHint,
        }),
        en: localeFields(localeTabLabels.en),
        uk: localeFields(localeTabLabels.uk),
        ru: localeFields(localeTabLabels.ru),
        cover: fields.object(
          {
            image: fields.image({
              label: f.coverImage,
              description: f.coverImageHint,
              ...portfolioMedia,
            }),
            alt: fields.text({
              label: f.altText,
              validation: { isRequired: true },
            }),
            orientation: fields.select({
              label: f.orientation,
              options: [
                { label: f.landscape, value: "landscape" },
                { label: f.portrait, value: "portrait" },
              ],
              defaultValue: "landscape",
            }),
          },
          { label: f.coverImage, layout: [12, 8, 4] },
        ),
        gallery: fields.array(
          fields.object(
            {
              alt: fields.text({
                label: f.galleryDescription,
                description: f.galleryDescriptionHint,
                validation: { isRequired: true },
              }),
              media: galleryMediaField,
            },
            { label: f.galleryItem },
          ),
          {
            label: f.gallery,
            description: f.galleryHint,
            itemLabel: (props) =>
              props.fields.alt.value ?? f.galleryItemDefault,
          },
        ),
      },
    }),
  },
});
