import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

import { en, i18n } from '../../src/index.ts'

// Jest runs this file as CommonJS, where __dirname is the way to find the repo root.

const repoRoot = path.resolve(__dirname, '../../../..')
const SOURCE_ROOTS = ['apps/app/src', 'shared/ui/src']

/**
 * Lists the TypeScript files under a folder, recursively.
 * @param directory - The folder to walk.
 * @returns Absolute file paths.
 */
const sourceFiles = (directory: string): string[] =>
  readdirSync(directory).flatMap((entry) => {
    const file = path.join(directory, entry)

    if (statSync(file).isDirectory()) return sourceFiles(file)

    return /\.(?:ts|tsx)$/.test(file) ? [file] : []
  })

/**
 * Flattens nested resources into dotted keys and their values.
 * @param value - The resources, or a branch of them.
 * @param prefix - The dotted path to this branch.
 * @returns Key and value pairs for every leaf.
 */
const leaves = (value: unknown, prefix = ''): [string, unknown][] => {
  if (typeof value !== 'object' || value === null) return [[prefix, value]]

  return Object.entries(value).flatMap(([key, child]) =>
    leaves(child, prefix === '' ? key : `${prefix}.${key}`),
  )
}

// t('a.b') calls written with a plain string key, as opposed to a template with ${...} in it.
const T_CALL = /\bt\(\s*(['"`])([\w.${}-]+)\1/g

const usedKeys = SOURCE_ROOTS.flatMap((root) => sourceFiles(path.join(repoRoot, root))).flatMap(
  (file) => [...readFileSync(file, 'utf8').matchAll(T_CALL)].map((match) => match[2] ?? ''),
)

const uniqueKeys = [...new Set(usedKeys)]
const staticKeys = uniqueKeys.filter((key) => !key.includes('${'))
const dynamicKeys = uniqueKeys.filter((key) => key.includes('${'))

describe('English resources', () => {
  it('has no empty strings', () => {
    const empty = leaves(en)
      .filter(([, text]) => typeof text !== 'string' || text.trim() === '')
      .map(([key]) => key)

    expect(empty).toEqual([])
  })

  it('finds the keys the sources use', () => {
    expect(usedKeys.length).toBeGreaterThan(10)
  })

  it.each(staticKeys)('defines %s', (key) => {
    expect(i18n.exists(key, { count: 2 })).toBe(true)
  })

  // A dynamic key such as nav.tabs.${id}: its parent must be a group with children.
  it.each(dynamicKeys)('defines the group behind %s', (key) => {
    const parent = key.slice(0, key.indexOf('${') - 1)

    expect(leaves(i18n.getResource('en', 'translation', parent)).length).toBeGreaterThan(0)
  })
})
