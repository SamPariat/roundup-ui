// Fails when a dependency in the pnpm catalog has a newer release it is allowed to take.
//
// expo-doctor and `expo install --check` only compare against the versions the installed `expo`
// bundles (bundledNativeModules.json) and the newest SDK patch of `expo` itself. They say nothing
// about eslint, jest, i18next and the rest, so this script covers both halves:
//   1. Expo-managed packages: the newest version SDK 58 allows (the bundled range, or the newest
//      58.x for the expo-versioned packages).
//   2. Every other catalog package: the newest stable release on npm.
// Newer versions that SDK 58 or a documented hold-back rules out are printed as info only.
// Usage: node scripts/check-updates.ts
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

/** Where a package gets its allowed version from. */
type Kind = 'bundled' | 'expo-family' | 'other'

/** One package with an update available. */
interface Row {
  /** The package name. */
  name: string
  /** The version pinned in the catalog. */
  current: string
  /** The newest version the package may take. */
  allowed: string
  /** The shell command that applies it. */
  command: string
}

/** A newer release that is deliberately not taken. */
interface Info {
  /** The package name. */
  name: string
  /** The version pinned in the catalog. */
  current: string
  /** The newer release that exists. */
  latest: string
  /** Why it is not taken. */
  reason: string
}

const REGISTRY = 'https://registry.npmjs.org'
const SDK_MAJOR = 58

// Newer releases that cannot be taken yet. Each needs a reason; delete the entry when it clears.
const HELD_BACK: Readonly<Record<string, string>> = {
  eslint: 'eslint-plugin-react-native and -a11y stop at ESLint 9',
  '@eslint/js': 'moves with eslint',
  nativewind: 'NativeWind 5 is a release candidate; the latest tag is the old 4.x line',
  'react-native-css': 'release candidate that NativeWind 5 needs',
  typescript: 'typescript-eslint supports TypeScript below 6.1 only',
  '@types/node': 'kept on the Node major in .nvmrc',
  jest: 'moves with jest-expo',
  'eslint-plugin-unicorn':
    'newer majors drop rule options this config sets (79 fails to load); upgrade with eslint 10',
}

// Resolved from apps/app, which depends on expo; a variable keeps knip from expecting expo at the root.
const BUNDLED_LIST = 'expo/bundledNativeModules.json'
const require = createRequire(new URL('../apps/app/package.json', import.meta.url))

const bundled = JSON.parse(readFileSync(require.resolve(BUNDLED_LIST), 'utf8')) as Record<
  string,
  string
>

/**
 * Reads name and version pairs from the `catalog:` block of pnpm-workspace.yaml.
 * @returns The pinned versions by package name.
 */
const readCatalog = (): Map<string, string> => {
  const lines = readFileSync(new URL('../pnpm-workspace.yaml', import.meta.url), 'utf8').split('\n')
  const start = lines.indexOf('catalog:')
  const catalog = new Map<string, string>()

  for (const line of lines.slice(start + 1)) {
    if (!line.startsWith('  ')) break
    if (line.trimStart().startsWith('#')) continue

    const cut = line.lastIndexOf(': ')

    catalog.set(
      line.slice(0, cut).trim().replaceAll("'", ''),
      line.slice(cut + 2).replaceAll("'", ''),
    )
  }

  return catalog
}

/**
 * Splits a plain version into numbers; a prerelease or build suffix makes it return undefined.
 * @param version - Text such as 58.0.22.
 * @returns Major, minor and patch, or undefined for anything else.
 */
const parse = (version: string): [number, number, number] | undefined => {
  const parts = version.split('.')

  if (parts.length !== 3 || !parts.every((part) => /^\d+$/.test(part))) return undefined

  return [Number(parts[0]), Number(parts[1]), Number(parts[2])]
}

/**
 * Orders two plain versions.
 * @param a - One version.
 * @param b - Another version.
 * @returns Negative when a is older, positive when newer, zero when equal.
 */
const compare = (a: string, b: string): number => {
  const [left, right] = [parse(a) ?? [0, 0, 0], parse(b) ?? [0, 0, 0]]

  for (const [index, value] of left.entries()) {
    const delta = value - (right[index] ?? 0)

    if (delta !== 0) return delta
  }

  return 0
}

/**
 * Whether a version is inside a ~, ^ or exact range.
 * @param version - The candidate.
 * @param range - Such as ~58.0.2, ^15.0.2 or 2.2.0.
 * @returns True when allowed.
 */
const inRange = (version: string, range: string): boolean => {
  const base = range.replace(/^[~^]/, '')
  const [v, r] = [parse(version), parse(base)]

  if (v === undefined || r === undefined) return false
  if (range.startsWith('~')) return v[0] === r[0] && v[1] === r[1] && compare(version, base) >= 0
  if (range.startsWith('^')) return v[0] === r[0] && compare(version, base) >= 0

  return version === base
}

