/** Google Places price level: 0 (unknown) to 4. Matches the UI's VenueCard prop. */
export type TPriceLevel = 0 | 1 | 2 | 3 | 4

/** What a venue card and a venue's page need of a place. Matches the UI's IVenueCardProps, plus the ID. */
export interface IVenueCard {
  /** The Google place ID, which the venue's page is opened by. */
  id: string
  /** The venue's name. */
  name: string
  /** Street address; left out when empty. */
  address?: string
  /** Average rating out of 5; left out when nobody has rated it. */
  rating?: number
  /** How many ratings the average is based on; left out with the rating. */
  reviews?: number
  /** Price level, 0 when unknown. */
  priceLevel: TPriceLevel
  /** Whether the venue is open now; left out when Google does not know. */
  isOpen?: boolean
  /** Readable category tags, such as "Night club". */
  types: string[]
  /** The first photo's URL on Google's servers, sized for a card; left out when the venue has none. */
  photo?: string
  /** Who took the first photo; left out when unknown. */
  photoCredit?: IPhotoCredit
}

/** Who took a photo, which Google requires showing with it. Matches the UI's IPhotoCredit. */
export interface IPhotoCredit {
  /** The author's display name. */
  name: string
  /** The author's profile page; left out when Google gives none. */
  url?: string
}

/** One photo of a venue's page. */
export interface IVenuePhoto {
  /** The photo's URL on Google's servers, sized for the page's largest tile. */
  src: string
  /** Who took it; left out when unknown. */
  credit?: IPhotoCredit
}

/** A member who saved a venue in a squad. */
export interface IFavoriteSaver {
  /** The member's user ID. */
  id: string
  /** Their name; empty until they finish profile setup. */
  name: string
  /** Their photo; left out when they have none. */
  src?: string
  /** True for the signed-in person. */
  isMe: boolean
}

/** One venue saved in a squad, as a row of the squad's favorites. */
export interface IFavoriteRow {
  /** The venue's place ID. */
  id: string
  /** The venue's name. */
  name: string
  /** The street address; left out when empty. */
  address?: string
  /** The average rating; left out when unrated. */
  rating?: number
  /** How many ratings it is based on; left out when unrated. */
  reviews?: number
  /** The Google price level, 0 when unknown. */
  priceLevel: TPriceLevel
  /** A small photo's URL on Google's servers; left out when the venue has none. */
  photo?: string
  /** Who took the photo; left out when unknown. */
  photoCredit?: IPhotoCredit
  /** The current members who saved it, the most recent first. */
  savers: IFavoriteSaver[]
  /** True when the signed-in person saved it, and so can remove their save. */
  savedByMe: boolean
  /** When it was last saved, such as "18 Oct". */
  savedOn: string
}

/** One venue a squad has been to, as a row of its visit history. */
export interface IVisitRow {
  /** The venue's place ID. */
  id: string
  /** The venue's name, as of the latest visit. */
  name: string
  /** The street address; left out when empty. */
  address?: string
  /** A small photo's URL on Google's servers; left out when the venue has none. */
  photo?: string
  /** Who took the photo; left out when unknown. */
  photoCredit?: IPhotoCredit
  /** How many times the squad has been. */
  visitCount: number
  /** The day of the latest visit, such as "18th Oct 2026". */
  lastVisitedOn: string
  /** The average spend per person in paise; left out when no visit has a known spend. */
  avgSpendInPaise?: number
}

/** One review of a venue. */
export interface IVenueReview {
  /** Who wrote it. */
  author: string
  /** Their rating out of 5. */
  rating: number
  /** What they wrote. */
  text: string
  /** When it was published, as the API sends it, such as "a month ago". */
  publishedAt: string
}

/** A squad the person may save a venue in, and whether it is saved there. */
export interface ISavedIn {
  /** The squad's ID. */
  squadId: string
  /** The squad's name. */
  squadName: string
  /** True when the person saved the venue in this squad. */
  saved: boolean
}

/** Everything a venue's page shows. */
export interface IVenueInfo extends IVenueCard {
  /** The editorial summary; left out when there is none. */
  summary?: string
  /** Today's opening hours, without the day name, such as "5:00 PM to 11:00 PM"; left out when unknown. */
  hoursToday?: string
  /** The opening hours of the whole week, one line per day, starting on Monday. */
  hours: string[]
  /** The phone number as written; left out when empty. */
  phone?: string
  /** The website; left out when empty. */
  website?: string
  /** The photos the page shows, up to five, the first being the card's; empty when there are none. */
  photos: IVenuePhoto[]
  /** The reviews the API sent, up to five, newest as it orders them; empty when there are none. */
  reviewList: IVenueReview[]
  /** One entry per squad the person is in. */
  savedIn: ISavedIn[]
}

/** The kinds of place the Explore chips filter by, as the API's `type` takes them. Same shape as orval's enums. */
export const VenueType = {
  BAR: 'bar',
  CAFE: 'cafe',
  NIGHT_CLUB: 'night_club',
  RESTAURANT: 'restaurant',
} as const

/** One of the venue types. */
export type TVenueType = (typeof VenueType)[keyof typeof VenueType]

/** The radii the person can pick, in kilometers. Google's search reaches 50 km at most. */
export const RADIUS_STEPS_KM: readonly number[] = [1, 2, 3, 5, 10, 25, 50]

/** The radius the search starts with, in kilometers. */
export const DEFAULT_RADIUS_KM = 3
