declare module 'klaro' {
  export interface KlaroConfig {
    elementID?: string;
    storageMethod?: string;
    cookieName?: string;
    cookieExpiresAfterDays?: number;
    default?: boolean;
    mustConsent?: boolean;
    acceptAll?: boolean;
    hideDeclineAll?: boolean;
    hideLearnMore?: boolean;
    noticeAsModal?: boolean;
    disablePoweredBy?: boolean;
    lang?: string;
    translations?: any;
    services?: any[];
    [key: string]: any;
  }

  export function setup(config: any): void;
  export function show(config?: any, modal?: boolean): void;
}

declare module 'klaro/dist/klaro.css';
