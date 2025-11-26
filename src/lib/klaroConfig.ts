// Klaro Cookie Consent Configuration
// @ts-nocheck
export const klaroConfig = {
  // You can customize the ID of the DIV element that Klaro will create
  // when starting up. If undefined, Klaro will use 'klaro'.
  elementID: 'klaro',

  // Setting this to true will keep Klaro from automatically loading itself
  // when the page is being loaded.
  noAutoLoad: true,

  // How Klaro should store the user's preferences. It can be either 'cookie'
  // (the default) or 'localStorage'.
  storageMethod: 'cookie',
 
  // You can customize the name of the cookie that Klaro uses for storing
  // user consent decisions. If undefined, Klaro will use 'klaro'.
  cookieName: 'klaro',

  // You can also set a custom expiration time for the Klaro cookie.
  // By default, it will expire after 120 days.
  cookieExpiresAfterDays: 365,

  // You can change to cookie domain for the consent manager itself.
  // Use this if you want to get consent once for multiple matching domains.
  // If undefined, Klaro will use the current domain.
  // cookieDomain: '.la-volotte.de',

  // Defines the default state for services (true=enabled by default).
  default: false,

  // If "mustConsent" is set to true, Klaro will directly display the consent
  // manager modal and not allow the user to close it before having actively
  // consented or declined the use of third-party services.
  mustConsent: false,

  // Show "accept all" to accept all services instead of "ok" that only accepts
  // required and "default: true" services
  acceptAll: true,

  // replace "decline" with cookie manager modal
  hideDeclineAll: false,

  // hide "learnMore" link
  hideLearnMore: false,

  // show cookie notice as modal
  noticeAsModal: false,

  // You can also remove the 'Realized with Klaro!' text in the consent modal.
  // Please don't do this! We provide Klaro as a free open source tool.
  // Placing a link to our website helps us spread the word about it,
  // which ultimately enables us to make Klaro! better for everyone.
  // So please be fair and keep the link enabled. Thanks :)
  disablePoweredBy: false,

  // you can specify an additional class (or classes) that will be added to the Klaro `div`
  additionalClass: 'klaro-custom',

  // You can define the UI language directly here. If undefined, Klaro will
  // use the value given in the global "lang" variable. If that does
  // not exist, it will use the value given in the "lang" attribute of your
  // HTML tag. If that also doesn't exist, it will use 'en'.
  lang: 'de',

  // You can overwrite existing translations and add translations for your
  // service descriptions and purposes. See `src/translations/` for a full
  // list of translations that can be overwritten:
  // https://github.com/KIProtect/klaro/tree/master/src/translations

  // Example config that shows how to overwrite translations:
  translations: {
    de: {
      consentModal: {
        title: 'Cookie-Einstellungen',
        description:
          'Wir verwenden Cookies und andere Tracking-Technologien, um Ihr Surferlebnis auf unserer Website zu verbessern, personalisierte Inhalte und gezielte Anzeigen anzuzeigen, unseren Website-Traffic zu analysieren und zu verstehen, woher unsere Besucher kommen.',
      },
      consentNotice: {
        title: 'Cookie-Einstellungen',
        description:
          'Wir verwenden Cookies und andere Tracking-Technologien, um Ihr Surferlebnis auf unserer Website zu verbessern. {learnMore}',
        learnMore: 'Cookie-Einstellungen verwalten',
      },
      googleTagManager: {
        description: 'Google Tag Manager ermöglicht es uns, verschiedene Tracking- und Marketing-Tools über eine zentrale Plattform zu verwalten.',
      },
      purposes: {
        analytics: 'Analyse',
        marketing: 'Marketing',
        functional: 'Funktional',
      },
    },
  },

  // This is a list of third-party services that Klaro will manage for you.
  services: [
    {
      // Each service should have a unique (and short) name.
      name: 'google-tag-manager',

      // If "default" is set to true, the service will be enabled by default
      // Overwrites global "default" setting.
      default: false,

      // The title of your service as listed in the consent modal.
      title: 'Google Tag Manager',

      // The purpose(s) of this service. Will be listed on the consent notice.
      // Do not forget to add translations for all purposes you list here.
      purposes: ['analytics', 'marketing'],

      // A list of regex expressions or strings giving the names of
      // cookies set by this service. If the user withdraws consent for a
      // given service, Klaro will then automatically delete all matching
      // cookies.
      cookies: [
        /^_ga/i, // Google Analytics
        /^_gid/i, // Google Analytics
        /^_gat/i, // Google Analytics
        '_gcl_au', // Google Analytics
      ],

      // If "required" is set to true, Klaro will not allow this service to
      // be disabled by the user.
      required: false,

      // If "optOut" is set to true, Klaro will load this service even before
      // the user gave explicit consent.
      // We recommend always leaving this "false".
      optOut: false,

      // If "onlyOnce" is set to true, the service will only be executed
      // once regardless how often the user toggles it on and off.
      onlyOnce: true,
    },
    {
      name: 'snipcart',
      title: 'Snipcart (E-Commerce)',
      purposes: ['functional'],
      required: true, // Shopping cart is essential
      default: true,
      cookies: [
        /^snipcart/i,
      ],
    },
  ],
};
