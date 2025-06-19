// @ts-check
import { defineConfig, envField } from "astro/config";
import icon from "astro-icon";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";
import partytown from "@astrojs/partytown";
import tailwindcss from "@tailwindcss/vite";

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
    plugins: [tailwindcss()],
    define: {
      global: 'globalThis',
      'process.env.NODE_ENV': '"production"'
    },
    ssr: {
      external: ["path", "url"],
      noExternal: ["slick-carousel", "jquery"],
    },
    resolve: {
      alias: {
        // Fix for MessageChannel issue in Workers
        'react-dom/server': 'react-dom/server.edge'
      }
    },
    build: {
      assetsInlineLimit: 0, // Don't inline assets
      rollupOptions: {
        output: {
          assetFileNames: '_astro/[name].[hash][extname]'
        }
      }
    }
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
    react({
      experimentalReactChildren: true,
    }),
    partytown(),
  ],
  adapter: cloudflare({
    imageService: "compile",
    mode: "advanced", // Use advanced mode for better asset handling
  }),
});
