import type { en } from './locales/en.ts'

// Teaches i18next the shape of the English resources, so t('shell.tabs.squads') is checked and a
// misspelt or removed key fails the typecheck. Imported for its side effect by index.ts.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation'
    resources: { translation: typeof en }
  }
}
