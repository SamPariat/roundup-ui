import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'

/**
 * Whether a path is a regular file; false when it does not exist.
 * @param file - The path to test.
 * @returns True for a file.
 */
const isFile = async (file: string): Promise<boolean> => {
  try {
    const info = await stat(file)

    return info.isFile()
  } catch {
    return false
  }
}

/**
 * Whether a path is a directory; false when it does not exist.
 * @param directory - The path to test.
 * @returns True for a directory.
 */
const isDirectory = async (directory: string): Promise<boolean> => {
  try {
    const info = await stat(directory)

    return info.isDirectory()
  } catch {
    return false
  }
}

/**
 * Returns the path when it is a file, so lookups can chain with `??`.
 * @param file - The path to test.
 * @returns The path, or undefined.
 */
const existingFile = async (file: string): Promise<string | undefined> =>
  (await isFile(file)) ? file : undefined

/**
 * A final segment is either name.html or a folder holding index.html.
 * @param directory - The folder to look in.
 * @param segment - The last URL segment.
 * @returns The matching file, or undefined.
 */
const resolveLeaf = async (directory: string, segment: string): Promise<string | undefined> => {
  for (const candidate of [`${segment}.html`, path.join(segment, 'index.html')]) {
    const file = await existingFile(path.join(directory, candidate))

    if (file !== undefined) return file
  }

  return undefined
}

/**
 * Dynamic route: a [param] file or folder takes any single segment.
 * @param directory - The folder to look in.
 * @param rest - The URL segments still to match.
 * @returns The matching file, or undefined.
 */
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

/**
 * Expo's static export writes squads.html (or squads/index.html) per route and [id].html for a
 * dynamic one. Try the literal path, then each dynamic sibling for every segment that misses.
 * @param directory - The folder matched so far.
 * @param segments - The URL segments still to match.
 * @returns The matching file, or undefined.
 */
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

/**
 * Maps a clean URL path to a file inside `root`, or undefined. Never leaves `root`.
 * @param root - The export folder; nothing outside it is ever returned.
 * @param urlPath - The request path.
 * @returns The file to send, or undefined when there is none.
 */
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
