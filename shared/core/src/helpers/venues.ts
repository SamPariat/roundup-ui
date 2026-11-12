import type { QueryClient } from '@tanstack/react-query'

import { PixelRatio } from 'react-native'

import type { Favorite, Member, Photo, Review, SavedIn, Venue, VenueDetail } from '@roundup/api'

import { getGetVenueQueryKey, getListFavoritesQueryKey, PhotoWidthParameter } from '@roundup/api'

import type {
  IFavoriteRow,
  IFavoriteSaver,
  IPhotoCredit,
  ISavedIn,
  IVenueCard,
  IVenueInfo,
  IVenuePhoto,
  IVenueReview,
  TPriceLevel,
} from '../venues/types'

/** The price levels the API can send, indexed by level, so a number is checked instead of cast. */
const PRICE_LEVELS: readonly TPriceLevel[] = [0, 1, 2, 3, 4]

/** Google's catch-all types, which say nothing about the venue and are not shown as tags. */
const GENERIC_TYPES: ReadonlySet<string> = new Set(['establishment', 'food', 'point_of_interest'])

/** How many category tags a card shows. */
const MAX_TAGS = 3

/** Days in a week, and the offset that makes Monday (Google's first line) index 0 from getDay(). */
const WEEK = 7
const FROM_SUNDAY = 6

/** How a save's date reads in a row: the day and the month, such as "18 Oct". */
const SAVED_ON = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' })

/** What separates the day from the hours in Google's lines, such as "Monday: 5:00 PM – 11:00 PM". */
const DAY_SEPARATOR = ': '

/**
 * The widths the API serves photos at, narrowest first. Only these are accepted, so the same few
 * repeat across devices and the API's cached photo URLs answer.
 */
const PHOTO_WIDTHS: readonly PhotoWidthParameter[] = Object.values(PhotoWidthParameter).sort(
  (a, b) => a - b,
)

/**
 * How wide each slot a photo fills is, in points: a card, the venue page's largest (its big grid
 * tile, or on a phone the whole width, whichever is narrower), a thumbnail.
 */
const PHOTO_SLOT = { card: 400, large: 570, thumb: 56 } as const

/** A slot a photo fills, which sets the width it is asked for at. */
export type TPhotoSlot = keyof typeof PHOTO_SLOT

/** How many photos a venue's page asks for: the large one and the four beside it. */
export const VENUE_PHOTOS = 5

/**
 * Venue mapping and cache helpers, on the query client they refresh. Deps creates one; reach it
 * through useDeps().helpers.venues. After a save or unsave the venue's detail and the squad's
 * favorites are invalidated rather than edited by hand, so the lists always come from the server.
 */
export class Venues {
  /** The cache the venues live in. */
  private readonly queryClient: QueryClient

