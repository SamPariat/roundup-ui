// Fails when a tracked JavaScript file is not listed in .js-allowlist. The repo is TypeScript only.
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const allowlist = new Set(
  readFileSync('.js-allowlist', 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '' && !line.startsWith('#')),
)

// git is resolved from PATH on purpose: this runs on developer machines and CI runners, where its
// location differs, and the arguments are fixed.
const tracked = execFileSync(
  // eslint-disable-next-line sonarjs/no-os-command-from-path -- see the comment above
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
