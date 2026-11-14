import { HttpStatus } from '@roundup/core'

import type { IStubMember } from './squad-backend'
import type { IVenueState } from './venue-backend'

/** A suggested place of a stubbed event. */
export interface IStubNomination {
  /** The place's ID. */
  id: string
  /** The place's name. */
  name: string
  /** The user who suggested it. */
  by: string
}

/** An event the stubbed backend holds. */
export interface IStubEvent {
  /** The event's ID. */
  id: string
  /** The squad it belongs to. */
  squadId: string
  /** The event's name. */
  name: string
  /** DRINKS, DINING or BOTH. */
  type: string
  /** DRAFT, VOTING, CONFIRMED, ACTIVE or CLOSED. */
  status: string
  /** The user who started it. */
  createdBy: string
  /** When it starts, as an ISO string. */
  startsAt: string
  /** When voting closes, as an ISO string. */
  votingDeadline: string
  /** When it closed, as an ISO string, once closed. */
  closedAt?: string
  /** True once the person has voted. */
  hasVoted?: boolean
  /** What each member answered, by user ID. */
  answers: Record<string, string>
  /** The places suggested. */
  nominations: IStubNomination[]
}

/** What the event routes need from the test's backend. */
export interface IEventState extends IVenueState {
  /** The events on the "server"; the routes change them. */
  events?: IStubEvent[]
  /** How many events a page holds. Defaults to 25. */
  eventPageSize?: number
  /** The status an answer gets, to make it fail; it succeeds when left out. */
  rsvpStatus?: number
  /** True to make the start-voting route hang, so its button stays busy. */
  hangStart?: boolean
  /** True to make the create route hang, so its button stays busy. */
  hangCreate?: boolean
}

/** The signed-in person. */
const ME = 'u1'

/**
 * Stubbed event routes over the events a test gives. State lives in the backend object, so a test
 * sees what the app changed. Static methods only.
 */
export class EventBackend {
  /**
   * Answers an event list, create, read, answer, take-back or start-voting request.
   * @param method - The request method.
   * @param path - The path with its query.
   * @param body - The parsed request body, if any.
   * @param state - The events and the squads.
   * @returns The response, a promise of one for a hanging route, or undefined when the path is not an event route.
   */
  static answer(
    method: string,
    path: string,
    body: Record<string, string> | undefined,
    state: IEventState,
  ): Promise<Response> | Response | undefined {
    const [pathname = '', query = ''] = path.split('?')
    const events = (state.events ??= [])
    const inSquad = /^\/api\/v1\/squads\/([^/]+)\/events$/.exec(pathname)

    if (inSquad !== null) {
      const [, squadId = ''] = inSquad

      if (method === 'POST') return EventBackend.create(state, squadId, body)

      return EventBackend.list(state, squadId, new URLSearchParams(query))
    }

    const one = /^\/api\/v1\/events\/([^/]+)(?:\/(.+))?$/.exec(pathname)

    if (one === null) return undefined

    const [, id = '', section] = one
    const event = events.find((candidate) => candidate.id === id)

    if (event === undefined) return EventBackend.failure(HttpStatus.notFound)

    return EventBackend.act(state, event, { body, method, section })
  }

  /**
   * A request that never answers.
   * @returns A promise that stays pending.
   */
  private static hang(): Promise<boolean> {
    return new Promise<boolean>(() => false)
  }

  /**
   * Builds the success envelope.
   * @param data - The payload.
   * @param status - The HTTP status.
   * @returns The response.
   */
  private static ok(data: unknown, status: number = HttpStatus.ok): Response {
    return Response.json({ data, success: true }, { status })
  }

  /**
   * Builds the failure envelope.
   * @param status - The HTTP status.
   * @returns The response.
   */
  private static failure(status: number): Response {
    return Response.json({ error: 'nope', success: false }, { status })
  }

  /**
   * Builds an event as the API sends it.
   * @param event - The stubbed event.
   * @returns The event's own fields.
   */
  private static base(event: IStubEvent): Record<string, unknown> {
    return {
      closedAt: event.closedAt ?? null,
      createdAt: '2026-01-01T00:00:00Z',
      createdBy: event.createdBy,
      id: event.id,
      name: event.name,
      squadID: event.squadId,
      startsAt: event.startsAt,
      status: event.status,
      type: event.type,
      votingDeadline: event.votingDeadline,
      winner: null,
    }
  }

  /**
   * Builds a user as the API sends a member.
   * @param id - The user's ID.
   * @param name - The user's name.
   * @returns The ID, name and photo of the member.
   */
  private static member(id: string, name: string): Record<string, string> {
    return { avatarURL: '', name, userID: id }
  }

  /**
   * Builds a list item for an event, from the signed-in person's point of view.
   * @param state - The squads, which name the members.
   * @param event - The stubbed event.
   * @returns The list item.
   */
  private static summary(state: IEventState, event: IStubEvent): Record<string, unknown> {
    const members = EventBackend.members(state, event)

    return {
      ...EventBackend.base(event),
      goingPreview: members
        .filter((member) => event.answers[member.id] === 'GOING')
        .slice(0, 5)
        .map((member) => EventBackend.member(member.id, member.name)),
      hasVoted: event.hasVoted ?? false,
      myRsvp: event.answers[ME] ?? null,
      nominationCount: event.nominations.length,
      rsvpCounts: {
        going: EventBackend.answered(members, event, 'GOING'),
        maybe: EventBackend.answered(members, event, 'MAYBE'),
        notGoing: EventBackend.answered(members, event, 'NOT_GOING'),
        pending: members.filter((member) => event.answers[member.id] === undefined).length,
      },
    }
  }

