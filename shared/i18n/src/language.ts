export const SUPPORTED_LANGUAGES = ['en'] as const

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

export const FALLBACK_LANGUAGE: SupportedLanguage = 'en'

/** Picks the first device language we ship, in the person's order of preference, else English. */
export const resolveLanguage = (deviceLanguages: readonly (null | string)[]): SupportedLanguage => {
  for (const code of deviceLanguages) {
    const match = SUPPORTED_LANGUAGES.find((language) => language === code)

    if (match !== undefined) return match
  }

  return FALLBACK_LANGUAGE
}
