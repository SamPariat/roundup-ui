import { QueryClient } from '@tanstack/react-query'
import { PixelRatio } from 'react-native'

import { getGetVenueQueryKey, getListFavoritesQueryKey } from '@roundup/api'

import { Venues } from '../../src/helpers/venues'
import { VenueFixtures } from './venue-fixtures'

/** The wall clock the hours tests use: Wednesday, 11 November 2026, at noon local time. */
const WEDNESDAY = new Date(2026, 10, 11, 12).getTime()

/** The helpers under test, on a client that never garbage-collects (its timer would keep Jest alive). */
const queryClient = new QueryClient({ defaultOptions: { queries: { gcTime: Infinity } } })
const venues = new Venues(queryClient)

describe('Venues', () => {
  beforeEach(() => {
    jest.spyOn(PixelRatio, 'get').mockReturnValue(2)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Venues.photoUrl', () => {
    it.each([
      [1, 400, 400],
      [2, 400, 800],
      [3, 400, 1200],
      [3, 570, 1600],
      [1, 280, 400],
      [2, 280, 600],
      [1, 100, 200],
    ])(
      'on a x%i screen a %i point slot asks for %i pixels, a width the cache repeats',
      (ratio, slot, width) => {
        jest.spyOn(PixelRatio, 'get').mockReturnValue(ratio)

        expect(venues.photoUrl('/api/v1/venues/photos/ref1', slot)).toBe(
          `http://localhost:8080/api/v1/venues/photos/ref1?maxWidth=${width}`,
        )
      },
    )

    it('encodes the reference so it stays one path segment', () => {
      expect(venues.photoUrl('/api/v1/venues/photos/a b?c', 400)).toContain(
        '/photos/a%20b%3Fc?maxWidth=',
      )
    })

    it.each(['/media/ref1', '/api/v1/venues/photos/', ''])(
      'leaves %j as it is, unsized, when it holds no photo reference',
      (path) => {
        expect(venues.photoUrl(path, 400)).toBe(`http://localhost:8080${path}`)
      },
    )
  })

  describe('Venues.toCard', () => {
    it('maps a search result onto card props with an absolute photo URL and readable tags', () => {
      expect(venues.toCard(VenueFixtures.venue('v1'))).toEqual({
        address: 'v1 MG Road',
        id: 'v1',
        isOpen: true,
        name: 'Venue v1',
        photo: 'http://localhost:8080/api/v1/venues/photos/v1?maxWidth=800',
        priceLevel: 2,
        rating: 4.5,
        reviews: 120,
        types: ['Bar', 'Night club'],
      })
    })

    it('leaves out what the API does not know', () => {
      const card = venues.toCard(
        VenueFixtures.venue('v2', {
          address: '',
          averageRating: 0,
          isOpen: null,
          photos: [],
          priceLevel: 0,
          ratingCount: 0,
          types: ['point_of_interest'],
        }),
      )

      expect(card).toEqual({ id: 'v2', name: 'Venue v2', priceLevel: 0, types: [] })
    })

    it('treats a price level outside 0 to 4 as unknown', () => {
      expect(venues.toCard(VenueFixtures.venue('v3', { priceLevel: 9 })).priceLevel).toBe(0)
    })

    it('shows at most three tags', () => {
      const card = venues.toCard(
        VenueFixtures.venue('v4', { types: ['bar', 'cafe', 'restaurant', 'night_club'] }),
      )

      expect(card.types).toEqual(['Bar', 'Cafe', 'Restaurant'])
    })

    it('keeps an open status of false', () => {
      expect(venues.toCard(VenueFixtures.venue('v5', { isOpen: false })).isOpen).toBe(false)
    })
  })

  describe('Venues.toFavorite', () => {
    it('maps a favorite onto a row with a thumbnail, its savers and the day it was saved', () => {
      expect(venues.toFavorite(VenueFixtures.favorite('v1'), 'u1')).toEqual({
        address: 'v1 MG Road',
        id: 'v1',
        name: 'Venue v1',
        photo: 'http://localhost:8080/api/v1/venues/photos/v1?maxWidth=200',
        priceLevel: 2,
        rating: 4.5,
        reviews: 120,
        savedByMe: false,
        savedOn: '18 Oct',
        savers: [{ id: 'u2', isMe: false, name: 'Meera' }],
      })
    })

    it('leaves out what the API does not know and marks the signed-in saver', () => {
      const row = venues.toFavorite(
        VenueFixtures.favorite('v1', {
          address: '',
          averageRating: 0,
          photo: null,
          savedBy: [{ avatarURL: '', name: '', userID: 'u1' }],
        }),
        'u1',
      )

      expect(row).not.toHaveProperty('address')
      expect(row).not.toHaveProperty('photo')
      expect(row).not.toHaveProperty('rating')
      expect(row.savers).toEqual([{ id: 'u1', isMe: true, name: '' }])
    })
  })

  describe('Venues.toInfo', () => {
    it("adds today's hours without the day, the week, the first review and the squads", () => {
      const info = venues.toInfo(VenueFixtures.detail('v1'), WEDNESDAY)

      expect(info.hoursToday).toBe('5:00 PM – 11:00 PM')
      expect(info.hours).toHaveLength(7)
      expect(info.summary).toBe('A rooftop with a view.')
      expect(info.phone).toBe('+91 80 1234 5678')
      expect(info.website).toBe('https://rooftop.example')

      expect(info.photos).toEqual([
        {
          large: 'http://localhost:8080/api/v1/venues/photos/v1?maxWidth=1200',
          small: 'http://localhost:8080/api/v1/venues/photos/v1?maxWidth=600',
        },
      ])

      expect(info.reviewList).toEqual([
        { author: 'Meera', publishedAt: 'a month ago', rating: 5, text: 'Great views.' },
        { author: 'Kabir', publishedAt: 'a week ago', rating: 3, text: 'Loud.' },
      ])

      expect(info.savedIn).toEqual([
        { saved: true, squadId: 's1', squadName: 'Friday crew' },
        { saved: false, squadId: 's2', squadName: 'Goa trip' },
      ])
    })

    it('picks Sunday, the last line, on a Sunday', () => {
      const sunday = new Date(2026, 10, 15, 12).getTime()

      expect(venues.toInfo(VenueFixtures.detail('v1'), sunday).hoursToday).toBe('Closed')
    })

    it('leaves out the empty fields and the hours when there are none', () => {
      const info = venues.toInfo(
        VenueFixtures.detail('v1', {
          editorialSummary: '',
          openingHours: [],
          phoneNumber: '',
          reviews: [],
          website: '',
        }),
        WEDNESDAY,
      )

      expect(info).not.toHaveProperty('summary')
      expect(info).not.toHaveProperty('hoursToday')
      expect(info).not.toHaveProperty('phone')
      expect(info).not.toHaveProperty('website')
      expect(info.reviewList).toEqual([])
      expect(info.hours).toEqual([])
    })
  })

  describe('Venues.saved', () => {
    it("marks the venue and the squad's favorites as out of date", async () => {
      queryClient.setQueryData(getGetVenueQueryKey('v1'), { data: {} })
      queryClient.setQueryData(getListFavoritesQueryKey('s1'), { data: {} })

      await venues.saved('v1', 's1')

      expect(queryClient.getQueryState(getGetVenueQueryKey('v1'))?.isInvalidated).toBe(true)
      expect(queryClient.getQueryState(getListFavoritesQueryKey('s1'))?.isInvalidated).toBe(true)
    })
  })
})
