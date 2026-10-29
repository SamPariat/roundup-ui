import { readFileSync } from 'node:fs'
import path from 'node:path'

import type { RoleName, ThemeName } from '../src/tokens.ts'

import { contrastRatio } from '../src/contrast.ts'
import {
  breakpoints,
  latte,
  mocha,
  radius,
  roleNames,
  shadows,
  sizes,
  spacing,
  textStyles,
  themes,
} from '../src/tokens.ts'

const TEXT = 4.5
const GRAPHIC = 3

/** A foreground, the background it sits on, and the lowest contrast ratio it may have. */
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

/**
 * Orders names alphabetically, for a stable comparison.
 * @param a - One name.
 * @param b - Another name.
 * @returns Negative, zero or positive, as Array.sort expects.
 */
const byName = (a: string, b: string): number => a.localeCompare(b)

const themeNames: ThemeName[] = ['mocha', 'latte']

describe('roles', () => {
  it.each(themeNames)('defines every role in %s', (theme) => {
    expect(Object.keys(themes[theme]).toSorted(byName)).toEqual(roleNames.toSorted(byName))
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
      expect(Object.keys(shadows[theme]).toSorted(byName)).toEqual(['shadow-sheet', 'shadow-toast'])
    }
  })
})

// The components use Tailwind's own classes (h-12, rounded-xl, md:flex), and the theme does not
// repeat them. These pin each token to the default step it stands for, so a changed token fails
// here instead of silently drifting from the classes.
describe('Tailwind default scale', () => {
  const STEP = 4

  it('keeps the spacing tokens on the 4px step (p-1 p-2 p-3 p-4 p-6 p-8 p-12)', () => {
    expect(Object.values(spacing)).toEqual([1, 2, 3, 4, 6, 8, 12].map((step) => step * STEP))
  })

  it('keeps the fixed sizes on the 4px step (h-12 h-14 h-18 w-90 w-62)', () => {
    expect(sizes['size-tap']).toBe(12 * STEP)
    expect(sizes['size-appbar']).toBe(14 * STEP)
    expect(sizes['size-nav']).toBe(18 * STEP)
    expect(sizes['size-frame']).toBe(90 * STEP)
    expect(sizes['size-sidenav']).toBe(62 * STEP)
    expect(sizes['size-reading']).toBe(160 * STEP)
  })

  it('matches the radius tokens to rounded-lg, xl, 2xl and 3xl', () => {
    expect([
      radius['radius-sm'],
      radius['radius-md'],
      radius['radius-lg'],
      radius['radius-xl'],
    ]).toEqual([8, 12, 16, 24])
  })

  it('matches the breakpoints to Tailwind md and lg', () => {
    expect([breakpoints['bp-tablet'], breakpoints['bp-desktop']]).toEqual([768, 1024])
  })
})

describe('theme.css', () => {
  // Jest runs this file as CommonJS, where __dirname is the way to find theme.css.

  const css = readFileSync(path.join(__dirname, '../src/theme.css'), 'utf8')

  it('resets only the colour palette', () => {
    expect(css).toContain('--color-*: initial;')

    expect(css).not.toMatch(
      /--(?:spacing|radius|breakpoint|text|leading|tracking|shadow|font|font-weight)-\*: initial/,
    )
  })

  it('adds the one size Tailwind has no class for', () => {
    expect(css).toContain('--container-content: 1200px;')
    expect(css).not.toContain('--spacing-')
    expect(css).not.toContain('--radius-')
    expect(css).not.toContain('--breakpoint-')
  })
})
