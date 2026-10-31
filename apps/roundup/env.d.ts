// Every environment variable the app and its config read. A typo anywhere else fails to compile.
declare namespace NodeJS {
  /** The environment variables the app and its config read. */
  interface ProcessEnv {
    /** beta or prod; app.config.ts validates it. */
    APP_ENV: string
    /** Base URL of the Roundup API, without a trailing slash. Expo inlines it at build time. */
    EXPO_PUBLIC_API_URL: string
  }
}

// Stylesheets are handled by Metro, not TypeScript.
declare module '*.css'
