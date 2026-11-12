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
  /** The first photo as an absolute URL; left out when the venue has none. */
  photo?: string
}

/** One photo of a venue's page, at the two sizes its tiles draw it. */
export interface IVenuePhoto {
  /** For the large tile of the photo grid, an absolute URL. */
  large: string
  /** For a small tile of the photo grid, an absolute URL. */
  small: string
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
  /** Every photo, the first being the card's, each sized for the page's tiles; empty when there are none. */
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
