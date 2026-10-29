// Reads tokens.json and writes src/tokens.ts and src/theme.css. Run with `make tokens`.
// `--check` writes nothing and exits 1 when the committed files differ (the CI drift check).
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { format } from 'prettier'

import prettierConfig from '@roundup/config/prettier'

/** A value that is either the same in both themes or given per theme. */
type Themed = Record<ThemeId, string> | string
/** The two themes: Mocha is dark, Latte is light. */
type ThemeId = 'latte' | 'mocha'

/** A colour in tokens.json. */
interface ColorToken {
  /** The token name, for example `bg` or `ctp-mauve`. */
  name: string
  /** Its value, possibly a `{reference}` to another token. */
  value: Themed
}
/** A text style in tokens.json. */
interface TextStyle {
  /** The style name, such as `body`. */
  name: string
  /** The size, in px. */
  fontSize: string
  /** The line height, in px. */
  lineHeight: string
  /** The weight, which picks the Onest family. */
  fontWeight: number
  /** Tracking in em. */
  letterSpacing?: string
}

/** A list of tokens, as tokens.json groups them. */
interface Section<T> {
  /** The tokens in order. */
  tokens: T[]
}

/** A token with a plain value, such as a spacing step. */
interface Named {
  /** The token name. */
  name: string
  /** Its value, as written in the file (for example "16px"). */
  value: string
}

/** A shadow, which differs by theme. */
interface Shadow {
  /** The token name. */
  name: string
  /** The CSS box-shadow for each theme. */
  value: Record<ThemeId, string>
}

/** A group of text styles. */
interface StyleGroup {
  /** The styles in the group. */
  styles: TextStyle[]
}

/** Text styles, which tokens.json files under named groups. */
interface Grouped {
  /** The groups in order. */
  groups: StyleGroup[]
}

/** The parts of tokens.json the generator reads. */
interface TokenFile {
  /** The colour tokens, primitives and roles. */
  color: Section<ColorToken>
  /** The text styles, in groups. */
  type: Grouped
  /** The spacing steps. */
  spacing: Section<Named>
  /** The corner radii. */
  radius: Section<Named>
  /** The fixed sizes and breakpoints. */
  size: Section<Named>
  /** The shadows, per theme. */
  shadow: Section<Shadow>
}

/**
 * Resolves a path relative to this script.
 * @param relative - A path relative to scripts/.
 * @returns The file URL.
 */
const here = (relative: string): URL => new URL(relative, import.meta.url)
const tokens = JSON.parse(readFileSync(here('../tokens.json'), 'utf8')) as TokenFile

const PRIMITIVE_PREFIXES = ['ctp-', 'dawn-']

/**
 * Tells primitives (ctp-*, dawn-*) from roles; only roles reach components.
 * @param name - The token name.
 * @returns True for a primitive.
 */
const isPrimitive = (name: string): boolean =>
  PRIMITIVE_PREFIXES.some((prefix) => name.startsWith(prefix))

const byName = new Map(tokens.color.tokens.map((token) => [token.name, token.value]))

/**
 * Follows `{reference}` chains to a literal colour for one theme.
 * @param value - A colour or a reference.
 * @param theme - Which theme to resolve for.
 * @returns The colour value.
 */
const resolve = (value: string, theme: ThemeId): string => {
  const reference = /^\{(.+)\}$/.exec(value)?.[1]

  if (reference === undefined) return value
  const target = byName.get(reference)

  if (target === undefined) throw new Error(`Unknown token reference {${reference}}`)

  return resolve(typeof target === 'string' ? target : target[theme], theme)
}

const roleTokens = tokens.color.tokens.filter((token) => !isPrimitive(token.name))

/**
 * Lists every role with its resolved colour for one theme.
 * @param theme - Which theme to resolve for.
 * @returns Name and colour pairs.
 */
const rolesFor = (theme: ThemeId): [string, string][] =>
  roleTokens.map((token) => [
    token.name,
    resolve(typeof token.value === 'string' ? token.value : token.value[theme], theme),
  ])

/**
 * Reads a CSS pixel length as a number.
 * @param value - A length such as "16px".
 * @returns The number of pixels.
 */