/** What the registry knows about a package. */
interface Published {
  /** The `latest` dist-tag, which npm treats as the current release (some packages publish decoy higher versions). */
  latest: string
  /** Plain x.y.z versions, newest last. */
  versions: string[]
}

/** The part of npm's abbreviated package document that this script reads. */
interface PackageDocument {
  /** Named releases such as latest. */
  'dist-tags': Record<string, string | undefined>
  /** Every published version, keyed by number. */
  versions: Record<string, unknown>
}

/**
 * Reads the stable versions of a package and its latest tag.
 * @param name - The package name.
 * @returns The latest tag and every stable version.
 */
const fetchPublished = async (name: string): Promise<Published> => {
  const response = await fetch(`${REGISTRY}/${name.replace('/', '%2F')}`, {
    headers: { Accept: 'application/vnd.npm.install-v1+json' },
  })

  if (!response.ok) throw new Error(`${name}: registry answered ${String(response.status)}`)

  const body = (await response.json()) as PackageDocument

  return {
    latest: body['dist-tags']['latest'] ?? '',
    versions: Object.keys(body.versions)
      .filter((version) => parse(version) !== undefined)
      .toSorted(compare),
  }
}

/**
 * Chooses where a package's allowed version comes from.
 * @param name - The package name.
 * @param current - The pinned version.
 * @returns Where the allowed version comes from: Expo's bundled list, the expo-versioned family or npm's latest tag.
 */
const kindOf = (name: string, current: string): Kind => {
  if (name in bundled) return 'bundled'

  const family = name === 'expo' || name.startsWith('expo-') || name.startsWith('@expo/')

  return (family || name === 'babel-preset-expo' || name === 'jest-expo') &&
    parse(current)?.[0] === SDK_MAJOR
    ? 'expo-family'
    : 'other'
}

/**
 * Picks the newest version a package may take.
 * @param name - The package name.
 * @param current - The pinned version.
 * @param published - What npm lists for the package.
 * @returns The allowed version (the current one when there is nothing newer).
 */
const allowedFor = (name: string, current: string, published: Published): string => {
  const kind = kindOf(name, current)
  const range = bundled[name]
  const major = parse(current)?.[0]

  const fits = published.versions.filter((version) => {
    if (kind === 'bundled' && range !== undefined) return inRange(version, range)
    if (kind === 'expo-family') return parse(version)?.[0] === major

    return version === published.latest
  })

  return fits.at(-1) ?? current
}

/**
 * Builds the command that applies an update.
 * @param name - The package name.
 * @param allowed - The version to move to.
 * @returns The command line.
 */
const commandFor = (name: string, allowed: string): string =>
  name === 'expo'
    ? `pnpm update -r expo@${allowed} && pnpm --filter @roundup/app exec expo install --fix`
    : `pnpm update -r ${name}@${allowed}`

/**
 * Compares one catalog entry with the registry.
 * @param name - The package name as written in the catalog.
 * @param current - The exact version the catalog pins.
 * @returns An update to apply, a newer release that is held back, or nothing when it is current.
 */
const checkPackage = async (name: string, current: string): Promise<Info | Row | undefined> => {
  const published = await fetchPublished(name)
  const latest = published.latest
  const allowed = allowedFor(name, current, published)
  const hold = HELD_BACK[name]

  if (parse(current) === undefined) {
    return {
      name,
      current,
      latest,
      reason: hold ?? 'pinned to a prerelease; check by hand',
    }
  }

  if (compare(allowed, current) > 0 && hold === undefined) {
    return { name, current, allowed, command: commandFor(name, allowed) }
  }

  if (compare(latest, allowed) > 0 || (hold !== undefined && compare(latest, current) > 0)) {
    return {
      name,
      current,
      latest,
      reason: hold ?? `SDK ${String(SDK_MAJOR)} allows ${allowed}`,
    }
  }

  return undefined
}

const results = await Promise.all(
  [...readCatalog()].map(([name, current]) => checkPackage(name, current)),
)

const rows = results.filter((result): result is Row => result !== undefined && 'command' in result)
const infos = results.filter((result): result is Info => result !== undefined && 'reason' in result)

if (infos.length > 0) {
  console.log('Newer releases that are not taken (info):')

  for (const info of infos) {
    console.log(`  ${info.name} ${info.current} -> ${info.latest}: ${info.reason}`)
  }
}

if (rows.length > 0) {
  console.log('\nUpdates available:')

  console.table(
    rows.map((row) => ({
      package: row.name,
      current: row.current,
      'latest allowed': row.allowed,
      update: row.command,
    })),
  )

  process.exitCode = 1
} else {
  console.log('updates: every catalog dependency is on the newest version it may take')
}
