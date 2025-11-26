// src/env.d.ts
/// <reference types="astro/client" />

interface ImportMetaEnv {
  // Server-side R2 configuration
  readonly R2_ACCOUNT_ID?: string;
  readonly R2_ACCESS_KEY_ID?: string;
  readonly R2_SECRET_ACCESS_KEY?: string;
  readonly R2_BUCKET_NAME?: string;
  readonly R2_ENDPOINT?: string;
  
  // Public R2 URL
  readonly PUBLIC_R2_BUCKET_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface SnipcartSettings {
    publicApiKey: string;
    loadStrategy: string;
    version: string; // Non-optional since it's assigned a default value
    timeoutDuration?: number;
    domain?: string;
    protocol?: string;
    loadCSS?: boolean;
    addProductBehavior?: string;
    modalStyle?: string;
    currency?: string;
    templatesUrl?: string;
  }
  
  interface Window {
    SnipcartSettings: SnipcartSettings;
    LoadSnipcart: () => void;
  }