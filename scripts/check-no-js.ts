// Fails when a tracked JavaScript file is not listed in .js-allowlist. The repo is TypeScript only.
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const allowlist = new Set(
  readFileSync('.js-allowlist', 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '' && !line.startsWith('#')),
)

const tracked = execFileSync(
  'git',
  ['ls-files', '--cached', '--others', '--exclude-standard', '*.js', '*.jsx', '*.mjs', '*.cjs'],
  {
    encoding: 'utf8',
  },
)
  .split('\n')
  .filter((file) => file !== '')

const offenders = tracked.filter((file) => !allowlist.has(file))

if (offenders.length > 0) {
  console.error(
    'JavaScript files are not allowed. Write TypeScript, or list a one-line shim in .js-allowlist:',
  )
  for (const file of offenders) console.error(`  ${file}`)
  process.exitCode = 1
}
console.log('no-js: ok')
