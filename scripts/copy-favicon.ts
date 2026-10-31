// Copies the Roundup mark into apps/roundup/public/favicon.svg, where Expo's web build looks for static
// files. The copy is generated and git-ignored, so assets/svg/logo/mark-dark.svg stays the only
// hand-maintained favicon. The app's dev, web, ios, android and export:web scripts run this first.
import { copyFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const source = new URL('../assets/svg/logo/mark-dark.svg', import.meta.url)
const target = new URL('../apps/roundup/public/favicon.svg', import.meta.url)

mkdirSync(new URL('./', target), { recursive: true })
copyFileSync(source, target)
console.log(`favicon: wrote ${fileURLToPath(target)}`)
