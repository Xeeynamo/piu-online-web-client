/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_AUTH_APP_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Inlined at build time from the PIU_WEB_SERVER GitHub Actions variable (see
// vite.config.ts). Empty string means "use the relative /api path".
declare const __PIU_WEB_SERVER__: string;