const px = (value: string): number => Number.parseFloat(value)

/**
 * React Native letter-spacing is in points, the design system writes em.
 * @param style - The text style.
 * @returns Points, with negative zero turned into zero.
 */
const letterSpacingPoints = (style: TextStyle): number => {
  if (style.letterSpacing === undefined) return 0
  const points = Math.round(Number.parseFloat(style.letterSpacing) * px(style.fontSize) * 100) / 100

  return points === 0 ? 0 : points
}

const FONT_FAMILIES: Record<number, string> = {
  400: 'Onest_400Regular',
  500: 'Onest_500Medium',
  600: 'Onest_600SemiBold',
  700: 'Onest_700Bold',
}

const TABULAR_STYLES = new Set(['otp', 'numeric'])

const textStyles = tokens.type.groups.flatMap((group) => group.styles)

/**
 * Maps a weight to the matching Onest family name, since React Native picks fonts by family.
 * @param weight - A numeric weight such as 600.
 * @returns The family name.
 */
const fontFamily = (weight: number): string => {
  const family = FONT_FAMILIES[weight]

  if (family === undefined) throw new Error(`No Onest family for weight ${String(weight)}`)

  return family
}

/**
 * Writes a string as a quoted literal.
 * @param value - The text to quote.
 * @returns The quoted text.
 */
const quote = (value: string): string => JSON.stringify(value)

/**
 * Writes name and value pairs as an object literal.
 * @param entries - Keys and string or number values.
 * @returns The object source.
 */
const objectOf = (entries: [string, number | string][]): string =>
  `{\n${entries
    .map(([key, value]) => `  ${quote(key)}: ${typeof value === 'number' ? value : quote(value)},`)
    .join('\n')}\n}`

const HEADER = `GENERATED by shared/tokens/scripts/generate.ts from tokens.json. Do not edit; run \`make tokens\`.`

/**
 * Builds the source of tokens.ts: role colours per theme, text styles, scales and shadows.
 * @returns The unformatted TypeScript source.
 */
const buildTs = (): string => {
  const roleNames = roleTokens.map((token) => token.name)
  const sizes = tokens.size.tokens.filter((token) => !token.name.startsWith('bp-'))
  const breakpoints = tokens.size.tokens.filter((token) => token.name.startsWith('bp-'))

  const styles = textStyles
    .map((style) => {
      const tabular = TABULAR_STYLES.has(style.name) ? `,\n    fontVariant: ['tabular-nums']` : ''

      return `  ${quote(style.name)}: {
    fontFamily: ${quote(fontFamily(style.fontWeight))},
    fontSize: ${px(style.fontSize)},
    lineHeight: ${px(style.lineHeight)},
    letterSpacing: ${letterSpacingPoints(style)}${tabular},
  },`
    })
    .join('\n')

  return `// ${HEADER}

export const roleNames = ${JSON.stringify(roleNames)} as const

export type RoleName = (typeof roleNames)[number]
export type Roles = Readonly<Record<RoleName, string>>
export type ThemeName = 'latte' | 'mocha'

export const mocha: Roles = ${objectOf(rolesFor('mocha'))}

export const latte: Roles = ${objectOf(rolesFor('latte'))}

export const themes: Readonly<Record<ThemeName, Roles>> = { latte, mocha }

export const textStyles = {
${styles}
} as const

export type TextStyleName = keyof typeof textStyles

export const spacing = ${objectOf(tokens.spacing.tokens.map((t) => [t.name, px(t.value)]))} as const

export const radius = ${objectOf(tokens.radius.tokens.map((t) => [t.name, px(t.value)]))} as const

export const sizes = ${objectOf(sizes.map((t) => [t.name, px(t.value)]))} as const

export const breakpoints = ${objectOf(breakpoints.map((t) => [t.name, px(t.value)]))} as const

export const shadows: Readonly<Record<ThemeName, Readonly<Record<string, string>>>> = {
  mocha: ${objectOf(tokens.shadow.tokens.map((t) => [t.name, t.value.mocha]))},
  latte: ${objectOf(tokens.shadow.tokens.map((t) => [t.name, t.value.latte]))},
}
`
}

