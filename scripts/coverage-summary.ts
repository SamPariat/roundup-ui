// Prints a Markdown table of line coverage per package. CI appends it to the job summary.
import { existsSync, readFileSync } from 'node:fs'

const packages = ['apps/app', 'apps/server', 'shared/tokens', 'shared/ui']

interface Summary {
  total: { lines: { covered: number; pct: number; total: number } }
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
