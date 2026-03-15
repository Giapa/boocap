/// <reference types="vite/client" />

import type { ElectronAPI } from "../shared/types/electron-api";

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export default component;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
