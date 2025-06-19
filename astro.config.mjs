// @ts-check
import { defineConfig, envField } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";

import cloudflare from "@astrojs/cloudflare";

import partytown from "@astrojs/partytown";

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
      "process.env": "import.meta.env",
    },
    plugins: [tailwindcss()],
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
        optional: false,
      }),
      R2_ACCOUNT_ID: envField.string({
        context: "server",
        access: "secret",
        optional: false,
      }),
      R2_ACCESS_KEY_ID: envField.string({
        context: "server",
        access: "secret",
        optional: false,
      }),
      R2_SECRET_ACCESS_KEY: envField.string({
        context: "server",
        access: "secret",
        optional: false,
      }),
      R2_BUCKET_NAME: envField.string({
        context: "server",
        access: "secret",
        optional: false,
      }),
      R2_ENDPOINT: envField.string({
        context: "server",
        access: "public",
        startsWith: "https://",
        optional: false,
      }),
      NODE_ENV: envField.string({
        context: "server",
        access: "public",
        optional: false,
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
  ],
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
});
