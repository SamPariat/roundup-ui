import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'

const isFile = async (file: string): Promise<boolean> => {
  try {
    const info = await stat(file)

    return info.isFile()
  } catch {
    return false
  }
}

const isDirectory = async (directory: string): Promise<boolean> => {
  try {
    const info = await stat(directory)

    return info.isDirectory()
  } catch {
    return false
  }
}

const existingFile = async (file: string): Promise<string | undefined> =>
  (await isFile(file)) ? file : undefined

// A final segment is either name.html or a folder holding index.html.
const resolveLeaf = async (directory: string, segment: string): Promise<string | undefined> => {
  for (const candidate of [`${segment}.html`, path.join(segment, 'index.html')]) {
    const file = await existingFile(path.join(directory, candidate))

    if (file !== undefined) return file
  }

  return undefined
}

// Dynamic route: a [param] file or folder takes any single segment.
const resolveDynamic = async (directory: string, rest: string[]): Promise<string | undefined> => {
  const names = await readdir(directory).catch(() => [] as string[])

  for (const name of names.filter((entry) => /^\[[^\]]+\]/.test(entry))) {
    const dynamic = path.join(directory, name)
    let found: string | undefined

    if (rest.length > 0) {
      found = (await isDirectory(dynamic)) ? await resolveSegments(dynamic, rest) : undefined
    } else {
      found = await existingFile(
        name.endsWith('.html') ? dynamic : path.join(dynamic, 'index.html'),
      )
    }

    if (found !== undefined) return found
  }

  return undefined
}

// Expo's static export writes squads.html (or squads/index.html) per route and [id].html for a
// dynamic one. Try the literal path, then each dynamic sibling for every segment that misses.
const resolveSegments = async (
  directory: string,
  segments: string[],
): Promise<string | undefined> => {
  const [segment, ...rest] = segments

  if (segment === undefined) return existingFile(path.join(directory, 'index.html'))

  const literal = path.join(directory, segment)
  let found: string | undefined

  if (rest.length === 0) {
    found = await resolveLeaf(directory, segment)
  } else if (await isDirectory(literal)) {
    found = await resolveSegments(literal, rest)
  }

  return found ?? resolveDynamic(directory, rest)
}

/** Maps a clean URL path to a file inside `root`, or undefined. Never leaves `root`. */
export const resolveFile = async (root: string, urlPath: string): Promise<string | undefined> => {
  let decoded: string

  try {
    decoded = decodeURIComponent(urlPath)
  } catch {
    return undefined
  }

  if (decoded.includes('\0')) return undefined

  const segments = decoded.split('/').filter((part) => part !== '' && part !== '.')

  if (segments.includes('..')) return undefined

  const exact = path.join(root, ...segments)

  if (segments.length > 0 && path.extname(exact) !== '' && (await isFile(exact))) return exact

  return resolveSegments(root, segments)
}
