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

/** Writes a small Expo-shaped export to a temp folder; call the returned function to remove it. */
export const makeDist = async (): Promise<{ cleanup: () => Promise<void>; dir: string }> => {
  const dir = await mkdtemp(path.join(tmpdir(), 'roundup-dist-'))
  for (const [name, content] of Object.entries(FILES)) {
    const file = path.join(dir, name)
    await mkdir(path.dirname(file), { recursive: true })
    await writeFile(file, content)
  }
  return { dir, cleanup: () => rm(dir, { recursive: true, force: true }) }
}
