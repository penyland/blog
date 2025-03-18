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
        showLineNumbers: false
      },
      plugins: [pluginLineNumbers()],
      themes: ['material-theme-palenight', 'material-theme-lighter'],
      themeCssSelector: (theme) => {
        return '[data-theme="light"]';
      },
      styleOverrides: {
        codeFontFamily: 'Cascadia Code',
      },

    }),
    mdx()
  ],

  site: "https://penyland.github.io",
});