import type { InfiniteData } from '@tanstack/react-query'

import type { ListSquads200, SquadDetail, SquadMember, SquadSummary } from '@roundup/api'

import type { ITestCore } from './wrapper'

import { TestCore } from './wrapper'

/**
 * Squad data and cores for the squad tests. Static methods only.
 */
export class SquadFixtures {
  /**
   * Builds a squad member as the API sends one.
   * @param id - Which user; the name is built from it.
   * @param role - Their role.
   * @param avatarURL - Their photo URL; empty when unset.
   * @returns The member, named after their ID.
   */
  static member(id: string, role: SquadMember['role'] = 'MEMBER', avatarURL = ''): SquadMember {
    return { avatarURL, joinedAt: '2026-01-01T00:00:00Z', name: `Name ${id}`, role, userID: id }
  }

  /**
   * Builds a list item.
   * @param id - Which squad.
   * @param overrides - Fields to change.
   * @returns The item, with the signed-in person as admin and sole member.
   */
  static summary(id: string, overrides: Partial<SquadSummary> = {}): SquadSummary {
    return {
      avatarURL: '',
      createdAt: '2026-01-01T00:00:00Z',
      createdBy: 'u1',
      id,
      memberCount: 1,
      memberPreview: [SquadFixtures.member('u1', 'ADMIN')],
      name: `Squad ${id}`,
      role: 'ADMIN',
      ...overrides,
    }
  }

  /**
   * Builds a squad detail where u1 (the signed-in person) is an admin and u2 is a member.
   * @param id - Which squad.
   * @param overrides - Fields to change.
   * @returns The squad with two members.
   */
  static detail(id: string, overrides: Partial<SquadDetail> = {}): SquadDetail {
    return {
      avatarURL: '',
      createdAt: '2026-01-01T00:00:00Z',
      createdBy: 'u1',
      createdByName: 'Name u1',
      id,
      memberCount: 2,
      members: [
        { ...SquadFixtures.member('u1', 'ADMIN'), isMe: true },
        { ...SquadFixtures.member('u2'), isMe: false },
      ],
      myRole: 'ADMIN',
      name: `Squad ${id}`,
      permissions: {
        canAddMembers: true,
        canChangeRoles: true,
        canEditSquad: true,
        canRemoveMembers: true,
      },
      ...overrides,
    }
  }

  /**
   * Builds the list answer for one page.
   * @param squads - The page's items.
   * @param nextCursor - The cursor of the next page; null on the last.
   * @returns The answer's data.
   */
  static page(squads: SquadSummary[], nextCursor: null | string = null): ListSquads200['data'] {
    return { nextCursor, squads }
  }

  /**
   * Starts a core that has a saved refresh token, so it restores into a signed-in session.
   * @returns The fakes behind a provider that will restore a session.
   */
  static async signedInCore(): Promise<ITestCore> {
    const core = TestCore.create()

    await core.store.save('r1')

    return core
  }

  /**
   * Puts a list of squads in the cache as one loaded page.
   * @param core - The core whose cache to fill.
   * @param squads - The list items.
   */
  static seedList(core: ITestCore, squads: SquadSummary[]): void {
    const cached: InfiniteData<ListSquads200, undefined> = {
      pageParams: [undefined],
      pages: [{ data: SquadFixtures.page(squads), success: true }],
    }

    core.queryClient.setQueryData(['/api/v1/squads'], cached)
  }

  /**
   * Puts a squad's detail in the cache.
   * @param core - The core whose cache to fill.
   * @param detail - The squad's detail answer.
   */
  static seedDetail(core: ITestCore, detail: SquadDetail): void {
    core.queryClient.setQueryData([`/api/v1/squads/${detail.id}`], { data: detail, success: true })
  }

  /**
   * Whether the cached list was marked out of date.
   * @param core - The core whose cache to read.
   * @returns True once it was invalidated.
   */
  static listInvalidated(core: ITestCore): boolean {
    return core.queryClient.getQueryState(['/api/v1/squads'])?.isInvalidated === true
  }

  /**
   * Whether a squad's cached detail was marked out of date.
   * @param core - The core whose cache to read.
   * @param id - Which squad.
   * @returns True once it was invalidated.
   */
  static detailInvalidated(core: ITestCore, id: string): boolean {
    return core.queryClient.getQueryState([`/api/v1/squads/${id}`])?.isInvalidated === true
  }
}
