/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  /** Mot de passe pour débloquer /admin (une fois par session navigateur). */
  readonly VITE_ADMIN_ACCESS_PASSWORD?: string;
  /** Numéro marchand affiché à la caisse (mobile money) — ex. `01 52 59 35 36`. */
  readonly VITE_PAYMENT_MERCHANT_PHONE_DISPLAY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
