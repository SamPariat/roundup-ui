import type { EventStatus, EventType, RSVPStatus } from '@roundup/api'

import type { ISquadPerson } from '../squads/types'
import type { TPriceLevel } from '../venues/types'

/** How many members answered each way, and how many have not. */
export interface IRsvpCounts {
  /** Members who said they are going. */
  going: number
  /** Members who said maybe. */
  maybe: number
  /** Members who said they cannot make it. */
  notGoing: number
  /** Members who have not answered. */
  pending: number
}

/** One event of a squad, as the Events tab draws it. */
export interface IEventCard {
  /** The event's ID. */
  id: string
  /** The squad it belongs to. */
  squadId: string
  /** The event's name. */
  name: string
  /** Drinks, dinner or both. */
  type: EventType
  /** Where it is in its life: planning, voting, confirmed, tonight or closed. */
  status: EventStatus
  /** When it starts, as the API sends it, which orders events. */
  startsAt: string
  /** When it starts, such as "Sat 31 Oct, 8:00 pm". */
  when: string
  /** When voting closes, such as "Thu 29 Oct, 9:00 pm". */
  votingCloses: string
  /** The place the squad chose; left out until one is. */
  winner?: IEventWinner
  /** When it closed, such as "17 Oct"; left out while it is open. */
  closedOn?: string
  /** How many places were suggested. */
  nominationCount: number
  /** How many answered each way. */
  rsvpCounts: IRsvpCounts
  /** Up to five members who are going. */
  going: ISquadPerson[]
  /** The signed-in person's answer; left out while they have not answered. */
  myRsvp?: RSVPStatus
  /** True when the signed-in person has voted. */
  hasVoted: boolean
  /** True while the event is open and the person has yet to answer, or has yet to vote in it. */
  needsAnswer: boolean
}

/** The place an event ended up at. */
export interface IEventWinner {
  /** The place's name. */
  name: string
  /** Its street address; left out when empty. */
  address?: string
}

/** A member as an event lists them. */
export interface IEventMember extends ISquadPerson {
  /** True for the signed-in person. */
  isMe: boolean
  /** Their answer; left out while they have not answered. */
  rsvp?: RSVPStatus
}

/** A place suggested for an event. */
export interface IEventNomination {
  /** The place's Google ID. */
  id: string
  /** The place's name. */
  name: string
  /** Who suggested it; left out when they have left the squad. */
  nominatedByName?: string
  /** True when the signed-in person suggested it. */
  nominatedByMe: boolean
  /** The average rating; left out when unrated. */
  rating?: number
  /** The Google price level, 0 when unknown. */
  priceLevel: TPriceLevel
  /** True when the signed-in person may take the suggestion back. */
  canRemove: boolean
}

/** What the signed-in person may do in an event right now. */
export interface IEventPermissions {
  /** May answer going, maybe or not going. */
  canRsvp: boolean
  /** May start voting. */
  canStartVoting: boolean
}

/** Everything an event's page shows. */
export interface IEventInfo {
  /** The event's ID. */
  id: string
  /** The squad it belongs to. */
  squadId: string
  /** The event's name. */
  name: string
  /** Drinks, dinner or both. */
  type: EventType
  /** Where it is in its life. */
  status: EventStatus
  /** When it starts, such as "Sat 31 Oct, 8:00 pm". */
  when: string
  /** When voting closes, such as "Thu 29 Oct, 9:00 pm". */
  votingCloses: string
  /** Who started it; left out when they have left the squad. */
  createdByName?: string
  /** True when the signed-in person started it. */
  createdByMe: boolean
  /** The signed-in person's answer; left out while they have not answered. */
  myRsvp?: RSVPStatus
  /** The members who are going, for the avatars. */
  going: ISquadPerson[]
  /** How many answered each way. */
  rsvpCounts: IRsvpCounts
  /** The places suggested so far. */
  nominations: IEventNomination[]
  /** What the signed-in person may do. */
  permissions: IEventPermissions
}
