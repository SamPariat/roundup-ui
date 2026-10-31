import { readFileSync } from 'node:fs'
import path from 'node:path'

/** A theme's colours by role name, such as { bg: '#1e1e2e' }. */
export type Roles = Readonly<Record<string, string>>

// Jest runs this file as CommonJS, where __dirname is the way to find theme.css.
const css = readFileSync(path.resolve(__dirname, '../../theme.css'), 'utf8')

/**
 * Reads the `--color-*` declarations out of a block of CSS.
 * @param block - The text between the braces of a rule.
 * @returns The colours by role name, lower case.
 */
const rolesIn = (block: string): Roles =>
  Object.fromEntries(
    [...block.matchAll(/--color-([\w-]+):\s*(#[\da-f]+);/gi)].map((match) => [
      match[1] ?? '',
      (match[2] ?? '').toLowerCase(),
    ]),
  )

/**
 * Finds the body of the first rule that starts with a selector.
 * @param selector - The text before the opening brace, such as ":root".
 * @param from - Where in the stylesheet to start looking.
 * @returns The text between that rule's braces.
 */
const ruleBody = (selector: string, from = 0): string => {
  const start = css.indexOf(`${selector} {`, from)
  const end = css.indexOf('\n}', start)
  const body = css.slice(start + selector.length + 3, end)

  return body
}

/** Mocha, the default `:root` block. */
export const mocha: Roles = rolesIn(ruleBody(':root', css.indexOf('/* Mocha')))

/** Latte, the `:root` block inside the prefers-color-scheme: light media query. */
export const latte: Roles = rolesIn(
  ruleBody('  :root', css.indexOf('@media (prefers-color-scheme: light)')),
)

/** The manual dark choice on the web. */
export const forcedDark: Roles = rolesIn(ruleBody(":root[data-theme='dark']"))

/** The manual light choice on the web. */
export const forcedLight: Roles = rolesIn(ruleBody(":root[data-theme='light']"))

/** The roles declared in the theme block, which is what Tailwind builds classes from. */
export const declared: Roles = rolesIn(ruleBody('@theme'))
