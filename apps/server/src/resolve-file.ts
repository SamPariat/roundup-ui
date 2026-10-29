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

// Expo's static export writes squads.html (or squads/index.html) per route and [id].html for a
// dynamic one. Try the literal path, then each dynamic sibling for every segment that misses.
const resolveSegments = async (
  directory: string,
  segments: string[],
): Promise<string | undefined> => {
  const [segment, ...rest] = segments
  if (segment === undefined)
    return (await isFile(path.join(directory, 'index.html')))
      ? path.join(directory, 'index.html')
      : undefined

  if (rest.length === 0) {
    for (const candidate of [`${segment}.html`, path.join(segment, 'index.html')]) {
      const file = path.join(directory, candidate)
      if (await isFile(file)) return file
    }
  }

  const literal = path.join(directory, segment)
  if (rest.length > 0 && (await isDirectory(literal))) {
    const found = await resolveSegments(literal, rest)
    if (found !== undefined) return found
  }

  // Dynamic route: a [param] file or folder takes any single segment.
  const names = await readdir(directory).catch(() => [] as string[])
  for (const name of names.filter((entry) => /^\[[^\]]+\]/.test(entry))) {
    const dynamic = path.join(directory, name)
    if (rest.length === 0) {
      const file = name.endsWith('.html') ? dynamic : path.join(dynamic, 'index.html')
      if (await isFile(file)) return file
    } else if (await isDirectory(dynamic)) {
      const found = await resolveSegments(dynamic, rest)
      if (found !== undefined) return found
    }
  }
  return undefined
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
