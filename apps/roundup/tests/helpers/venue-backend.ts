import { HttpStatus } from '@roundup/core'

import type { ISquadState } from './squad-backend'

/** A venue the stubbed backend holds. */
export interface IStubVenue {
  /** The Google place ID. */
  id: string
  /** The venue's name, which a search by words matches. */
  name: string
  /** Its Google types, which a search by type matches. */
  types: string[]
}

/** What the venue routes need from the test's backend. */
export interface IVenueState extends ISquadState {
  /** The venues on the "server". */
  venues?: IStubVenue[]
  /** The squads each venue is saved in, by place ID; the routes change it. */
  saved?: Record<string, string[]>
  /** How many venues a search page holds. Defaults to 20, as Google's does. */
  pageSize?: number
  /** The status an unsave answers with, to make it fail; it succeeds when left out. */
  unsaveStatus?: number
}

/** Where the search routes are mounted. */
const VENUES = '/api/v1/venues'

/**
 * Stubbed venue and favorite routes over the venues a test gives. State lives in the backend
 * object, so a test sees what the app saved. Static methods only.
 */
export class VenueBackend {
  /**
   * Answers a search, a venue read, a save or an unsave.
   * @param method - The request method.
   * @param path - The path with its query.
   * @param body - The parsed request body, if any.
   * @param state - The venues, the saved venues and the squads.
   * @returns The response, or undefined when the path is not a venue or favorite route.
   */
  static answer(
    method: string,
    path: string,
    body: Record<string, string> | undefined,
    state: IVenueState,
  ): Response | undefined {
    const [pathname = '', query = ''] = path.split('?')

    if (pathname === VENUES) return VenueBackend.search(state, new URLSearchParams(query))

    if (pathname.startsWith(`${VENUES}/`)) {
      return VenueBackend.one(state, pathname.slice(VENUES.length + 1))
    }

    const favorite = /^\/api\/v1\/squads\/([^/]+)\/favorites(?:\/([^/]+))?$/.exec(pathname)

    if (favorite === null) return undefined

    const [, squadId = '', placeId] = favorite

    return VenueBackend.favorite(state, { body, method, placeId, squadId })
  }

  /**
   * Builds the success envelope.
   * @param data - The payload.
   * @returns The response.
   */
  private static ok(data: unknown): Response {
    return Response.json({ data, success: true }, { status: HttpStatus.ok })
  }

  /**
   * Builds a venue as the API sends one in a search.
   * @param venue - The stubbed venue.
   * @returns The API venue: rated 4.5 by 120, open, priced 2.
   */
  private static venue(venue: IStubVenue): Record<string, unknown> {
    return {
      address: `${venue.name} Road`,
      averageRating: 4.5,
      isOpen: true,
      latitude: 12.97,
      longitude: 77.59,
      name: venue.name,
      photos: [],
      placeID: venue.id,
      priceLevel: 2,
      ratingCount: 120,
      types: venue.types,
    }
  }

  /**
   * Answers a search: the venues whose name has the words and whose types have the type, a page at
   * a time, where the cursor is the index the page starts at.
   * @param state - The venues.
   * @param query - The request's query.
   * @returns The page.
   */
  private static search(state: IVenueState, query: URLSearchParams): Response {
    const words = (query.get('query') ?? '').toLowerCase()
    const type = query.get('type')
    const size = state.pageSize ?? 20
    const start = Number(query.get('cursor') ?? 0)

    const matches = (state.venues ?? []).filter(
      (venue) =>
        venue.name.toLowerCase().includes(words) && (type === null || venue.types.includes(type)),
    )

    return VenueBackend.ok({
      nextCursor: start + size < matches.length ? String(start + size) : null,
      venues: matches.slice(start, start + size).map((venue) => VenueBackend.venue(venue)),
    })
  }

