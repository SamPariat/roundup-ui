import { GlassTint } from '../../src/lib/glass-tint'

describe('GlassTint', () => {
  it('adds the panel strength as an alpha channel', () => {
    expect(GlassTint.of('#313244')).toBe('#31324480')
  })

  it('takes a stronger alpha when asked', () => {
    expect(GlassTint.of('#cba6f7', 0.8)).toBe('#cba6f7cc')
  })

  it('leaves a color in any other form as it is', () => {
    expect(GlassTint.of('var(--color-bg-raised)')).toBe('var(--color-bg-raised)')
  })
})
