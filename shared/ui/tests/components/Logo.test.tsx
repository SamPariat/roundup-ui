import AsyncStorage from '@react-native-async-storage/async-storage'
import { screen, waitFor } from '@testing-library/react-native'
import { readFileSync } from 'node:fs'
import path from 'node:path'

import type { RoleName } from '@roundup/tokens'

import { latte, mocha } from '@roundup/tokens'

import { Logo } from '../../src/components/Logo.tsx'
import { THEME_STORAGE_KEY } from '../../src/theme/theme.tsx'
import { renderWithTheme } from '../helpers/render.tsx'

// Jest runs this file as CommonJS, where __dirname is the way to find the repo's assets folder.

const LOGO_DIR = path.resolve(__dirname, '../../../../assets/svg/logo')

const ILLUSTRATION_DIR = path.resolve(__dirname, '../../../../assets/svg/illustrations')

const svg = (directory: string, file: string): string =>
  readFileSync(path.join(directory, `${file}.svg`), 'utf8')

const fillsOf = (source: string): string[] =>
  [...source.matchAll(/\sfill="([^"]+)"/g)].map((match) => (match[1] ?? '').toLowerCase())

const THEMES = [
  { variant: 'dark', roles: mocha },
  { variant: 'light', roles: latte },
] as const

const BRAND_ROLES = ['logo-stem', 'logo-bowl', 'logo-leg'] as const satisfies RoleName[]

describe('Logo artwork files', () => {
  it.each(THEMES)('draws the $variant mark in the logo role colours', ({ roles, variant }) => {
    expect(fillsOf(svg(LOGO_DIR, `mark-${variant}`))).toEqual(
      BRAND_ROLES.map((role) => roles[role].toLowerCase()),
    )
  })

  it.each(THEMES)('draws the $variant wordmark in the text colour', ({ roles, variant }) => {
    expect(fillsOf(svg(LOGO_DIR, `wordmark-${variant}`))).toEqual([roles.fg.toLowerCase()])
  })

  it.each(THEMES)('draws the $variant lockup from both', ({ roles, variant }) => {
    expect(fillsOf(svg(LOGO_DIR, `lockup-${variant}`))).toEqual([
      ...BRAND_ROLES.map((role) => roles[role].toLowerCase()),
      roles.fg.toLowerCase(),
    ])
  })

  it.each(THEMES)(
    'draws the $variant welcome art in the logo role colours',
    ({ roles, variant }) => {
      const [stem, bowl, leg, dots] = fillsOf(svg(ILLUSTRATION_DIR, `welcome-${variant}`))

      expect([stem, bowl, leg, dots]).toEqual([
        roles['logo-stem'].toLowerCase(),
        roles['logo-bowl'].toLowerCase(),
        roles['logo-leg'].toLowerCase(),
        roles['logo-bowl'].toLowerCase(),
      ])
    },
  )

  it.each(['mark', 'wordmark', 'lockup'])('lets the mono %s follow the text colour', (type) => {
    expect(new Set(fillsOf(svg(LOGO_DIR, `${type}-mono`)))).toEqual(new Set(['currentcolor']))
  })

  it.each(['mark', 'wordmark', 'lockup'])('outlines the %s, with no live text', (type) => {
    for (const variant of ['dark', 'light', 'mono']) {
      expect(svg(LOGO_DIR, `${type}-${variant}`)).not.toContain('<text')
    }
  })
})

// react-native-svg's own default fill on the group that wraps the artwork.
const BLACK = '#000000'

const hexOf = (argb: number): string => `#${(argb % 0x1_00_00_00).toString(16).padStart(6, '0')}`

// The shape of screen.toJSON() nodes that these tests read.
interface JsonNode {
  type: string
  props: {
    'aria-hidden'?: boolean
    color?: string
    fill?: { payload?: number }
    height?: number
    width?: number
  }
  children: JsonNode[] | null
}

const flatten = (nodes: JsonNode[]): JsonNode[] =>
  nodes.flatMap((node) => [node, ...flatten(node.children ?? [])])

const collect = (): JsonNode[] =>
  flatten(
    [screen.toJSON() as unknown as JsonNode | JsonNode[] | null]
      .flat()
      .filter((node) => node !== null),
  )

const renderedFills = (): string[] =>
  collect()
    .map((node) => node.props.fill as undefined | { payload?: number })
    .flatMap((fill) => (typeof fill?.payload === 'number' ? [hexOf(fill.payload)] : []))

describe('Logo', () => {
  beforeEach(async () => {
    await AsyncStorage.clear()
  })

  it('is announced as Roundup', async () => {
    await renderWithTheme(<Logo />)

    expect(screen.getByRole('image', { name: 'Roundup' })).toBeOnTheScreen()
  })

  it('can carry another name', async () => {
    await renderWithTheme(<Logo label="Roundup home" type="mark" />)

    expect(screen.getByRole('image', { name: 'Roundup home' })).toBeOnTheScreen()
  })

  it.each(['lockup', 'mark', 'wordmark'] as const)('draws the %s', async (type) => {
    await renderWithTheme(<Logo size="lg" tone="mono" type={type} />)

    expect(screen.getByRole('image')).toBeOnTheScreen()
  })

  it('hides the artwork from assistive technology', async () => {
    await renderWithTheme(<Logo />)

    const art = collect().find((node) => node.type === 'RNSVGSvgView')

    expect(art?.props['aria-hidden']).toBe(true)
  })

  it.each([
    ['lockup', 'lockup-light'],
    ['wordmark', 'wordmark-light'],
  ] as const)('keeps the %s as wide as its file is', async (type, file) => {
    await renderWithTheme(<Logo size={48} type={type} />)

    const art = collect().find((node) => node.type === 'RNSVGSvgView')

    const viewBox = (/viewBox="([^"]+)"/.exec(svg(LOGO_DIR, file))?.[1] ?? '')
      .split(' ')
      .map(Number)

    const width = viewBox[2] ?? 0
    const height = viewBox[3] ?? 0

    expect((art?.props.width ?? 0) / (art?.props.height ?? 1)).toBeCloseTo(width / height, 2)
  })

  it('draws the light theme in Latte colours', async () => {
    await renderWithTheme(<Logo type="lockup" />)

    expect(new Set(renderedFills())).toEqual(
      new Set([...BRAND_ROLES.map((role) => latte[role]), latte.fg, BLACK]),
    )
  })

  it('draws the dark theme in Mocha colours', async () => {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, 'dark')
    await renderWithTheme(<Logo type="lockup" />)

    await waitFor(() => {
      expect(renderedFills()).toContain(mocha['logo-stem'])
    })

    expect(new Set(renderedFills())).toEqual(
      new Set([...BRAND_ROLES.map((role) => mocha[role]), mocha.fg, BLACK]),
    )
  })

  it('follows the text colour in mono', async () => {
    await renderWithTheme(<Logo tone="mono" type="mark" />)

    const art = collect().find((node) => node.type === 'RNSVGSvgView')

    expect(art?.props.color).toBe(latte.fg)
  })
})
