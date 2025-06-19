// @ts-check
import { defineConfig, envField } from "astro/config";
import icon from "astro-icon";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";
import partytown from "@astrojs/partytown";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  site: "https://la-volotte.de",
  output: "server",
  image: {
    service: {
      entrypoint: "astro/assets/services/noop",
    },
    remotePatterns: [
      {
        hostname: "**.r2.dev",
        protocol: "https",
      },
    ],
  },
  vite: {
    define: {
      'process.env': 'import.meta.env'
    },
    ssr: {
      external: ["path", "url"],
      noExternal: ["slick-carousel", "jquery"],
    },
  },
  env: {
    schema: {
      RESEND_API_KEY: envField.string({
        context: "server",
        access: "secret",
        startsWith: "re_",
        optional: false,
      }),
      PUBLIC_R2_BUCKET_URL: envField.string({
        context: "client",
        access: "public",
        optional: true,
      }),
      R2_ACCOUNT_ID: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      R2_ACCESS_KEY_ID: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      R2_SECRET_ACCESS_KEY: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      R2_BUCKET_NAME: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      R2_ENDPOINT: envField.string({
        context: "server",
        access: "public",
        startsWith: "https://",
        optional: true,
      }),
      NODE_ENV: envField.string({
        context: "server",
        access: "public",
        optional: true,
      }),
    },
  },
  integrations: [
    icon(),
    mdx(),
    sitemap({
      filter: (page) => !page.includes("/rechtliches/"),
    }),
    react(),
    partytown(),
    tailwind({
      applyBaseStyles: false, // We'll handle this in our CSS
    }),
  ],
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
});
