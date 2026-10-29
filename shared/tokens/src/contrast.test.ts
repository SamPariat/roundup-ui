import { contrastRatio } from './contrast.ts'

describe('contrastRatio', () => {
  it('is 21 for black on white', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1)
  })

  it('is symmetric', () => {
    expect(contrastRatio('#1e1e2e', '#cdd6f4')).toBeCloseTo(contrastRatio('#cdd6f4', '#1e1e2e'), 5)
  })
})
