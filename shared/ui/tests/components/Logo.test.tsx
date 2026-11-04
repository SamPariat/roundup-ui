import AsyncStorage from '@react-native-async-storage/async-storage'
import { screen, waitFor } from '@testing-library/react-native'
import { readFileSync } from 'node:fs'
import path from 'node:path'

import { Logo } from '../../src/components/Logo'
import { THEME_STORAGE_KEY } from '../../src/theme/theme'
import { RenderHelper } from '../helpers/render'
import { latte, mocha } from '../helpers/theme-css'

// Jest picks svg.native.ts, whose styled() wrapper hands the class to react-native-css, and that
// has no compiled stylesheet under Jest. The web version passes the class straight through, so
// these tests can see which class the artwork was given; the native color mapping itself is
// checked on a simulator.
jest.mock('../../src/lib/svg', () => jest.requireActual<object>('../../src/lib/svg.ts'))

// Jest runs this file as CommonJS, where __dirname is the way to find the repo's assets folder.

const LOGO_DIR = path.resolve(__dirname, '../../../../assets/svg/logo')

const ILLUSTRATION_DIR = path.resolve(__dirname, '../../../../assets/svg/illustrations')

const THEMES = [
  { variant: 'dark', roles: mocha },
  { variant: 'light', roles: latte },
] as const

const BRAND_ROLES = ['logo-stem', 'logo-bowl', 'logo-leg'] as const

describe('Logo artwork files', () => {
  it.each(THEMES)('draws the $variant mark in the logo role colors', ({ roles, variant }) => {
    expect(LogoTestHelper.fillsOf(LogoTestHelper.svg(LOGO_DIR, `mark-${variant}`))).toEqual(
      BRAND_ROLES.map((role) => roles[role] ?? ''),
    )
  })

  it.each(THEMES)('draws the $variant wordmark in the text color', ({ roles, variant }) => {
    expect(LogoTestHelper.fillsOf(LogoTestHelper.svg(LOGO_DIR, `wordmark-${variant}`))).toEqual([
      roles['fg'],
    ])
  })

  it.each(THEMES)('draws the $variant lockup from both', ({ roles, variant }) => {
    expect(LogoTestHelper.fillsOf(LogoTestHelper.svg(LOGO_DIR, `lockup-${variant}`))).toEqual([
      ...BRAND_ROLES.map((role) => roles[role] ?? ''),
      roles['fg'],
    ])
  })

  it.each(THEMES)(
    'draws the $variant welcome art in the logo role colors',
    ({ roles, variant }) => {
      const [stem, bowl, leg, dots] = LogoTestHelper.fillsOf(
        LogoTestHelper.svg(ILLUSTRATION_DIR, `welcome-${variant}`),
      )

      expect([stem, bowl, leg, dots]).toEqual([
        roles['logo-stem'],
        roles['logo-bowl'],
        roles['logo-leg'],
        roles['logo-bowl'],
      ])
    },
  )

  it.each(['mark', 'wordmark', 'lockup'])('lets the mono %s follow the text color', (type) => {
    expect(new Set(LogoTestHelper.fillsOf(LogoTestHelper.svg(LOGO_DIR, `${type}-mono`)))).toEqual(
      new Set(['currentcolor']),
    )
  })

  it.each(['mark', 'wordmark', 'lockup'])('outlines the %s, with no live text', (type) => {
    for (const variant of ['dark', 'light', 'mono']) {
      expect(LogoTestHelper.svg(LOGO_DIR, `${type}-${variant}`)).not.toContain('<text')
    }
  })
})

// react-native-svg's own default fill on the group that wraps the artwork.
const BLACK = '#000000'

/** The shape of screen.toJSON() nodes that these tests read. */
interface IJsonNode {
  /** The host component name, such as RNSVGPath. */
  type: string
  /** The props that the tests look at. */
  props: IJsonProps
  /** Child nodes, or null for a leaf. */
  children: IJsonNode[] | null
}

/** The props of a JsonNode that the tests read. */
interface IJsonProps {
  /** Whether assistive technology skips the node. */
  'aria-hidden'?: boolean
  /** The classes that set the currentColor for the artwork inside. */
  className?: string
  /** A packed fill color. */
  fill?: IFill
  /** Rendered height. */
  height?: number
  /** Rendered width. */
  width?: number
}

/** react-native-svg's processed color. */
interface IFill {
  /** The color packed as ARGB. */
  payload?: number
}

/**
 * Logo test helpers. Static methods only.
 */
