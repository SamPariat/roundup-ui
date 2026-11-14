import type { Role } from '@roundup/api'

/** A person's role in a squad: ADMIN or MEMBER. */
export type TRole = Role

/** A person as an avatar needs them. Matches the UI's IPerson, without importing it. */
export interface ISquadPerson {
  /** The user's ID. */
  id: string
  /** The name to show. */
  name: string
  /** The photo URL; left out when the person has none. */
  src?: string
}

/** A contact who is on Roundup and can be added. */
export interface IContactMatch extends ISquadPerson {
  /** Their number in E.164, which is what adding them takes. */
  phone: string
}

/** A member of one squad, as the member list shows them. */
export interface ISquadMember extends ISquadPerson {
  /** Their role in the squad. */
  role: TRole
  /** True for the signed-in person's own row. */
  isMe: boolean
}

/** What the signed-in person may do in a squad. */
export interface ISquadPermissions {
  /** May add people. */
  canAddMembers: boolean
  /** May remove someone else. */
  canRemoveMembers: boolean
  /** May make or remove admins. */
  canChangeRoles: boolean
  /** May rename the squad. */
  canEditSquad: boolean
}

/** A squad in the list, shaped as the SquadCard props so the UI can pass it straight through. */
export interface ISquadCard {
  /** The squad's ID. */
  id: string
  /** The squad's name. */
  name: string
  /** The squad's photo URL; left out when it has none. */
  avatarURL?: string
  /** The signed-in person's role in it. */
  role: TRole
  /** How many people are in it. */
  memberCount: number
  /** The first few members, for the avatar stack. */
  members: ISquadPerson[]
}

/** The squad itself, as the detail screen's header needs it. */
export interface ISquadInfo {
  /** The squad's ID. */
  id: string
  /** The squad's name. */
  name: string
  /** The squad's photo URL; left out when it has none. */
  avatarURL?: string
  /** How many people are in it. */
  memberCount: number
  /** The day it was made, such as "11th Nov 2026". */
  createdOn: string
  /** Whether the signed-in person made it. */
  createdByMe: boolean
  /** The name of who made it; left out once they have left or while they have no name. */
  createdByName?: string
}
