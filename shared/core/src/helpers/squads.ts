import type { InfiniteData, QueryClient } from '@tanstack/react-query'

import type {
  GetSquad200,
  ListSquads200,
  Role,
  Squad,
  SquadDetail,
  SquadDetailMembersItem,
  SquadMember,
  SquadSummary,
  UserResponse,
  UserSummary,
} from '@roundup/api'

import { getGetMeQueryKey, getGetSquadQueryKey, getListSquadsQueryKey } from '@roundup/api'

import type {
  IContactMatch,
  ISquadCard,
  ISquadInfo,
  ISquadMember,
  ISquadPermissions,
  ISquadPerson,
} from '../squads/types'

/** How many members a list item previews. */
const MAX_PREVIEW = 4

/** The cached squad list: pages of the list answer, as useInfiniteQuery keeps them. */
type TSquadPages = InfiniteData<ListSquads200, string | undefined>

/**
 * Squad mapping and cache helpers. Static methods only. The list cache holds pages of the list
 * answer under the list key and each detail sits under its own key, so a write updates both by
 * hand and nothing is fetched again.
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
   * Puts a new squad at the front of the cached list. The creator is its only member and an admin;
   * their name and photo come from the cached profile, when it is there.
   * @param queryClient - The cache.
   * @param squad - The squad the server created.
   */
  static created(queryClient: QueryClient, squad: Squad): void {
    const me = queryClient.getQueryData<UserResponse>(getGetMeQueryKey())?.data

    const preview: SquadMember[] =
      me === undefined
        ? []
        : [
            {
              avatarURL: me.avatarURL,
              joinedAt: squad.createdAt,
              name: me.name,
              role: 'ADMIN',
              userID: me.id,
            },
          ]

    const summary: SquadSummary = {
      ...squad,
      memberCount: 1,
      memberPreview: preview,
      role: 'ADMIN',
    }

    Squads.editList(queryClient, (squads, page) => (page === 0 ? [summary, ...squads] : squads))
  }

  /**
   * Applies a rename to the cached detail and the cached list item.
   * @param queryClient - The cache.
   * @param squad - The squad the server returned.
   */
  static renamed(queryClient: QueryClient, squad: Squad): void {
    Squads.editSummary(queryClient, squad.id, (summary) => ({ ...summary, ...squad }))
    Squads.editDetail(queryClient, squad.id, (detail) => ({ ...detail, ...squad }))
  }

  /**
   * Adds a new member to the cached detail, and to the list item's count and preview.
   * @param queryClient - The cache.
   * @param squadId - Which squad's cache to update.
   * @param member - The member the server returned.
   */
  static memberAdded(queryClient: QueryClient, squadId: string, member: SquadMember): void {
    Squads.editSummary(queryClient, squadId, (summary) => ({
      ...summary,
      memberCount: summary.memberCount + 1,
      memberPreview:
        summary.memberPreview.length < MAX_PREVIEW
          ? [...summary.memberPreview, member]
          : summary.memberPreview,
    }))

    Squads.editDetail(queryClient, squadId, (detail) => ({
      ...detail,
      memberCount: detail.memberCount + 1,
      members: [...detail.members, { ...member, isMe: false }],
    }))
  }

  /**
   * Applies a role change to the cached detail and the list item's preview.
   * @param queryClient - The cache.
   * @param squadId - Which squad's cache to update.
   * @param userId - Whose role changed.
   * @param role - Their new role.
   */
  static roleChanged(queryClient: QueryClient, squadId: string, userId: string, role: Role): void {
    Squads.editSummary(queryClient, squadId, (summary) => ({
      ...summary,
      memberPreview: Squads.withRole(summary.memberPreview, userId, role),
    }))

    Squads.editDetail(queryClient, squadId, (detail) => ({
      ...detail,
      members: Squads.withRole(detail.members, userId, role),
    }))
  }

  /**
   * Drops a removed member from the cached detail, and from the list item's count and preview.
   * @param queryClient - The cache.
   * @param squadId - Which squad's cache to update.
   * @param userId - Who was removed.
   */
  static memberRemoved(queryClient: QueryClient, squadId: string, userId: string): void {
    Squads.editSummary(queryClient, squadId, (summary) => ({
      ...summary,
      memberCount: summary.memberCount - 1,
      memberPreview: summary.memberPreview.filter((member) => member.userID !== userId),
    }))

    Squads.editDetail(queryClient, squadId, (detail) => ({
      ...detail,
      memberCount: detail.memberCount - 1,
      members: detail.members.filter((member) => member.userID !== userId),
    }))
  }

  /**
   * Forgets a squad the person has left: drops it from the cached list and the cached detail.
   * @param queryClient - The cache.
   * @param squadId - Which squad's cache to update.
   */
  static left(queryClient: QueryClient, squadId: string): void {
    Squads.editList(queryClient, (squads) => squads.filter((squad) => squad.id !== squadId))
    queryClient.removeQueries({ queryKey: getGetSquadQueryKey(squadId) })
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

  /**
   * Gives one member a new role.
   * @param members - A squad's members or its preview.
   * @param userId - Whose role changes.
   * @param role - The new role.
   * @returns The members with the change.
   */
  private static withRole<T extends SquadMember>(members: T[], userId: string, role: Role): T[] {
    return members.map((member) => (member.userID === userId ? { ...member, role } : member))
  }

  /**
   * Rewrites each page of the cached list. Does nothing when the list was never loaded.
   * @param queryClient - The cache.
   * @param edit - Gets a page's squads and the page's index; returns the squads to keep there.
   */
  private static editList(
    queryClient: QueryClient,
    edit: (squads: SquadSummary[], page: number) => SquadSummary[],
  ): void {
    queryClient.setQueryData<TSquadPages>(
      getListSquadsQueryKey(),
      (cached) =>
        cached && {
          ...cached,
          pages: cached.pages.map((page, index) => ({
            ...page,
            data: { ...page.data, squads: edit(page.data.squads, index) },
          })),
        },
    )
  }

  /**
   * Rewrites one squad's item in the cached list.
   * @param queryClient - The cache.
   * @param squadId - Which squad's cache to update.
   * @param edit - Gets the item; returns its replacement.
   */
  private static editSummary(
    queryClient: QueryClient,
    squadId: string,
    edit: (summary: SquadSummary) => SquadSummary,
  ): void {
    Squads.editList(queryClient, (squads) =>
      squads.map((squad) => (squad.id === squadId ? edit(squad) : squad)),
    )
  }

  /**
   * Rewrites a squad's cached detail. Does nothing when it was never loaded.
   * @param queryClient - The cache.
   * @param squadId - Which squad's cache to update.
   * @param edit - Gets the detail; returns its replacement.
   */
  private static editDetail(
    queryClient: QueryClient,
    squadId: string,
    edit: (detail: SquadDetail) => SquadDetail,
  ): void {
    queryClient.setQueryData<GetSquad200>(
      getGetSquadQueryKey(squadId),
      (cached) => cached && { ...cached, data: edit(cached.data) },
    )
  }
}
