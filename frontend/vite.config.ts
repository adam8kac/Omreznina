import svgr from '@svgr/rollup';
import react from '@vitejs/plugin-react';
import fs from 'fs/promises';
import { resolve } from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // naloži .env datoteko glede na mode (development ali production)
  const env = loadEnv(mode, process.cwd());

  return {
    resolve: {
      alias: {
        src: resolve(__dirname, 'src'),
      },
    },
    esbuild: {
      loader: 'tsx',
      include: /src\/.*\.tsx?$/,
      exclude: [],
    },
    optimizeDeps: {
      esbuildOptions: {
        plugins: [
          {
            name: 'load-js-files-as-tsx',
            setup(build) {
              build.onLoad({ filter: /src\\.*\.js$/ }, async (args) => ({
                loader: 'tsx',
                contents: await fs.readFile(args.path, 'utf8'),
              }));
            },
          },
        ],
      },
    },
    plugins: [svgr(), react()],
    base: env.VITE_BASE_PATH || '/',
  };
});
