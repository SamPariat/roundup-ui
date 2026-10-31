import type { en } from './locales/en.ts'

// Teaches i18next the shape of the English resources, so t('shell.tabs.squads') is checked and a
// misspelt or removed key fails the typecheck. Imported for its side effect by index.ts.
/** The resources i18next should type-check against. */
interface Resources {
  /** The only namespace: every string the client shows. */
  translation: typeof en
}

declare module 'i18next' {
  /** i18next's extension point, which this file fills in with the shape of the English resources. */
  interface CustomTypeOptions {
    /** The one namespace the resources use. */
    defaultNS: 'translation'
    /** The typed resources, which make t() keys checked. */
    resources: Resources
  }
}
