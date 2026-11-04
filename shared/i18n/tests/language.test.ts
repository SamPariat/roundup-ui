import { Language } from '../src/language'

describe('Language.resolve', () => {
  it('uses a language we ship', () => {
    expect(Language.resolve(['en'])).toBe('en')
  })

  it('takes the first shipped language in the person order of preference', () => {
    expect(Language.resolve(['fr', 'en', 'de'])).toBe('en')
  })

  it('falls back to English for unknown or missing languages', () => {
    expect(Language.resolve(['fr', null])).toBe('en')
    expect(Language.resolve([])).toBe('en')
  })
})
