// Every EXPO_PUBLIC_* key the app reads. A typo anywhere else fails to compile.
declare namespace NodeJS {
  /** The environment variables the app and its config read. */
  interface ProcessEnv {
    /** beta or prod; app.config.ts validates it. */
    APP_ENV?: string
    /** Base URL of the Roundup API; src/config/env.ts validates it. */
    EXPO_PUBLIC_API_URL?: string
  }
}

// Stylesheets are handled by Metro, not TypeScript.
declare module '*.css'
