// src/env.d.ts
/// <reference types="astro/client" />

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