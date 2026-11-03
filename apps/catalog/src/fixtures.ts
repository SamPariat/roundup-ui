import type { IAvatarGroupProps, INavUser, TIconName } from '@roundup/ui'

/** A sample person for the avatars, lists and squads in the demos. */
export type TMember = IAvatarGroupProps['people'][number]

/** A sample squad. */
export interface ISquadFixture {
  /** Stable ID, which picks the avatar tint. */
  id: string
  /** The viewer's role in the squad. */
  role: 'ADMIN' | 'MEMBER'
  /** How many people are in the squad in all. */
  memberCount: number
  /** The people drawn on the card. */
  members: TMember[]
  /** The squad's name. */
  name: string
}

/** A sample venue. */
export interface IVenueFixture {
  /** Street address. */
  address: string
  /** Whether it is open now. */
  isOpen: boolean
  /** The venue's name. */
  name: string
  /** Google Places price level. */
  priceLevel: 0 | 1 | 2 | 3 | 4
  /** Average rating out of 5. */
  rating: number
  /** How many reviews the rating is based on. */
  reviews: number
  /** Category tags. */
  types: string[]
}

/** The people the demos draw. */
export const PEOPLE: TMember[] = [
  { id: 'p1', name: 'Aarav Shah' },
  { id: 'p2', name: 'Diya Mehta' },
  { id: 'p3', name: 'Kabir Rao' },
  { id: 'p4', name: 'Meera Iyer' },
  { id: 'p5', name: 'Rohan Das' },
  { id: 'p6', name: 'Sana Khan' },
  { id: 'p7', name: 'Vikram Nair' },
  { id: 'p8', name: 'Ananya Gupta' },
]

/** The signed-in person the side navigation pins to its bottom. */
export const NAV_USER: INavUser = { id: 'p1', name: 'Aarav Shah', phone: '+91 98765 43210' }

/** A squad the viewer runs. */
export const FRIDAY_FOOTY: ISquadFixture = {
  id: 's1',
  name: 'Friday Footy',
  role: 'ADMIN',
  memberCount: 12,
  members: PEOPLE.slice(0, 5),
}

/** A squad the viewer only belongs to. */
export const BOOK_CLUB: ISquadFixture = {
  id: 's2',
  name: 'Book Club',
  role: 'MEMBER',
  memberCount: 4,
  members: PEOPLE.slice(2, 6),
}

/** A venue that is open. */
export const OPEN_VENUE: IVenueFixture = {
  name: 'Blue Tokai Coffee Roasters',
  address: '12 Church Street, Bengaluru',
  rating: 4.6,
  reviews: 1280,
  priceLevel: 2,
  isOpen: true,
  types: ['Cafe', 'Coffee shop'],
}

/** A venue that is closed. */
export const CLOSED_VENUE: IVenueFixture = {
  name: 'Toit Brewpub',
  address: '298 100 Feet Road, Indiranagar',
  rating: 4.4,
  reviews: 9640,
  priceLevel: 3,
  isOpen: false,
  types: ['Bar', 'Brewery'],
}

/** Every icon of the set, in the order of the set. */
export const ICON_NAMES: readonly TIconName[] = [
  'alert',
  'back',
  'bookmark',
  'bookmark-filled',
  'check',
  'chevron',
  'clock',
  'close',
  'contacts',
  'device',
  'edit',
  'explore',
  'history',
  'info',
  'logout',
  'moon',
  'more',
  'phone',
  'pin',
  'plus',
  'profile',
  'search',
  'shield',
  'squads',
  'star',
  'sun',
  'trash',
]
