import { defineConfig } from 'vite';
import { extensions, classicEmberSupport, ember } from '@embroider/vite';
import { babel } from '@rollup/plugin-babel';
import { fileURLToPath } from 'node:url';

const legacyEmberModule = fileURLToPath(
  new URL('./app/compat/legacy-ember.js', import.meta.url),
);

export default defineConfig({
  resolve: {
    alias: [{ find: /^ember$/, replacement: legacyEmberModule }],
  },
  plugins: [
    classicEmberSupport(),
    ember(),
    // extra plugins here
    babel({
      babelHelpers: 'runtime',
      extensions,
    }),
  ],
});
