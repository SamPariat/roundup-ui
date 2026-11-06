import type { QueryClient } from '@tanstack/react-query'

import type {
  SquadDetail,
  SquadDetailMembersItem,
  SquadMember,
  SquadSummary,
  UserSummary,
} from '@roundup/api'

import { getGetSquadQueryKey, getListSquadsQueryKey } from '@roundup/api'

import type {
  IContactMatch,
  ISquadCard,
  ISquadInfo,
  ISquadMember,
  ISquadPermissions,
  ISquadPerson,
} from '../squads/types'

/**
 * Squad mapping and cache helpers. Static methods only. After a write the cached list and detail
 * are invalidated rather than edited by hand, so counts, previews, roles and permissions always
 * come from the server.
 */
export class Squads {
  /**
   * Maps a list item onto the card the UI draws.
   * @param summary - The list item.
   * @returns The card with the members as avatars.
   */
  static toCard(summary: SquadSummary): ISquadCard {
    return {
      id: summary.id,
      memberCount: summary.memberCount,
      members: summary.memberPreview.map((member) => Squads.toPerson(member)),
      name: summary.name,
      role: summary.role,
      ...Squads.optional('avatarURL', summary.avatarURL),
    }
  }

  /**
   * Maps the squad of a detail answer onto the header's data.
   * @param detail - The detail answer.
   * @returns The squad.
   */
  static toInfo(detail: SquadDetail): ISquadInfo {
    return {
      id: detail.id,
      memberCount: detail.memberCount,
      name: detail.name,
      ...Squads.optional('avatarURL', detail.avatarURL),
    }
  }

  /**
   * Maps a member of a detail answer onto a row.
   * @param member - A member from the detail answer.
   * @returns The row.
   */
  static toMember(member: SquadDetailMembersItem): ISquadMember {
    return { ...Squads.toPerson(member), isMe: member.isMe, role: member.role }
  }

  /**
   * Maps a lookup result onto a contact that can be added.
   * @param user - The user the lookup found.
   * @returns The contact with their E.164 number.
   */
  static toMatch(user: UserSummary): IContactMatch {
    return {
      id: user.id,
      name: user.name,
      phone: user.phone,
      ...Squads.optional('src', user.avatarURL),
    }
  }

  /**
   * Maps the permissions of a detail answer.
   * @param detail - The detail answer.
   * @returns The four things the person may do.
   */
  static toPermissions(detail: SquadDetail): ISquadPermissions {
    const { canAddMembers, canChangeRoles, canEditSquad, canRemoveMembers } = detail.permissions

    return { canAddMembers, canChangeRoles, canEditSquad, canRemoveMembers }
  }

  /**
   * Marks the squad list, and one squad's detail when given, as out of date. Whatever is on screen
   * loads again, and this waits for it, so a modal closes onto fresh data; the rest loads when next
   * shown.
   * @param queryClient - The cache.
   * @param squadId - The squad whose detail changed; leave out when only the list did.
   */
  static async changed(queryClient: QueryClient, squadId?: string): Promise<void> {
    const detail =
      squadId === undefined
        ? []
        : [queryClient.invalidateQueries({ queryKey: getGetSquadQueryKey(squadId) })]

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: getListSquadsQueryKey() }),
      ...detail,
    ])
  }

  /**
   * Forgets a squad the person has left: drops its detail, which would now answer 404, and loads
   * the list again.
   * @param queryClient - The cache.
   * @param squadId - The squad that was left.
   */
  static async left(queryClient: QueryClient, squadId: string): Promise<void> {
    queryClient.removeQueries({ queryKey: getGetSquadQueryKey(squadId) })
    await queryClient.invalidateQueries({ queryKey: getListSquadsQueryKey() })
  }

  /**
   * Maps a member to the person an avatar draws.
   * @param member - A squad member.
   * @returns The ID, name and photo an avatar needs.
   */
  private static toPerson(member: SquadMember): ISquadPerson {
    return { id: member.userID, name: member.name, ...Squads.optional('src', member.avatarURL) }
  }

  /**
   * Builds an optional property from a URL the API sends as an empty string when unset, so the key
   * is left out instead of set to undefined.
   * @param key - The property name.
   * @param value - The URL, possibly empty.
   * @returns The property, or nothing.
   */
  private static optional<K extends string>(key: K, value: string): Partial<Record<K, string>> {
    return value === '' ? {} : ({ [key]: value } as Record<K, string>)
  }
}
