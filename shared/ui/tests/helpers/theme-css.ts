import { readFileSync } from 'node:fs'
import path from 'node:path'

/** A theme's colors by role name, such as { bg: '#1e1e2e' }. */
export type TRoles = Readonly<Record<string, string>>

// Jest runs this file as CommonJS, where __dirname is the way to find theme.css.
const css = readFileSync(path.resolve(__dirname, '../../theme.css'), 'utf8')

/**
 * Readers for theme.css. Static methods only.
 */
export class ThemeCssHelper {
  /**
   * Reads the `--color-*` declarations out of a block of CSS.
   * @param block - The text between the braces of a rule.
   * @returns The colors by role name, lower case.
   */
  static rolesIn(block: string): TRoles {
    return Object.fromEntries(
      [...block.matchAll(/--color-([\w-]+):\s*(#[\da-f]+);/gi)].map((match) => [
        match[1] ?? '',
        (match[2] ?? '').toLowerCase(),
      ]),
    )
  }

  /**
   * Finds the body of the first rule that starts with a selector.
   * @param selector - The text before the opening brace, such as ":root".
   * @param from - Where in the stylesheet to start looking.
   * @returns The text between that rule's braces.
   */
  static ruleBody(selector: string, from = 0): string {
    const start = css.indexOf(`${selector} {`, from)
    const end = css.indexOf('\n}', start)
    const body = css.slice(start + selector.length + 3, end)

    return body
  }
}

/** Mocha, the default `:root` block. */
export const mocha: TRoles = ThemeCssHelper.rolesIn(
  ThemeCssHelper.ruleBody(':root', css.indexOf('/* Mocha')),
)

/** Latte, the `:root` block inside the prefers-color-scheme: light media query. */
export const latte: TRoles = ThemeCssHelper.rolesIn(
  ThemeCssHelper.ruleBody('  :root', css.indexOf('@media (prefers-color-scheme: light)')),
)

/** The manual dark choice on the web. */
export const forcedDark: TRoles = ThemeCssHelper.rolesIn(
  ThemeCssHelper.ruleBody(":root[data-theme='dark']"),
)

/** The manual light choice on the web. */
export const forcedLight: TRoles = ThemeCssHelper.rolesIn(
  ThemeCssHelper.ruleBody(":root[data-theme='light']"),
)

/** The roles declared in the theme block, which is what Tailwind builds classes from. */
export const declared: TRoles = ThemeCssHelper.rolesIn(ThemeCssHelper.ruleBody('@theme'))
