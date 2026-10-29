import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

const FILES: Readonly<Record<string, string>> = {
  'index.html': '<!doctype html><title>home</title>',
  'squads.html': '<!doctype html><title>squads</title>',
  'explore/index.html': '<!doctype html><title>explore</title>',
  'squads/[id].html': '<!doctype html><title>squad</title>',
  'squads/[id]/members.html': '<!doctype html><title>members</title>',
  '+not-found.html': '<!doctype html><title>missing</title>',
  '_expo/static/js/web/entry-abc123.js': 'console.log("entry")',
  'favicon.svg': '<svg xmlns="http://www.w3.org/2000/svg"/>',
}

/** A fixture export folder and the way to remove it. */
interface Dist {
  /** Deletes the folder. */
  cleanup: () => Promise<void>
  /** The folder holding the export. */
  dir: string
}

/**
 * Writes a small Expo-shaped export to a temp folder; call the returned function to remove it.
 * @returns The folder and a function that deletes it.
 */
export const makeDist = async (): Promise<Dist> => {
  const dir = await mkdtemp(path.join(tmpdir(), 'roundup-dist-'))

  for (const [name, content] of Object.entries(FILES)) {
    const file = path.join(dir, name)

    await mkdir(path.dirname(file), { recursive: true })
    await writeFile(file, content)
  }

  /** Removes the temp folder and everything in it. */
  const cleanup = async (): Promise<void> => {
    await rm(dir, { recursive: true, force: true })
  }

  return { dir, cleanup }
}
