// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import mdx from '@astrojs/mdx';
import expressiveCode from 'astro-expressive-code';
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers'

// https://astro.build/config
export default defineConfig({
  markdown: {
    shikiConfig: {
      themes: {
        light: 'everforest-light',
        dark: 'slack-dark'
      },
      wrap: true
    }
  },
  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [
    expressiveCode({
      defaultProps: {
        frame: "code",
        wrap: true,
      },
      plugins: [pluginLineNumbers()],
      themes: ['nord', 'snazzy-light'],
      themeCssSelector: (theme) => {
        return '[data-theme="light"]';
      },
      styleOverrides: {
        codeFontFamily: 'Cascadia Code'
      },

    }),
    mdx()
  ],

  site: "https://penyland.github.io",
});