class LogoTestHelper {
  /**
   * Reads an SVG file.
   * @param directory - The folder under assets/svg.
   * @param file - The file name without its extension.
   * @returns The SVG source.
   */
  static svg(directory: string, file: string): string {
    return readFileSync(path.join(directory, `${file}.svg`), 'utf8')
  }

  /**
   * Collects the fill colors of an SVG source, in document order.
   * @param source - The SVG text.
   * @returns Lowercase fill values, such as "#cba6f7" or "currentcolor".
   */
  static fillsOf(source: string): string[] {
    return [...source.matchAll(/\sfill="([^"]+)"/g)].map((match) => (match[1] ?? '').toLowerCase())
  }

  /**
   * Lists the fill colors that reached the rendered artwork.
   * @returns Lowercase hex colors.
   */
  static renderedFills(): string[] {
    return LogoTestHelper.collect()
      .map((node) => node.props.fill)
      .flatMap((fill) =>
        typeof fill?.payload === 'number' ? [LogoTestHelper.hexOf(fill.payload)] : [],
      )
  }

  /**
   * Lists every node of the rendered screen.
   * @returns All nodes, depth first.
   */
  static collect(): IJsonNode[] {
    return LogoTestHelper.flatten(
      [screen.toJSON() as unknown as IJsonNode | IJsonNode[] | null]
        .flat()
        .filter((node) => node !== null),
    )
  }

  /**
   * Lists a node and everything below it.
   * @param nodes - Sibling nodes.
   * @returns The nodes and all their descendants, depth first.
   */
  private static flatten(nodes: IJsonNode[]): IJsonNode[] {
    return nodes.flatMap((node) => [node, ...LogoTestHelper.flatten(node.children ?? [])])
  }

  /**
   * Converts the ARGB number react-native-svg stores for a color back to #rrggbb.
   * @param argb - The packed color.
   * @returns The color as lowercase hex.
   */
  private static hexOf(argb: number): string {
    return `#${(argb % 0x1_00_00_00).toString(16).padStart(6, '0')}`
  }
}

describe('Logo', () => {
  beforeEach(async () => {
    await AsyncStorage.clear()
  })

  it('is announced as Roundup', async () => {
    await RenderHelper.withTheme(<Logo />)

    expect(screen.getByRole('image', { name: 'Roundup' })).toBeOnTheScreen()
  })

  it('can carry another name', async () => {
    await RenderHelper.withTheme(<Logo label="Roundup home" type="mark" />)

    expect(screen.getByRole('image', { name: 'Roundup home' })).toBeOnTheScreen()
  })

  it('hides the artwork from assistive technology', async () => {
    await RenderHelper.withTheme(<Logo />)

    const art = LogoTestHelper.collect().find((node) => node.type === 'RNSVGSvgView')

    expect(art?.props['aria-hidden']).toBe(true)
  })

  it.each([
    ['lockup', 'lockup-light'],
    ['wordmark', 'wordmark-light'],
  ] as const)('keeps the %s as wide as its file is', async (type, file) => {
    await RenderHelper.withTheme(<Logo size={48} type={type} />)

    const art = LogoTestHelper.collect().find((node) => node.type === 'RNSVGSvgView')

    const viewBox = (/viewBox="([^"]+)"/.exec(LogoTestHelper.svg(LOGO_DIR, file))?.[1] ?? '')
      .split(' ')
      .map(Number)

    const width = viewBox[2] ?? 0
    const height = viewBox[3] ?? 0

    expect((art?.props.width ?? 0) / (art?.props.height ?? 1)).toBeCloseTo(width / height, 2)
  })

  it('draws the light theme in Latte colors', async () => {
    await RenderHelper.withTheme(<Logo type="lockup" />)

    expect(new Set(LogoTestHelper.renderedFills())).toEqual(
      new Set([...BRAND_ROLES.map((role) => latte[role]), latte['fg'], BLACK]),
    )
  })

  it('draws the dark theme in Mocha colors', async () => {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, 'dark')
    await RenderHelper.withTheme(<Logo type="lockup" />)

    await waitFor(() => {
      expect(LogoTestHelper.renderedFills()).toContain(mocha['logo-stem'])
    })

    expect(new Set(LogoTestHelper.renderedFills())).toEqual(
      new Set([...BRAND_ROLES.map((role) => mocha[role]), mocha['fg'], BLACK]),
    )
  })

  it('tints the mono artwork with the text color class', async () => {
    await RenderHelper.withTheme(<Logo tone="mono" type="mark" />)

    const art = LogoTestHelper.collect().find((node) => node.type === 'RNSVGSvgView')

    expect(art?.props.className).toBe('text-fg')
  })
})