/**
 * Writes the roles of one theme as CSS custom properties.
 * @param theme - Which theme to write.
 * @returns The declarations.
 */
const cssVariables = (theme: ThemeId): string =>
  rolesFor(theme)
    .map(([name, value]) => `  --color-${name}: ${value};`)
    .join('\n')

// Content width is the one size with no Tailwind class of its own. Every other spacing, size,
// radius and breakpoint token equals a default Tailwind step (see tokens.test.ts), so the theme
// does not repeat them and components use the default classes (h-12, rounded-xl, md:flex).
const CONTENT_WIDTH = tokens.size.tokens.find((t) => t.name === 'size-content')

/**
 * Builds the source of theme.css: the colour theme, the content width, both appearances and the type utilities.
 * @returns The unformatted CSS source.
 */
const buildCss = (): string => {
  if (CONTENT_WIDTH === undefined) throw new Error('tokens.json has no size-content')

  const types = textStyles
    .map((style) => {
      const tabular = TABULAR_STYLES.has(style.name) ? '\n  font-variant: tabular-nums;' : ''

      return `@utility type-${style.name} {
  font-family: ${fontFamily(style.fontWeight)};
  font-size: ${style.fontSize};
  line-height: ${style.lineHeight};
  letter-spacing: ${String(letterSpacingPoints(style))}px;${tabular}
}`
    })
    .join('\n\n')

  const families = Object.entries(FONT_FAMILIES)
    .map(([weight, family]) => `@utility font-onest-${weight} {\n  font-family: ${family};\n}`)
    .join('\n\n')

  return `/* ${HEADER}
 *
 * Only role names reach Tailwind. The ctp-* and dawn-* primitives are never in the theme,
 * so a component can use bg-accent but not bg-ctp-mauve. Mocha is the default; the app's
 * ThemeProvider overrides these variables for Latte (and for a manual Mocha choice).
 *
 * Spacing, sizing, radius, text, leading, shadow and breakpoint scales are Tailwind's own: they
 * are deliberately not reset here. Only the colour palette is replaced. */

@theme {
  --color-*: initial;
  --color-transparent: transparent;
${cssVariables('mocha')}

  /* The 1200px content column has no default max-w-* class. */
  --container-content: ${CONTENT_WIDTH.value};

  /* Reduced motion keeps the spinner turning, only slower. */
  --animate-spin-slow: spin 2.4s linear infinite;
}

:root {
${cssVariables('mocha')}
}

@media (prefers-color-scheme: light) {
  :root {
${cssVariables('latte')}
  }
}

${types}

${families}
`
}

/**
 * Formats generated source with the repo's Prettier settings, so the output is stable and diffable.
 * @param source - The unformatted source.
 * @param parser - Which language it is.
 * @returns The formatted source.
 */
const formatWith = async (source: string, parser: 'css' | 'typescript'): Promise<string> =>
  format(source, { ...prettierConfig, plugins: [], parser })

const outputs = [
  { file: here('../src/tokens.ts'), content: await formatWith(buildTs(), 'typescript') },
  { file: here('../src/theme.css'), content: await formatWith(buildCss(), 'css') },
]

/**
 * Reads a generated file, or returns an empty string when it does not exist yet.
 * @param file - The file to read.
 * @returns The file text.
 */
const readOrEmpty = (file: URL): string => {
  try {
    return readFileSync(file, 'utf8')
  } catch {
    return ''
  }
}

if (process.argv.includes('--check')) {
  const drifted = outputs.filter(
    ({ file }) => readOrEmpty(file) !== outputs.find((o) => o.file === file)?.content,
  )

  for (const { file } of drifted) console.error(`drift: ${fileURLToPath(file)}`)

  if (drifted.length > 0) {
    console.error('Generated tokens are out of date. Run: make tokens')
    process.exitCode = 1
  }

  console.log('tokens: up to date')
} else {
  for (const { file, content } of outputs) writeFileSync(file, content)
  console.log('tokens: wrote src/tokens.ts and src/theme.css')
}
