import type { ComponentType } from 'react'

import { AvatarDemo } from './demos/AvatarDemo.tsx'
import { AvatarGroupDemo } from './demos/AvatarGroupDemo.tsx'
import { BadgeDemo } from './demos/BadgeDemo.tsx'
import { BottomNavDemo } from './demos/BottomNavDemo.tsx'
import { ButtonDemo } from './demos/ButtonDemo.tsx'
import { ChipDemo } from './demos/ChipDemo.tsx'
import { ColoursDemo } from './demos/ColoursDemo.tsx'
import { EmptyStateDemo } from './demos/EmptyStateDemo.tsx'
import { IconDemo } from './demos/IconDemo.tsx'
import { ListDemo } from './demos/ListDemo.tsx'
import { ListRowDemo } from './demos/ListRowDemo.tsx'
import { LogoDemo } from './demos/LogoDemo.tsx'
import { ModalDemo } from './demos/ModalDemo.tsx'
import { OtpInputDemo } from './demos/OtpInputDemo.tsx'
import { PageHeaderDemo } from './demos/PageHeaderDemo.tsx'
import { PhoneInputDemo } from './demos/PhoneInputDemo.tsx'
import { PriceDemo } from './demos/PriceDemo.tsx'
import { RatingDemo } from './demos/RatingDemo.tsx'
import { SafeAreaDemo } from './demos/SafeAreaDemo.tsx'
import { ScreenDemo } from './demos/ScreenDemo.tsx'
import { SideNavDemo } from './demos/SideNavDemo.tsx'
import { SkeletonDemo } from './demos/SkeletonDemo.tsx'
import { SquadCardDemo } from './demos/SquadCardDemo.tsx'
import { SurfaceDemo } from './demos/SurfaceDemo.tsx'
import { TabsDemo } from './demos/TabsDemo.tsx'
import { TextDemo } from './demos/TextDemo.tsx'
import { TextFieldDemo } from './demos/TextFieldDemo.tsx'
import { ThemeSwitchDemo } from './demos/ThemeSwitchDemo.tsx'
import { ToastDemo } from './demos/ToastDemo.tsx'
import { TopAppBarDemo } from './demos/TopAppBarDemo.tsx'
import { TypeDemo } from './demos/TypeDemo.tsx'
import { VenueCardDemo } from './demos/VenueCardDemo.tsx'
import { WelcomeDemo } from './demos/WelcomeDemo.tsx'

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
    Demo: ChipDemo,
  },
  {
    title: 'TextField',
    group: 'Inputs',
    summary: 'A labelled single-line input with helper and error text.',
    Demo: TextFieldDemo,
  },
  {
    title: 'PhoneInput',
    group: 'Inputs',
    summary: 'A phone number field with its country prefix.',
    Demo: PhoneInputDemo,
  },
  {
    title: 'OtpInput',
    group: 'Inputs',
    summary: 'A one-time code entry with a resend countdown.',
    Demo: OtpInputDemo,
  },
  {
    title: 'ThemeSwitch',
    group: 'Inputs',
    summary: 'System, Latte or Mocha, as a three-way choice.',
    Demo: ThemeSwitchDemo,
  },
  {
    title: 'Text',
    group: 'Display',
    summary: 'Text in a type style and a role colour.',
    Demo: TextDemo,
  },
  {
    title: 'Icon',
    group: 'Display',
    summary: 'The icon set, tinted by role colour.',
    Demo: IconDemo,
  },
  {
    title: 'Logo',
    group: 'Display',
    summary: 'The mark, the wordmark and the lockup, in brand or mono colour.',
    Demo: LogoDemo,
  },
  {
    title: 'Avatar',
    group: 'Display',
    summary: 'A person or squad as a photo or tinted initials.',
    Demo: AvatarDemo,
  },
  {
    title: 'AvatarGroup',
    group: 'Display',
    summary: 'Overlapping avatars with a +N chip.',
    Demo: AvatarGroupDemo,
  },
  {
    title: 'Badge',
    group: 'Display',
    summary: 'A small status pill with a tone.',
    Demo: BadgeDemo,
  },
  {
    title: 'Price',
    group: 'Display',
    summary: 'A price level from one to four marks.',
    Demo: PriceDemo,
  },
  {
    title: 'Rating',
    group: 'Display',
    summary: 'A rating out of five with its review count.',
    Demo: RatingDemo,
  },
  {
    title: 'Skeleton',
    group: 'Display',
    summary: 'Placeholders for a list row and a venue card while data loads.',
    Demo: SkeletonDemo,
  },
  {
    title: 'Toast',
    group: 'Feedback',
    summary: 'A short message with an optional action.',
    Demo: ToastDemo,
  },
  {
    title: 'EmptyState',
    group: 'Feedback',
    summary: 'What a screen shows when there is nothing in it yet.',
    Demo: EmptyStateDemo,
  },
  {
    title: 'Modal',
    group: 'Feedback',
    summary: 'A dialog for content or a confirmation, with a busy state.',
    Demo: ModalDemo,
  },
  {
    title: 'List',
    group: 'Lists and cards',
    summary: 'A rounded container that divides its rows.',
    Demo: ListDemo,
  },
  {
    title: 'ListRow',
    group: 'Lists and cards',
    summary: 'A row with leading and trailing content, pressable on request.',
    Demo: ListRowDemo,
  },
  {
    title: 'SquadCard',
    group: 'Lists and cards',
    summary: 'A squad with its members and the viewer role.',
    Demo: SquadCardDemo,
  },
  {
    title: 'VenueCard',
    group: 'Lists and cards',
    summary: 'A venue with rating, price, opening state and a save button.',
    Demo: VenueCardDemo,
  },
  {
    title: 'TopAppBar',
    group: 'Navigation',
    summary: 'The bar at the top of a phone screen.',
    Demo: TopAppBarDemo,
  },
  {
    title: 'Tabs',
    group: 'Navigation',
    summary: 'Segments that switch the view in place.',
    Demo: TabsDemo,
  },
  {
    title: 'BottomNav',
    group: 'Navigation',
    summary: 'The tab bar below the tablet breakpoint.',
    Demo: BottomNavDemo,
  },
  {
    title: 'SideNav',
    group: 'Navigation',
    summary: 'The rail beside the page from the desktop breakpoint.',
    Demo: SideNavDemo,
  },
  {
    title: 'PageHeader',
    group: 'Navigation',
    summary: 'The title block at the top of a wide page.',
    Demo: PageHeaderDemo,
  },
  {
    title: 'Screen',
    group: 'Layout',
    summary: 'A full page outside the shell, kept clear of the notch and home indicator.',
    Demo: ScreenDemo,
  },
  {
    title: 'SafeArea',
    group: 'Layout',
    summary: 'Pads the edges you choose with the device insets.',
    Demo: SafeAreaDemo,
  },
  {
    title: 'Surface',
    group: 'Layout',
    summary: 'A raised or sunken background that turns to Liquid Glass on iOS 26.',
    Demo: SurfaceDemo,
  },
  {
    title: 'Welcome',
    group: 'Layout',
    summary: 'The signed-out landing page.',
    Demo: WelcomeDemo,
  },
  {
    title: 'Colours',
    group: 'Foundations',
    summary: 'Every role colour of the theme, in Mocha and Latte.',
    Demo: ColoursDemo,
  },
  {
    title: 'Type',
    group: 'Foundations',
    summary: 'Every Text variant.',
    Demo: TypeDemo,
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
