// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  markdown: {
    shikiConfig: {
      themes: {
        light: 'slack-ochin',
        dark: 'slack-dark'
      },
      wrap: true
    }
  },
  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [mdx()],

  site: "https://penyland.github.io",
});