  /**
   * Counts the members who gave an answer.
   * @param members - The members of the event's squad.
   * @param event - The stubbed event.
   * @param status - The answer to count.
   * @returns How many gave it.
   */
  private static answered(
    members: readonly {
      /**
       *
       */
      id: string
    }[],
    event: IStubEvent,
    status: string,
  ): number {
    return members.filter((member) => event.answers[member.id] === status).length
  }

  /**
   * The members of the event's squad.
   * @param state - The squads.
   * @param event - The stubbed event.
   * @returns Each member's ID and name.
   */
  private static members(state: IEventState, event: IStubEvent): IStubMember[] {
    return state.squads?.find((squad) => squad.id === event.squadId)?.members ?? []
  }

  /**
   * Builds an event's detail, from the signed-in person's point of view.
   * @param state - The squads.
   * @param event - The stubbed event.
   * @returns The detail with members, places and permissions.
   */
  private static detail(state: IEventState, event: IStubEvent): Record<string, unknown> {
    const draft = event.status === 'DRAFT'
    const creator = event.createdBy === ME
    const members = EventBackend.members(state, event)

    return {
      ...EventBackend.base(event),
      createdByName: members.find((member) => member.id === event.createdBy)?.name ?? null,
      memberCount: members.length,
      members: members.map((member) => ({
        ...EventBackend.member(member.id, member.name),
        isMe: member.id === ME,
        rsvp: event.answers[member.id] ?? null,
      })),
      myRsvp: event.answers[ME] ?? null,
      nominations: event.nominations.map((nomination) => ({
        canRemove: draft && (creator || nomination.by === ME),
        name: nomination.name,
        nominatedBy: nomination.by,
        nominatedByName: members.find((member) => member.id === nomination.by)?.name ?? null,
        placeID: nomination.id,
        priceLevel: 2,
        rating: 4.5,
      })),
      permissions: {
        canRsvp: event.status !== 'CLOSED',
        canStartVoting: draft && creator && event.nominations.length > 0,
      },
      votedCount: 0,
    }
  }

  /**
   * Answers the event list: open events soonest first, then closed ones, a page at a time, where the cursor is
   * the index the page starts at.
   * @param state - The events and squads.
   * @param squadId - The squad whose events are asked for.
   * @param query - The request's query.
   * @returns The page.
   */
  private static list(state: IEventState, squadId: string, query: URLSearchParams): Response {
    const mine = (state.events ?? []).filter((event) => event.squadId === squadId)
    const open = mine.filter((event) => event.status !== 'CLOSED')
    const closed = mine.filter((event) => event.status === 'CLOSED')
    const soonest = [...open].sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    const ordered = [...soonest, ...closed]
    const size = state.eventPageSize ?? 25
    const start = Number(query.get('cursor') ?? 0)

    return EventBackend.ok({
      events: ordered.slice(start, start + size).map((event) => EventBackend.summary(state, event)),
      nextCursor: start + size < ordered.length ? String(start + size) : null,
      openCount: open.length,
    })
  }

  /**
   * Makes a draft event started by the signed-in person.
   * @param state - The events; the new one is added.
   * @param squadId - The squad it is for.
   * @param body - The request body.
   * @returns The created event, or a 400 for a blank name.
   */
  private static async create(
    state: IEventState,
    squadId: string,
    body: Record<string, string> | undefined,
  ): Promise<Response> {
    if (state.hangCreate === true) await EventBackend.hang()

    if ((body?.['name'] ?? '').trim() === '') return EventBackend.failure(HttpStatus.badRequest)

    const startsAt = body?.['startsAt'] ?? ''

    const event: IStubEvent = {
      answers: {},
      createdBy: ME,
      id: `new-${(state.events ?? []).length + 1}`,
      name: body?.['name'] ?? '',
      nominations: [],
      squadId,
      startsAt,
      status: 'DRAFT',
      type: body?.['type'] ?? 'DRINKS',
      votingDeadline: body?.['votingDeadline'] ?? startsAt,
    }

    state.events = [...(state.events ?? []), event]

    return EventBackend.ok(EventBackend.base(event), HttpStatus.created)
  }

  /**
   * Answers a read of an event, or one of the changes to it.
   * @param state - The events and squads.
   * @param event - The stubbed event the request is about.
   * @param request - The method, the path below the event and the body.
   * @param request.body - The parsed request body.
   * @param request.method - GET, PUT, POST or DELETE.
   * @param request.section - What follows the event's ID in the path, if anything.
   * @returns The event's detail after the change.
   */
  private static async act(
    state: IEventState,
    event: IStubEvent,
    request: {
      /** The parsed request body. */
      body: Record<string, string> | undefined
      /** The request method. */
      method: string
      /** What follows the event's ID in the path. */
      section: string | undefined
    },
  ): Promise<Response> {
    const { body, method, section } = request

    if (section === 'rsvp') {
      if (state.rsvpStatus !== undefined) return EventBackend.failure(state.rsvpStatus)

      event.answers[ME] = body?.['status'] ?? ''
    }

    if (section === 'voting/start') {
      if (state.hangStart === true) await EventBackend.hang()

      if (event.nominations.length === 0) return EventBackend.failure(HttpStatus.conflict)

      event.status = 'VOTING'
    }

    if (method === 'DELETE' && section?.startsWith('nominations/') === true) {
      event.nominations = event.nominations.filter(
        (nomination) => nomination.id !== section.replace('nominations/', ''),
      )
    }

    return EventBackend.ok(EventBackend.detail(state, event))
  }
}
