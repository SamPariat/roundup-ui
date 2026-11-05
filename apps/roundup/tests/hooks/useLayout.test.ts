import { Layout } from '../../src/hooks/useLayout'

// 360 phone, 466 Duo folded, 626 Duo open portrait, 768 tablet, 890 Duo open landscape, 1024 and 1440 desktop.
describe('Layout.forWidth', () => {
  it.each([
    [360, 'bottom', 16],
    [466, 'bottom', 16],
    [626, 'bottom', 16],
    [768, 'bottom', 32],
    [890, 'bottom', 32],
    [1024, 'side', 32],
    [1440, 'side', 32],
  ] as const)('at %i wide uses the %s nav with a %i gutter', (width, nav, gutter) => {
    expect(Layout.forWidth(width)).toMatchObject({ nav, gutter })
  })

  it.each([360, 466, 626, 768, 890, 1024, 1440, 2560])(
    'never lets the content overflow a %i wide window',
    (width) => {
      const { contentWidth, gutter, nav } = Layout.forWidth(width)
      const sidebar = nav === 'side' ? 248 : 0

      expect(contentWidth).toBeGreaterThan(0)
      expect(contentWidth + gutter * 2).toBeLessThanOrEqual(width - sidebar)
    },
  )

  it('caps the content column at 1200', () => {
    expect(Layout.forWidth(2560).contentWidth).toBe(1200)
  })
})
