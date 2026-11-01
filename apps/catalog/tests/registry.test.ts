import * as ui from '@roundup/ui'

import { entriesIn, findEntry, GROUPS, REGISTRY } from '../src/registry.ts'

/** Exports that start with a capital letter but are not components to show. */
const NOT_COMPONENTS: ReadonlySet<string> = new Set([
  // A provider: it renders nothing of its own. The catalog's layout wraps every page in it.
  'ThemeProvider',
])

/**
 * Whether an export of the ui package is a component that needs a catalog page. Components are the
 * PascalCase value exports; types do not exist at runtime, hooks and helpers are camelCase, and
 * the `*Variants` objects (class recipes such as buttonVariants) are not components.
 * @param name - The export name.
 * @returns True when the catalog must show it.
 */
const isComponent = (name: string): boolean =>
  /^[A-Z]/.test(name) && !NOT_COMPONENTS.has(name) && !name.endsWith('Variants')

/**
 * Orders names alphabetically.
 * @param a - One name.
 * @param b - The other name.
 * @returns Negative when a sorts first, positive when b does, zero when they are equal.
 */
const compare = (a: string, b: string): number => a.localeCompare(b)

describe('registry', () => {
  const components = Object.keys(ui).filter(isComponent)

  it('finds the components of @roundup/ui', () => {
    expect(components).toEqual(expect.arrayContaining(['Button', 'Surface', 'VenueCard']))
  })

  it.each(components)('has a page for %s', (name) => {
    expect(REGISTRY.map(({ title }) => title)).toContain(name)
  })

  it('has no page for something @roundup/ui does not export, other than the foundations', () => {
    const pages = REGISTRY.filter(({ group }) => group !== 'Foundations').map(({ title }) => title)

    expect(pages.toSorted(compare)).toEqual(components.toSorted(compare))
  })

  it('gives every page its own slug', () => {
    const slugs = REGISTRY.map(({ slug }) => slug)

    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('looks a page up by its slug', () => {
    expect(findEntry('avatar-group')?.title).toBe('AvatarGroup')
    expect(findEntry('nope')).toBeUndefined()
    expect(findEntry()).toBeUndefined()
  })

  it.each(GROUPS)('lists something under %s', (group) => {
    expect(entriesIn(group).length).toBeGreaterThan(0)
  })
})
