/// <reference types="vite-electron-plugin/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    VSCODE_DEBUG?: 'true';
    DIST_ELECTRON: string;
    DIST: string;
    /** /dist/ or /public/ */
    PUBLIC: string;
  }
}

// Used in Renderer process, expose in `preload.ts`
interface Window {
  ipcRenderer: import('electron').IpcRenderer;
}
