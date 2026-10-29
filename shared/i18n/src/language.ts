/** The languages the app ships strings for. */
export const SUPPORTED_LANGUAGES = ['en'] as const

/** One of the shipped languages. */
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

/** The language used when the device offers none we ship. */
export const FALLBACK_LANGUAGE: SupportedLanguage = 'en'

/**
 * Picks the first device language we ship, in the person's order of preference, else English.
 * @param deviceLanguages - Language codes from the device, most preferred first.
 * @returns The language to use.
 */
export const resolveLanguage = (deviceLanguages: readonly (null | string)[]): SupportedLanguage => {
  for (const code of deviceLanguages) {
    const match = SUPPORTED_LANGUAGES.find((language) => language === code)

    if (match !== undefined) return match
  }

  return FALLBACK_LANGUAGE
}
