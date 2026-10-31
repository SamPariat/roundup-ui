// Checks the tracked files: no JavaScript outside .js-allowlist (the repo is TypeScript only), and
// every asset file is named in kebab-case (bookmark-filled.svg, not bookmarkFilled.svg), and every
// version in the pnpm catalog is exact. syncpack only sees package.json, where versions are `catalog:`,
// so the ranges it cannot see are caught here.
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const allowlist = new Set(
  readFileSync('.js-allowlist', 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '' && !line.startsWith('#')),
)

/**
 * Lists tracked and untracked-but-not-ignored files matching git pathspecs.
 * @param pathspecs - The patterns to pass to `git ls-files`.
 * @returns The matching paths.
 */
const listFiles = (pathspecs: readonly string[]): string[] =>
  // git is resolved from PATH on purpose: this runs on developer machines and CI runners, where its
  // location differs, and the arguments are fixed.
  // eslint-disable-next-line sonarjs/no-os-command-from-path -- see the comment above
  execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', ...pathspecs], {
    encoding: 'utf8',
  })
    .split('\n')
    .filter((file) => file !== '')

const KEBAB_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\.[a-z0-9]+)*$/

const scripts = listFiles(['*.js', '*.jsx', '*.mjs', '*.cjs']).filter(
  (file) => !allowlist.has(file),
)

// Everything under assets/svg, plus images and fonts anywhere. Licence and notes files in
// assets/brand keep their conventional names.
const badNames = listFiles(['assets/svg', '*.svg', '*.png', '*.jpg', '*.jpeg', '*.ttf', '*.woff2'])
  .filter((file) => !file.startsWith('node_modules/'))
  .filter((file) => !KEBAB_NAME.test(file.slice(file.lastIndexOf('/') + 1)))

if (scripts.length > 0) {
  console.error(
    'JavaScript files are not allowed. Write TypeScript, or list a one-line shim in .js-allowlist:',
  )

  for (const file of scripts) console.error(`  ${file}`)
}

if (badNames.length > 0) {
  console.error('Asset files must be kebab-case (lower-case words joined by hyphens):')

  for (const file of badNames) console.error(`  ${file}`)
}

const ranges = readFileSync('pnpm-workspace.yaml', 'utf8')
  .split('\n')
  .filter((line) => line.startsWith('  ') && !line.trimStart().startsWith('#'))
  .filter((line) =>
    /^['~^<>*]+|^latest/.test(line.slice(line.lastIndexOf(': ') + 2).replace("'", '')),
  )

if (ranges.length > 0) {
  console.error('Catalog versions must be exact (no ^, ~ or other ranges):')

  for (const line of ranges) console.error(`  ${line.trim()}`)
}

if (scripts.length > 0 || badNames.length > 0 || ranges.length > 0) process.exitCode = 1
else console.log('files: ok')
