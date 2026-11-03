// The one environment variable this package reads. Expo inlines EXPO_PUBLIC_* at build time, but
// only for the literal `process.env.EXPO_PUBLIC_API_URL`, so it cannot be read through a helper.
declare namespace NodeJS {
  /** The environment variables the API client reads. */
  interface ProcessEnv {
    /** Base URL of the Roundup API, without a trailing slash. */
    EXPO_PUBLIC_API_URL: string
  }
}