  /**
   * Answers a venue's detail, with one savedIn entry per squad the signed-in person is in.
   * @param state - The venues, the saved venues and the squads.
   * @param placeId - The venue asked for.
   * @returns The detail, or a 404.
   */
  private static one(state: IVenueState, placeId: string): Response {
    const venue = (state.venues ?? []).find((candidate) => candidate.id === placeId)

    if (venue === undefined) {
      return Response.json(
        { error: 'venue not found', success: false },
        { status: HttpStatus.notFound },
      )
    }

    return VenueBackend.ok({
      ...VenueBackend.venue(venue),
      editorialSummary: 'A place with a view.',
      openingHours: [
        'Monday: 5:00 PM – 11:00 PM',
        'Tuesday: 5:00 PM – 11:00 PM',
        'Wednesday: 5:00 PM – 11:00 PM',
        'Thursday: 5:00 PM – 11:00 PM',
        'Friday: 5:00 PM – 1:00 AM',
        'Saturday: 4:00 PM – 1:00 AM',
        'Sunday: 4:00 PM – 11:00 PM',
      ],
      phoneNumber: '+91 80 1234 5678',
      reviews: [
        { authorName: 'Meera', publishedAt: 'a month ago', rating: 5, text: 'Great views.' },
      ],
      savedIn: (state.squads ?? []).map((squad) => ({
        saved: (state.saved?.[placeId] ?? []).includes(squad.id),
        squadID: squad.id,
        squadName: squad.name,
      })),
      website: 'https://venue.example',
    })
  }

  /**
   * Answers the list of a squad's favorites: the venues saved in it, each saved by Meera and by the
   * signed-in person, in one page.
   * @param state - The venues and the saved venues.
   * @param squadId - The squad in the path.
   * @returns The page.
   */
  private static favorites(state: IVenueState, squadId: string): Response {
    const saved = Object.entries(state.saved ?? {}).filter(([, squads]) => squads.includes(squadId))

    const favorites = saved.flatMap(([placeId]) => {
      const venue = (state.venues ?? []).find((candidate) => candidate.id === placeId)

      if (venue === undefined) return []

      return [
        {
          address: `${venue.name} Road`,
          averageRating: 4.5,
          lastSavedAt: '2026-10-18T10:00:00Z',
          name: venue.name,
          photo: null,
          placeID: venue.id,
          priceLevel: 2,
          ratingCount: 120,
          savedBy: [
            { avatarURL: '', name: 'Asha Rao', userID: 'u1' },
            { avatarURL: '', name: 'Meera', userID: 'u2' },
          ],
          savedByMe: true,
        },
      ]
    })

    return VenueBackend.ok({ favorites, nextCursor: null })
  }

  /**
   * Answers a save (POST) or an unsave (DELETE) of a venue for a squad.
   * @param state - The saved venues.
   * @param request - The method, the squad, the venue of an unsave and the body of a save.
   * @param request.body - The parsed request body.
   * @param request.method - POST or DELETE.
   * @param request.placeId - The venue in the path of an unsave.
   * @param request.squadId - The squad in the path.
   * @returns A 204.
   */
  private static favorite(
    state: IVenueState,
    request: {
      /** The parsed request body. */
      body: Record<string, string> | undefined
      /** POST or DELETE. */
      method: string
      /** The venue in the path of an unsave. */
      placeId: string | undefined
      /** The squad in the path. */
      squadId: string
    },
  ): Response {
    const saved = (state.saved ??= {})
    const { body, method, placeId = body?.['placeID'] ?? '', squadId } = request

    if (method === 'GET') return VenueBackend.favorites(state, squadId)

    if (method === 'DELETE' && state.unsaveStatus !== undefined) {
      return Response.json({ error: 'nope', success: false }, { status: state.unsaveStatus })
    }

    const squads = saved[placeId] ?? []

    saved[placeId] =
      method === 'POST' ? [...squads, squadId] : squads.filter((candidate) => candidate !== squadId)

    return new Response(null, { status: HttpStatus.noContent })
  }
}