  /**
   * Builds the helpers on the cache they refresh.
   * @param queryClient - The TanStack Query cache.
   */
  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient
  }

  /**
   * Maps a search result onto the card the UI draws. An unrated venue (0 stars), an unknown
   * opening status (null), a missing photo and an empty address leave their keys out.
   * @param venue - The search result.
   * @returns The card, its photo as an absolute URL.
   */
  toCard(venue: Venue): IVenueCard {
    const [photo] = venue.photos
    const rated = venue.averageRating > 0

    return {
      id: venue.placeID,
      name: venue.name,
      priceLevel: PRICE_LEVELS[venue.priceLevel] ?? 0,
      types: this.toTags(venue.types),
      ...(venue.address === '' ? {} : { address: venue.address }),
      ...(venue.isOpen === null ? {} : { isOpen: venue.isOpen }),
      ...(photo === undefined ? {} : this.photoFields(photo)),
      ...(rated ? { rating: venue.averageRating, reviews: venue.ratingCount } : {}),
    }
  }

  /**
   * Maps a venue's detail answer onto what its page shows.
   * @param detail - The detail answer.
   * @param now - The current time in milliseconds, which picks today's line of the opening hours.
   * @returns The venue with today's hours, its photos and reviews and the squads it is saved in.
   */
  toInfo(detail: VenueDetail, now: number): IVenueInfo {
    const today = this.hoursOn(detail.openingHours, now)

    return {
      ...this.toCard(detail),
      hours: detail.openingHours,
      photos: detail.photos.map((photo) => this.toPhoto(photo)),
      reviewList: detail.reviews.map((review) => this.toReview(review)),
      savedIn: detail.savedIn.map((squad) => this.toSavedIn(squad)),
      ...(detail.editorialSummary === '' ? {} : { summary: detail.editorialSummary }),
      ...(today === undefined ? {} : { hoursToday: today }),
      ...(detail.phoneNumber === '' ? {} : { phone: detail.phoneNumber }),
      ...(detail.website === '' ? {} : { website: detail.website }),
    }
  }

  /**
   * Maps a favorite of a squad onto a row.
   * @param favorite - The favorite the API sent.
   * @param meId - The signed-in person's user ID, to mark their own save; undefined while unknown.
   * @returns The row, its photo a thumbnail and its savers as people.
   */
  toFavorite(favorite: Favorite, meId: string | undefined): IFavoriteRow {
    const rated = favorite.averageRating > 0

    return {
      id: favorite.placeID,
      name: favorite.name,
      priceLevel: PRICE_LEVELS[favorite.priceLevel] ?? 0,
      savedByMe: favorite.savedByMe,
      savedOn: SAVED_ON.format(new Date(favorite.lastSavedAt)),
      savers: favorite.savedBy.map((member) => this.toSaver(member, meId)),
      ...(favorite.address === '' ? {} : { address: favorite.address }),
      ...(favorite.photo === null ? {} : this.photoFields(favorite.photo)),
      ...(rated ? { rating: favorite.averageRating, reviews: favorite.ratingCount } : {}),
    }
  }

  /**
   * Marks a venue's detail and its squad's favorites as out of date, after a save or an unsave.
   * Whatever is on screen loads again, and this waits for it, so a sheet shows the new state.
   * @param placeId - The venue that was saved or unsaved.
   * @param squadId - The squad it was saved in or removed from.
   */
  async saved(placeId: string, squadId: string): Promise<void> {
    await Promise.all([
      this.queryClient.invalidateQueries({ queryKey: getGetVenueQueryKey(placeId) }),
      this.queryClient.invalidateQueries({ queryKey: getListFavoritesQueryKey(squadId) }),
    ])
  }

  /**
   * The width to ask the API for a slot's photos at: the slot in points times the pixel ratio,
   * rounded up to the next width the API serves, so no photo is fetched larger than it is drawn. No
   * slot is wider than the window, so a phone asks for less than a wide screen's 570 point tile.
   * @param slot - The slot the photos fill.
   * @param windowWidth - The window's width in points, from useWindowDimensions.
   * @returns A width the API accepts; its widest when the slot needs more.
   */
  photoWidth(slot: TPhotoSlot, windowWidth: number): PhotoWidthParameter {
    const points = Math.min(PHOTO_SLOT[slot], windowWidth)
    const wanted = points * PixelRatio.get()

    return PHOTO_WIDTHS.find((width) => width >= wanted) ?? PhotoWidthParameter.NUMBER_1600
  }

  /**
   * Maps a member who saved a venue.
   * @param member - The member the API sent.
   * @param meId - The signed-in person's user ID.
   * @returns The person, marked when it is the signed-in one.
   */
  private toSaver(member: Member, meId: string | undefined): IFavoriteSaver {
    return {
      id: member.userID,
      isMe: member.userID === meId,
      name: member.name,
      ...(member.avatarURL === '' ? {} : { src: member.avatarURL }),
    }
  }

  /**
   * Maps one photo of the detail answer. The API already sized it for the page.
   * @param photo - The photo the API sent.
   * @returns Its URL and who took it.
   */
  private toPhoto(photo: Photo): IVenuePhoto {
    const credit = this.creditOf(photo)

    return { src: photo.url, ...(credit === undefined ? {} : { credit }) }
  }

  /**
   * A card's or row's photo fields: its URL, already sized by the API, and who took it.
   * @param photo - The photo the API sent.
   * @returns The photo and, when known, its credit.
   */
  private photoFields(photo: Photo): Pick<IVenueCard, 'photo' | 'photoCredit'> {
    const credit = this.creditOf(photo)

    return { photo: photo.url, ...(credit === undefined ? {} : { photoCredit: credit }) }
  }

  /**
   * Who took a photo. The API lists its authors; a place photo has one, so the first is the credit.
   * @param photo - The photo the API sent.
   * @returns The credit, or undefined when the API named no author.
   */
  private creditOf(photo: Photo): IPhotoCredit | undefined {
    const [author] = photo.attributions

    if (author === undefined) return undefined

    return { name: author.name, ...(author.uri === '' ? {} : { url: author.uri }) }
  }

  /**
   * Maps one review of the detail answer.
   * @param review - A review.
   * @returns Its author, rating, text and when it was published.
   */
  private toReview(review: Review): IVenueReview {
    return {
      author: review.authorName,
      publishedAt: review.publishedAt,
      rating: review.rating,
      text: review.text,
    }
  }

  /**
   * Maps one squad of the detail answer.
   * @param squad - A squad the person is in.
   * @returns Its ID, name and whether the venue is saved there.
   */
  private toSavedIn(squad: SavedIn): ISavedIn {
    return { saved: squad.saved, squadId: squad.squadID, squadName: squad.squadName }
  }

  /**
   * Turns Google's types into tags: the generic ones go, the rest read as words.
   * @param types - Google place types, such as night_club.
   * @returns At most three tags, such as "Night club".
   */
  private toTags(types: string[]): string[] {
    return types
      .filter((type) => !GENERIC_TYPES.has(type))
      .slice(0, MAX_TAGS)
      .map((type) => {
        const words = type.replaceAll('_', ' ')

        return `${words.slice(0, 1).toUpperCase()}${words.slice(1)}`
      })
  }

  /**
   * Picks today's line of the opening hours and drops the day's name from it.
   * @param lines - The week, Monday first, as Google words it.
   * @param now - The current time in milliseconds.
   * @returns The hours, or undefined when there is no line for today.
   */
  private hoursOn(lines: string[], now: number): string | undefined {
    const line = lines[(new Date(now).getDay() + FROM_SUNDAY) % WEEK]

    if (line === undefined) return undefined

    const at = line.indexOf(DAY_SEPARATOR)

    return at === -1 ? line : line.slice(at + DAY_SEPARATOR.length)
  }
}
