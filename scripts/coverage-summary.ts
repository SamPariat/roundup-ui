// Prints a Markdown table of line coverage per package. CI appends it to the job summary.
import { existsSync, readFileSync } from 'node:fs'

const packages = ['apps/app', 'apps/server', 'shared/i18n', 'shared/tokens', 'shared/ui']

/** Line coverage numbers. */
interface LineCoverage {
  /** Lines run by tests. */
  covered: number
  /** Percent covered. */
  pct: number
  /** Lines that count. */
  total: number
}

/** Coverage totals for a package. */
interface Totals {
  /** Line coverage. */
  lines: LineCoverage
}

/** The part of Jest's coverage-summary.json that is read. */
interface Summary {
  /** Totals across all files. */
  total: Totals
}

console.log('| Package | Lines | Covered |')
console.log('| --- | --- | --- |')

for (const name of packages) {
  const file = `${name}/coverage/coverage-summary.json`

  if (!existsSync(file)) continue
  const { lines } = (JSON.parse(readFileSync(file, 'utf8')) as Summary).total

  console.log(
    `| \`${name}\` | ${String(lines.pct)}% | ${String(lines.covered)}/${String(lines.total)} |`,
  )
}
