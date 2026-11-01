import type { ComponentType } from 'react'

import { ButtonDemo } from './demos/ButtonDemo.tsx'
import { PendingDemo } from './demos/PendingDemo.tsx'

/** The sections of the component index, in the order they are listed. */
export const GROUPS = [
  'Actions',
  'Inputs',
  'Display',
  'Feedback',
  'Lists and cards',
  'Navigation',
  'Layout',
  'Foundations',
] as const

/** One section of the component index. */
export type Group = (typeof GROUPS)[number]

/** What the catalog knows about one page. */
export interface CatalogEntry {
  /** The page that shows the variants, sizes and states. */
  Demo: ComponentType
  /** The section of the index it is listed under. */
  group: Group
  /** The URL segment: the title in kebab case. */
  slug: string
  /** One line on what the component is for. */
  summary: string
  /** The export name of the component in the ui package, or the name of a foundations page. */
  title: string
}

/** An entry as written below; the slug is derived from the title. */
type EntryInput = Omit<CatalogEntry, 'slug'>

/**
 * Turns a title into its URL segment: AvatarGroup becomes avatar-group.
 * @param title - The component's export name.
 * @returns The title in lower-case kebab form.
 */
const slugOf = (title: string): string => title.replaceAll(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()

// Every value export of @roundup/ui that renders has an entry here, and tests/registry.test.ts
// fails when one does not. Spinner and NavTab are internal to the package (index.ts does not
// export them), so they are shown inside the components that use them.
const ENTRIES: readonly EntryInput[] = [
  {
    title: 'Button',
    group: 'Actions',
    summary: 'Primary, secondary, ghost and destructive actions, with a loading state.',
    Demo: ButtonDemo,
  },
  {
    title: 'Chip',
    group: 'Actions',
    summary: 'A pill toggle for filters and choices.',
    Demo: PendingDemo,
  },
  {
    title: 'TextField',
    group: 'Inputs',
    summary: 'A labelled single-line input with helper and error text.',
    Demo: PendingDemo,
  },
  {
    title: 'PhoneInput',
    group: 'Inputs',
    summary: 'A phone number field with its country prefix.',
    Demo: PendingDemo,
  },
  {
    title: 'OtpInput',
    group: 'Inputs',
    summary: 'A one-time code entry with a resend countdown.',
    Demo: PendingDemo,
  },
  {
    title: 'ThemeSwitch',
    group: 'Inputs',
    summary: 'System, Latte or Mocha, as a three-way choice.',
    Demo: PendingDemo,
  },
  {
    title: 'Text',
    group: 'Display',
    summary: 'Text in a type style and a role colour.',
    Demo: PendingDemo,
  },
  {
    title: 'Icon',
    group: 'Display',
    summary: 'The icon set, tinted by role colour.',
    Demo: PendingDemo,
  },
  {
    title: 'Logo',
    group: 'Display',
    summary: 'The mark, the wordmark and the lockup, in brand or mono colour.',
    Demo: PendingDemo,
  },
  {
    title: 'Avatar',
    group: 'Display',
    summary: 'A person or squad as a photo or tinted initials.',
    Demo: PendingDemo,
  },
  {
    title: 'AvatarGroup',
    group: 'Display',
    summary: 'Overlapping avatars with a +N chip.',
    Demo: PendingDemo,
  },
  {
    title: 'Badge',
    group: 'Display',
    summary: 'A small status pill with a tone.',
    Demo: PendingDemo,
  },
  {
    title: 'Price',
    group: 'Display',
    summary: 'A price level from one to four marks.',
    Demo: PendingDemo,
  },
  {
    title: 'Rating',
    group: 'Display',
    summary: 'A rating out of five with its review count.',
    Demo: PendingDemo,
  },
  {
    title: 'Skeleton',
    group: 'Display',
    summary: 'Placeholders for a list row and a venue card while data loads.',
    Demo: PendingDemo,
  },
  {
    title: 'Toast',
    group: 'Feedback',
    summary: 'A short message with an optional action.',
    Demo: PendingDemo,
  },
  {
    title: 'EmptyState',
    group: 'Feedback',
    summary: 'What a screen shows when there is nothing in it yet.',
    Demo: PendingDemo,
  },
  {
    title: 'Modal',
    group: 'Feedback',
    summary: 'A dialog for content or a confirmation, with a busy state.',
    Demo: PendingDemo,
  },
  {
    title: 'List',
    group: 'Lists and cards',
    summary: 'A rounded container that divides its rows.',
    Demo: PendingDemo,
  },
  {
    title: 'ListRow',
    group: 'Lists and cards',
    summary: 'A row with leading and trailing content, pressable on request.',
    Demo: PendingDemo,
  },
  {
    title: 'SquadCard',
    group: 'Lists and cards',
    summary: 'A squad with its members and the viewer role.',
    Demo: PendingDemo,
  },
  {
    title: 'VenueCard',
    group: 'Lists and cards',
    summary: 'A venue with rating, price, opening state and a save button.',
    Demo: PendingDemo,
  },
  {
    title: 'TopAppBar',
    group: 'Navigation',
    summary: 'The bar at the top of a phone screen.',
    Demo: PendingDemo,
  },
  {
    title: 'Tabs',
    group: 'Navigation',
    summary: 'Segments that switch the view in place.',
    Demo: PendingDemo,
  },
  {
    title: 'BottomNav',
    group: 'Navigation',
    summary: 'The tab bar below the tablet breakpoint.',
    Demo: PendingDemo,
  },
  {
    title: 'SideNav',
    group: 'Navigation',
    summary: 'The rail beside the page from the desktop breakpoint.',
    Demo: PendingDemo,
  },
  {
    title: 'PageHeader',
    group: 'Navigation',
    summary: 'The title block at the top of a wide page.',
    Demo: PendingDemo,
  },
  {
    title: 'Screen',
    group: 'Layout',
    summary: 'A full page outside the shell, kept clear of the notch and home indicator.',
    Demo: PendingDemo,
  },
  {
    title: 'SafeArea',
    group: 'Layout',
    summary: 'Pads the edges you choose with the device insets.',
    Demo: PendingDemo,
  },
  {
    title: 'Surface',
    group: 'Layout',
    summary: 'A raised or sunken background that turns to Liquid Glass on iOS 26.',
    Demo: PendingDemo,
  },
  {
    title: 'Welcome',
    group: 'Layout',
    summary: 'The signed-out landing page.',
    Demo: PendingDemo,
  },
  {
    title: 'Colours',
    group: 'Foundations',
    summary: 'Every role colour of the theme, in Mocha and Latte.',
    Demo: PendingDemo,
  },
  {
    title: 'Type',
    group: 'Foundations',
    summary: 'Every Text variant.',
    Demo: PendingDemo,
  },
]

/** Every page of the catalog, in index order. */
export const REGISTRY: readonly CatalogEntry[] = ENTRIES.map((entry) => ({
  ...entry,
  slug: slugOf(entry.title),
}))

/**
 * Looks a page up by its URL segment.
 * @param slug - The URL segment.
 * @returns The entry, or undefined when no page has that slug.
 */
export const findEntry = (slug?: string): CatalogEntry | undefined =>
  REGISTRY.find((entry) => entry.slug === slug)

/**
 * The pages of one section of the index.
 * @param group - The section.
 * @returns Its entries, in index order.
 */
export const entriesIn = (group: Group): readonly CatalogEntry[] =>
  REGISTRY.filter((entry) => entry.group === group)
