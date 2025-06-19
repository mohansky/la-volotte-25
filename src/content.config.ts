import { defineCollection, z } from "astro:content";
import { csvLoader } from "@ascorbic/csv-loader";
import { file, glob } from "astro/loaders";

const siteData = defineCollection({
  loader: file("src/content/site/index.yml"),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      title: z.string(),
      description: z.string(),
      basepath: z.string(),
      ogImageURL: image(),
      keywords: z.array(z.string()),
      author: z.object({
        name: z.string(),
        email: z.string().email({ message: "Must be a valid email address" }),
        url: z.string().url({ message: "URL must be valid" }),
      }),
      links: z.array(
        z.object({
          text: z.string(),
          link: z.string(),
        })
      ),
      footnote1: z.string(),
      footnote: z.string(),
      copyright: z.string(),
      email: z.string().email({ message: "Must be a valid email address" }),
      hero: z.array(
        z.object({
          bgImage: z.string(),
          title: z.string(),
          subtitle: z.string(),
          btnText: z.string(),
          btnLink: z.string(),
        })
      ),
      about: z.array(
        z.object({
          content: z.array(z.string()),
          image: z.string(),
        })
      ),
      about1: z.array(
        z.object({
          content: z.array(z.string()),
          image: z.string(),
        })
      ),
      ladengallery: z.array(
        z.object({
          name: z.string(),
          image: z.string(),
        })
      ),
      ctaTitle: z.string(),
      ctaText: z.string(),
      ctaBg: z.string(),
      ctaBtnText: z.string(),
      ctaBtnLink: z.string(),
      rechtliches: z.array(
        z.object({
          name: z.string(),
          URL: z.string(),
        })
      ),
      openningHours: z.object({
        title: z.string(),
        dayTimeList: z.array(
          z.object({
            day: z.string(),
            time: z.string(),
          })
        ),
      }),
      faqItem: z.array(
        z.object({
          title: z.string(),
          content: z.string(),
        })
      ),
      socialTitle: z.string(),
      socials: z.array(
        z.object({
          link: z.string(),
          icon: z.string(),
          text: z.string(),
        })
      ),
      contactTitle: z.string(),
      contactSubtitle: z.string(),
      contactdetails: z.array(
        z.object({
          link: z.string(),
          icon: z.string(),
          text: z.array(z.string()),
        })
      ),
    }),
});

const products = defineCollection({
  loader: csvLoader({ fileName: "src/content/products/lv_produkte.csv" }),
  schema: ({ image }) =>
    z.object({
      published: z.boolean().optional().default(true),
      id: z.string(),
      marke: z.string(),
      name: z.string(),
      beschreibung: z.string(),
      preis: z.number(),
      preisStatt: z.number(),
      menge: z.string(),
      material: z.string(),
      nadelstaerke: z.string(),
      lauflaenge: z.string(),
      featureImage: z.string().optional(),
      featureImageSlider: z.string().optional(),
      farbenFotos: z.string().optional(),
    }),
});

const rechtliches = defineCollection({
  loader: glob({ pattern: ["*.mdx"], base: "src/content/rechtliches" }),
  schema: () =>
    z.object({
      draft: z.boolean().optional().default(false),
      title: z.string().optional(),
    }),
});

export const collections = { siteData, products, rechtliches };
