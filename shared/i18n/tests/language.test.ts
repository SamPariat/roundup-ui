import { LanguageHelper } from '../src/language'

describe('LanguageHelper.resolve', () => {
  it('uses a language we ship', () => {
    expect(LanguageHelper.resolve(['en'])).toBe('en')
  })

  it('takes the first shipped language in the person order of preference', () => {
    expect(LanguageHelper.resolve(['fr', 'en', 'de'])).toBe('en')
  })

  it('falls back to English for unknown or missing languages', () => {
    expect(LanguageHelper.resolve(['fr', null])).toBe('en')
    expect(LanguageHelper.resolve([])).toBe('en')
  })
})
