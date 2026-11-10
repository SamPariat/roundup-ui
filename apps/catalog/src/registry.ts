import type { ComponentType } from 'react'

import { AvatarDemo } from './demos/AvatarDemo'
import { AvatarGroupDemo } from './demos/AvatarGroupDemo'
import { BadgeDemo } from './demos/BadgeDemo'
import { BottomNavDemo } from './demos/BottomNavDemo'
import { ButtonDemo } from './demos/ButtonDemo'
import { ChipDemo } from './demos/ChipDemo'
import { ColorsDemo } from './demos/ColorsDemo'
import { EmptyStateDemo } from './demos/EmptyStateDemo'
import { FloatingActionButtonDemo } from './demos/FloatingActionButtonDemo'
import { IconDemo } from './demos/IconDemo'
import { IdentityHeaderDemo } from './demos/IdentityHeaderDemo'
import { ListDemo } from './demos/ListDemo'
import { ListRowDemo } from './demos/ListRowDemo'
import { LogoDemo } from './demos/LogoDemo'
import { MenuDemo } from './demos/MenuDemo'
import { ModalDemo } from './demos/ModalDemo'
import { NotifierDemo } from './demos/NotifierDemo'
import { OtpInputDemo } from './demos/OtpInputDemo'
import { PageHeaderDemo } from './demos/PageHeaderDemo'
import { PhoneInputDemo } from './demos/PhoneInputDemo'
import { PriceDemo } from './demos/PriceDemo'
import { RatingDemo } from './demos/RatingDemo'
import { SafeAreaDemo } from './demos/SafeAreaDemo'
import { ScreenDemo } from './demos/ScreenDemo'
import { SideNavDemo } from './demos/SideNavDemo'
import { SkeletonDemo } from './demos/SkeletonDemo'
import { SquadCardDemo } from './demos/SquadCardDemo'
import { SurfaceDemo } from './demos/SurfaceDemo'
import { TabsDemo } from './demos/TabsDemo'
import { TextDemo } from './demos/TextDemo'
import { TextFieldDemo } from './demos/TextFieldDemo'
import { ThemeSwitchDemo } from './demos/ThemeSwitchDemo'
import { ToastDemo } from './demos/ToastDemo'
import { TopAppBarDemo } from './demos/TopAppBarDemo'
import { TypeDemo } from './demos/TypeDemo'
import { VenueCardDemo } from './demos/VenueCardDemo'
import { WelcomeDemo } from './demos/WelcomeDemo'

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
export type TGroup = (typeof GROUPS)[number]

/** What the catalog knows about one page. */
export interface ICatalogEntry {
  /** The page that shows the variants, sizes and states. */
  Demo: ComponentType
  /** The section of the index it is listed under. */
  group: TGroup
  /** The URL segment: the title in kebab case. */
  slug: string
  /** One line on what the component is for. */
  summary: string
  /** The export name of the component in the ui package, or the name of a foundations page. */
  title: string
}

/** An entry as written below; the slug is derived from the title. */
type TEntryInput = Omit<ICatalogEntry, 'slug'>

/**
 * URL segment helpers. Static methods only.
 */
class Slug {
  /**
   * Turns a title into its URL segment: AvatarGroup becomes avatar-group.
   * @param title - The component's export name.
   * @returns The title in lower-case kebab form.
   */
  static of(title: string): string {
    return title.replaceAll(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
  }
}

// Every value export of @roundup/ui that renders has an entry here, and tests/registry.test.ts
// fails when one does not. Spinner and NavTab are internal to the package (index.ts does not
// export them), so they are shown inside the components that use them.
const ENTRIES: readonly TEntryInput[] = [
  {
    title: 'Button',
    group: 'Actions',
    summary: 'Primary, secondary, ghost and destructive actions, with a loading state.',
    Demo: ButtonDemo,
  },
  {
    title: 'FloatingActionButton',
    group: 'Actions',
    summary: "A screen's one create action, floating in the bottom-right corner.",
    Demo: FloatingActionButtonDemo,
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
    summary: 'A labeled single-line input with helper and error text.',
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
    summary: 'Text in a type style and a role color.',
    Demo: TextDemo,
  },
  {
    title: 'Icon',
    group: 'Display',
    summary: 'The icon set, tinted by role color.',
    Demo: IconDemo,
  },
  {
    title: 'Logo',
    group: 'Display',
    summary: 'The mark, the wordmark and the lockup, in brand or mono color.',
    Demo: LogoDemo,
  },
  {
    title: 'Avatar',
    group: 'Display',
    summary: 'A person or squad as a photo or tinted initials.',
    Demo: AvatarDemo,
  },
  {
    title: 'IdentityHeader',
    group: 'Display',
    summary: 'The avatar beside a name and one muted line, at the top of a profile or a squad.',
    Demo: IdentityHeaderDemo,
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
    title: 'Notifier',
    group: 'Feedback',
    summary: 'The app-wide host that floats one message at the top of the screen.',
    Demo: NotifierDemo,
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
    title: 'Menu',
    group: 'Feedback',
    summary: 'The options behind a ⋯ button, as a glass card under the header.',
    Demo: MenuDemo,
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
    title: 'Colors',
    group: 'Foundations',
    summary: 'Every role color of the theme, in Mocha and Latte.',
    Demo: ColorsDemo,
  },
  {
    title: 'Type',
    group: 'Foundations',
    summary: 'Every Text variant.',
    Demo: TypeDemo,
  },
]

/** Every page of the catalog, in index order. */
export const REGISTRY: readonly ICatalogEntry[] = ENTRIES.map((entry) => ({
  ...entry,
  slug: Slug.of(entry.title),
}))

/**
 * Lookups over the registry. Static methods only.
 */
export class Registry {
  /**
   * Looks a page up by its URL segment.
   * @param slug - The URL segment.
   * @returns The entry, or undefined when no page has that slug.
   */
  static find(slug?: string): ICatalogEntry | undefined {
    return REGISTRY.find((entry) => entry.slug === slug)
  }

  /**
   * The pages of one section of the index.
   * @param group - The section.
   * @returns Its entries, in index order.
   */
  static entriesIn(group: TGroup): readonly ICatalogEntry[] {
    return REGISTRY.filter((entry) => entry.group === group)
  }
}
