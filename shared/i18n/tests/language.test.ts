import { resolveLanguage } from '../src/language.ts'

describe('resolveLanguage', () => {
  it('uses a language we ship', () => {
    expect(resolveLanguage(['en'])).toBe('en')
  })

  it('takes the first shipped language in the person order of preference', () => {
    expect(resolveLanguage(['fr', 'en', 'de'])).toBe('en')
  })

  it('falls back to English for unknown or missing languages', () => {
    expect(resolveLanguage(['fr', null])).toBe('en')
    expect(resolveLanguage([])).toBe('en')
  })
})
