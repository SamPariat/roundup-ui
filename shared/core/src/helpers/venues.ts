import type { QueryClient } from '@tanstack/react-query'

import { PixelRatio } from 'react-native'

import type { Review, SavedIn, Venue, VenueDetail } from '@roundup/api'

import {
  ApiUrl,
  getGetVenuePhotoUrl,
  getGetVenueQueryKey,
  getListFavoritesQueryKey,
} from '@roundup/api'

import type {
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

/** What separates the day from the hours in Google's lines, such as "Monday: 5:00 PM – 11:00 PM". */
const DAY_SEPARATOR = ': '

/**
 * The widths the photo endpoint is asked for, in pixels, so the same few URLs repeat and the
 * cache answers. The API serves 800 when none is asked for and caps at 1600.
 */
const PHOTO_WIDTHS: readonly number[] = [200, 400, 600, 800, 1200, 1600]

/** The widest the photo endpoint serves, which a bigger need is cut to. */
const MAX_PHOTO_WIDTH = 1600

/** How wide each slot a photo fills is, in points: a card or the header, and the page's two tiles. */
const PHOTO_SLOT = { card: 400, large: 570, small: 280 } as const

/** What separates the API's photo path from the reference the photo endpoint takes. */
const PHOTO_PATH = '/photos/'

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
      ...(photo === undefined ? {} : { photo: this.photoUrl(photo.url, PHOTO_SLOT.card) }),
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
      photos: detail.photos.map((photo) => this.toPhoto(photo.url)),
      reviewList: detail.reviews.map((review) => this.toReview(review)),
      savedIn: detail.savedIn.map((squad) => this.toSavedIn(squad)),
      ...(detail.editorialSummary === '' ? {} : { summary: detail.editorialSummary }),
      ...(today === undefined ? {} : { hoursToday: today }),
      ...(detail.phoneNumber === '' ? {} : { phone: detail.phoneNumber }),
      ...(detail.website === '' ? {} : { website: detail.website }),
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
   * Builds the URL of a photo at the width a slot needs on this screen: the slot in points times the
   * pixel ratio, rounded up to the next width in PHOTO_WIDTHS, so no photo is fetched larger than
   * it is drawn.
   * @param url - The photo's path as the API sends it, ending in its reference.
   * @param slot - How wide the slot is, in points.
   * @returns The absolute URL, with `maxWidth` set.
   */
  photoUrl(url: string, slot: number): string {
    const wanted = slot * PixelRatio.get()
    const maxWidth = PHOTO_WIDTHS.find((width) => width >= wanted) ?? MAX_PHOTO_WIDTH
    const ref = url.slice(url.lastIndexOf(PHOTO_PATH) + PHOTO_PATH.length)

    return ApiUrl.of(getGetVenuePhotoUrl(ref, { maxWidth }))
  }

  /**
   * Maps one photo of the detail answer to the sizes of the page's tiles.
   * @param url - The photo's path as the API sends it.
   * @returns Its large and small URLs.
   */
  private toPhoto(url: string): IVenuePhoto {
    return {
      large: this.photoUrl(url, PHOTO_SLOT.large),
      small: this.photoUrl(url, PHOTO_SLOT.small),
    }
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
