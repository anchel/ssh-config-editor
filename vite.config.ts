import { defineConfig } from 'vite'
import path from 'node:path'
import electron from 'vite-plugin-electron/simple'
import vue from '@vitejs/plugin-vue'
import {fileURLToPath, URL} from "node:url";
import pkg from './package.json'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    electron({
      main: {
        // Shortcut of `build.lib.entry`.
        entry: 'electron/main.ts',
        vite: {
          build: {
            rollupOptions: {
              // Some third-party Node.js libraries may not be built correctly by Vite, especially `C/C++` addons, 
              // we can use `external` to exclude them to ensure they work correctly.
              // Others need to put them in `dependencies` to ensure they are collected into `app.asar` after the app is built.
              // Of course, this is not absolute, just this way is relatively simple. :)
              external: Object.keys('dependencies' in pkg ? pkg.dependencies : {}),
            },
          },
        },
      },
      preload: {
        // Shortcut of `build.rollupOptions.input`.
        // Preload scripts may contain Web assets, so use the `build.rollupOptions.input` instead `build.lib.entry`.
        input: path.join(__dirname, 'electron/preload.ts'),
        vite: {
          build: {
            rollupOptions: {
              external: Object.keys('dependencies' in pkg ? pkg.dependencies : {}),
            },
          },
        },
      },
      // Ployfill the Electron and Node.js API for Renderer process.
      // If you want use Node.js in Renderer process, the `nodeIntegration` needs to be enabled in the Main process.
      // See 👉 https://github.com/electron-vite/vite-plugin-electron-renderer
      renderer: {},
    }),
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
