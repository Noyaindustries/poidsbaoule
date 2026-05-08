/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  /** Mot de passe pour débloquer /admin (une fois par session navigateur). */
  readonly VITE_ADMIN_ACCESS_PASSWORD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
