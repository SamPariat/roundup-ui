import type { SearchVenues200, Venue, VenueDetail } from '@roundup/api'

import type { ITestCore } from './wrapper'

import { FakeLocation } from './fakes'
import { TestCore } from './wrapper'

/** The search URL of the fake location (Bengaluru) with no words or type. */
const BASE = '/api/v1/venues?lat=12.9716&lng=77.5946&radius=3000'

/**
 * Venue data and cores for the venue tests. Static methods only.
 */
export class VenueFixtures {
  /** The first page's route, to which a test adds a query or a cursor. */
  static readonly base = BASE

  /**
   * Builds a search result.
   * @param id - Which venue; the name is built from it.
   * @param overrides - Fields to change.
   * @returns A rated, open bar with one photo.
   */
  static venue(id: string, overrides: Partial<Venue> = {}): Venue {
    return {
      address: `${id} MG Road`,
      averageRating: 4.5,
      isOpen: true,
      latitude: 12.97,
      longitude: 77.59,
      name: `Venue ${id}`,
      photos: [{ height: 800, url: `/api/v1/venues/photos/${id}`, width: 1200 }],
      placeID: id,
      priceLevel: 2,
      ratingCount: 120,
      types: ['bar', 'point_of_interest', 'night_club', 'establishment'],
      ...overrides,
    }
  }

  /**
   * Builds a venue's detail answer.
   * @param id - Which venue.
   * @param overrides - Fields to change.
   * @returns A venue with hours, a review, a summary and two squads, saved in the first.
   */
  static detail(id: string, overrides: Partial<VenueDetail> = {}): VenueDetail {
    return {
      ...VenueFixtures.venue(id),
      editorialSummary: 'A rooftop with a view.',
      openingHours: [
        'Monday: 5:00 PM – 11:00 PM',
        'Tuesday: 5:00 PM – 11:00 PM',
        'Wednesday: 5:00 PM – 11:00 PM',
        'Thursday: 5:00 PM – 11:00 PM',
        'Friday: 5:00 PM – 1:00 AM',
        'Saturday: 4:00 PM – 1:00 AM',
        'Sunday: Closed',
      ],
      phoneNumber: '+91 80 1234 5678',
      reviews: [
        { authorName: 'Meera', publishedAt: 'a month ago', rating: 5, text: 'Great views.' },
        { authorName: 'Kabir', publishedAt: 'a week ago', rating: 3, text: 'Loud.' },
      ],
      savedIn: [
        { saved: true, squadID: 's1', squadName: 'Friday crew' },
        { saved: false, squadID: 's2', squadName: 'Goa trip' },
      ],
      website: 'https://rooftop.example',
      ...overrides,
    }
  }

  /**
   * Builds the search answer for one page.
   * @param venues - The page's items.
   * @param nextCursor - The cursor of the next page; null on the last.
   * @returns The answer's data.
   */
  static page(venues: Venue[], nextCursor: null | string = null): SearchVenues200['data'] {
    return { nextCursor, venues }
  }

  /**
   * Starts a core with a saved refresh token and a fake location, so it restores into a signed-in
   * session that knows where it is.
   * @param location - The fake location; granted in Bengaluru by default.
   * @returns The fakes behind a provider that will restore a session.
   */
  static async signedInCore(location = new FakeLocation()): Promise<ITestCore> {
    const core = TestCore.create({ location })

    await core.store.save('r1')

    return core
  }
}
