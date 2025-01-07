import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'src/chrome/manifest.json',
          dest: './', // Copies to the root of the dist folder
        },
      ],
    }),
  ],
  build: {
    outDir: '../chromeextensions/dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: 'src/main.tsx',
        background: 'src/chrome/background.ts',
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
});
