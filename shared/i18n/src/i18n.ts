import { getLocales } from 'expo-localization'
import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'

import { FALLBACK_LANGUAGE, resolveLanguage } from './language.ts'
import { en } from './locales/en.ts'

// A fresh instance, not the i18next singleton, so tests and tools can never leak state into it.
export const i18n = i18next.createInstance()

// Resources are bundled and init is synchronous (initAsync: false), so the first render already
// has its strings and there is no loading state or Suspense boundary to build.
void i18n.use(initReactI18next).init({
  resources: { en: { translation: en } },
  lng: resolveLanguage(getLocales().map((locale) => locale.languageCode)),
  fallbackLng: FALLBACK_LANGUAGE,
  initAsync: false,
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
})
