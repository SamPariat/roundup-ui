import type { en } from './locales/en'

// Teaches i18next the shape of the English resources, so t('shell.tabs.squads') is checked and a
// misspelt or removed key fails the typecheck. Imported for its side effect by index.ts.
/** The resources i18next should type-check against. */
interface IResources {
  /** The only namespace: every string the client shows. */
  translation: typeof en
}

declare module 'i18next' {
  /** i18next's extension point, which this file fills in with the shape of the English resources. */
  // eslint-disable-next-line @typescript-eslint/naming-convention -- CustomTypeOptions is i18next's own interface name, extended here
  interface CustomTypeOptions {
    /** The one namespace the resources use. */
    defaultNS: 'translation'
    /** The typed resources, which make t() keys checked. */
    resources: IResources
  }
}
