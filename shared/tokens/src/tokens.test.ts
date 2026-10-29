import type { RoleName, ThemeName } from './tokens.ts'

import { contrastRatio } from './contrast.ts'
import {
  breakpoints,
  latte,
  mocha,
  roleNames,
  shadows,
  sizes,
  textStyles,
  themes,
} from './tokens.ts'

const TEXT = 4.5
const GRAPHIC = 3

type Pair = [foreground: RoleName, background: RoleName, floor: number]

// Every pair from the design system's Accessibility section. fg-subtle is placeholder and
// disabled text, which WCAG exempts, so it only has to stay readable.
const pairs: Pair[] = [
  ['fg', 'bg', TEXT],
  ['fg', 'bg-raised', TEXT],
  ['fg', 'bg-sunken', TEXT],
  ['fg-muted', 'bg', TEXT],
  ['fg-muted', 'bg-raised', TEXT],
  ['fg-muted', 'bg-sunken', TEXT],
  ['fg-subtle', 'bg', 4],
  ['fg-subtle', 'bg-raised', 4],
  ['on-accent', 'accent', TEXT],
  ['on-highlight', 'highlight', TEXT],
  ['accent', 'bg', TEXT],
  ['accent', 'bg-raised', TEXT],
  ['accent', 'bg-sunken', GRAPHIC],
  ['danger', 'bg', TEXT],
  ['danger', 'bg-raised', TEXT],
  ['highlight', 'bg-raised', GRAPHIC],
  ['success', 'bg-raised', GRAPHIC],
  ['warning', 'bg-raised', GRAPHIC],
  ['info', 'bg-raised', GRAPHIC],
  ['border-strong', 'bg', GRAPHIC],
  ['border-strong', 'bg-raised', GRAPHIC],
  ['focus-ring', 'bg', GRAPHIC],
  ['focus-ring', 'bg-raised', GRAPHIC],
]

// The design system flags these Latte pairs as below their floor. Components only use the
// colours as dots, icons and tints (never as text), so they stay as known exceptions.
const knownLatteExceptions = new Set([
  'on-highlight/highlight',
  'highlight/bg-raised',
  'warning/bg-raised',
])

const themeNames: ThemeName[] = ['mocha', 'latte']

describe('roles', () => {
  it.each(themeNames)('defines every role in %s', (theme) => {
    expect(Object.keys(themes[theme]).toSorted()).toEqual(roleNames.toSorted())
  })

  it('only holds colour values', () => {
    for (const value of [...Object.values(mocha), ...Object.values(latte)]) {
      expect(value).toMatch(/^#[\da-f]{6}([\da-f]{2})?$/)
    }
  })

  it('never exposes a primitive as a role', () => {
    expect(roleNames.filter((name) => name.startsWith('ctp-') || name.startsWith('dawn-'))).toEqual(
      [],
    )
  })
})

describe('contrast', () => {
  const cases = themeNames.flatMap((theme) =>
    pairs.map(([foreground, background, floor]) => ({
      theme,
      foreground,
      background,
      floor,
      known: theme === 'latte' && knownLatteExceptions.has(`${foreground}/${background}`),
    })),
  )

  it.each(cases.filter(({ known }) => !known))(
    '$foreground on $background reaches $floor:1 in $theme',
    ({ theme, foreground, background, floor }) => {
      const roles = themes[theme]
      expect(contrastRatio(roles[foreground], roles[background])).toBeGreaterThanOrEqual(floor)
    },
  )

  it.each(cases.filter(({ known }) => known))(
    '$foreground on $background stays a known exception in $theme',
    ({ foreground, background, floor }) => {
      expect(contrastRatio(latte[foreground], latte[background])).toBeLessThan(floor)
    },
  )
})

describe('text styles', () => {
  it('converts em letter-spacing to points', () => {
    expect(textStyles.display.letterSpacing).toBeCloseTo(-0.96, 2)
  })

  it('uses one Onest family per weight', () => {
    expect(textStyles['body-strong'].fontFamily).toBe('Onest_600SemiBold')
    expect(textStyles.caption.fontFamily).toBe('Onest_500Medium')
  })

  it('turns on tabular figures for numbers only', () => {
    expect(textStyles.otp.fontVariant).toEqual(['tabular-nums'])
    expect(textStyles.numeric.fontVariant).toEqual(['tabular-nums'])
    expect('fontVariant' in textStyles.body).toBe(false)
  })
})

describe('layout tokens', () => {
  it('keeps the design system breakpoints', () => {
    expect(breakpoints).toEqual({ 'bp-tablet': 768, 'bp-desktop': 1024 })
  })

  it('keeps the tap target at 48', () => {
    expect(sizes['size-tap']).toBe(48)
  })

  it('has a sheet and a toast shadow in both themes', () => {
    for (const theme of themeNames) {
      expect(Object.keys(shadows[theme]).toSorted()).toEqual(['shadow-sheet', 'shadow-toast'])
    }
  })
})
