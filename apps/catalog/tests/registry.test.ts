import * as ui from '@roundup/ui'

import { GROUPS, REGISTRY, Registry } from '@/registry'

/** Exports that start with a capital letter but are not components to show. */
const NOT_COMPONENTS: ReadonlySet<string> = new Set([
  // A static helper class: Breakpoint.of maps a window width to a breakpoint.
  'Breakpoint',
  // A wrapper that only puts the keyboard away on a tap: it draws nothing of its own.
  'KeyboardDismissArea',
  // A provider: it renders nothing of its own. The catalog's layout wraps every page in it.
  'ThemeProvider',
])

/**
 * Registry test helpers. Static methods only.
 */
class RegistryFixtures {
  /**
   * Whether an export of the ui package is a component that needs a catalog page. Components are the
   * PascalCase value exports; types do not exist at runtime, hooks and helpers are camelCase, and
   * the `*Variants` objects (class recipes such as buttonVariants) and the static helper classes
   * listed in NOT_COMPONENTS are not components.
   * @param name - The export name.
   * @returns True when the catalog must show it.
   */
  static isComponent(name: string): boolean {
    return /^[A-Z]/.test(name) && !NOT_COMPONENTS.has(name) && !name.endsWith('Variants')
  }

  /**
   * Orders names alphabetically.
   * @param a - One name.
   * @param b - The other name.
   * @returns Negative when a sorts first, positive when b does, zero when they are equal.
   */
  static compare(a: string, b: string): number {
    return a.localeCompare(b)
  }
}

describe('registry', () => {
  const components = Object.keys(ui).filter((name) => RegistryFixtures.isComponent(name))

  it('finds the components of @roundup/ui', () => {
    expect(components).toEqual(expect.arrayContaining(['Button', 'Surface', 'VenueCard']))
  })

  it.each(components)('has a page for %s', (name) => {
    expect(REGISTRY.map(({ title }) => title)).toContain(name)
  })

  it('has no page for something @roundup/ui does not export, other than the foundations', () => {
    const pages = REGISTRY.filter(({ group }) => group !== 'Foundations').map(({ title }) => title)

    const expected = [...components]

    pages.sort((a, b) => RegistryFixtures.compare(a, b))
    expected.sort((a, b) => RegistryFixtures.compare(a, b))

    expect(pages).toEqual(expected)
  })

  it('gives every page its own slug', () => {
    const slugs = REGISTRY.map(({ slug }) => slug)

    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('looks a page up by its slug', () => {
    expect(Registry.find('avatar-group')?.title).toBe('AvatarGroup')
    expect(Registry.find('nope')).toBeUndefined()
    expect(Registry.find()).toBeUndefined()
  })

  it.each(GROUPS)('lists something under %s', (group) => {
    expect(Registry.entriesIn(group).length).toBeGreaterThan(0)
  })
})
