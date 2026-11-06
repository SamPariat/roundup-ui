import { useCallback, useState } from 'react'

import { changeSquadMemberRole, removeSquadMember } from '@roundup/api'

import type { TErrorContext, TErrorKey } from '../helpers/error-key'
import type { TRole } from './types'

import { useAttempt } from '../auth/useAttempt'
import { useDeps } from '../di/useDeps'
import { Squads } from '../helpers/squads'
import { useSquad } from './useSquad'

/** What the member actions of a squad show and do. */
export interface ISquadMembersViewModel {
  /** The member whose action is running, so only their row shows a spinner; undefined when none. */
  busyUserId: string | undefined
  /** The message key to show, or undefined. */
  error: TErrorKey | undefined
  /** The request ID for the generic message. */
  requestId: string | undefined
  /** Makes a member an admin. Resolves true when it is done. */
  makeAdmin: (userId: string) => Promise<boolean>
  /** Makes an admin a plain member. Resolves true when it is done. */
  removeAdmin: (userId: string) => Promise<boolean>
  /** Removes a member from the squad. Resolves true when it is done. */
  remove: (userId: string) => Promise<boolean>
  /** Leaves the squad; the last person to leave deletes it. Resolves true when it is done. */
  leave: () => Promise<boolean>
}

/**
 * The view model of the member actions of one squad. Each action loads the squad and the list
 * again afterwards, so your own role and permissions update too, and only one runs at a time.
 * @param squadId - The squad whose members the actions change.
 * @returns The state and the actions.
 */
export const useSquadMembersViewModel = (squadId: string): ISquadMembersViewModel => {
  const { queryClient } = useDeps()
  const { members } = useSquad(squadId)
  const { busy, error, fail, requestId, run } = useAttempt()
  const [busyUserId, setBusyUserId] = useState<string | undefined>()

  const act = useCallback(
    async (
      userId: string,
      context: TErrorContext,
      request: () => Promise<void>,
    ): Promise<boolean> => {
      if (busy) return false

      setBusyUserId(userId)

      const done = await run(context, async () => {
        await request()

        return true
      })

      setBusyUserId(undefined)

      return done === true
    },
    [busy, run],
  )

  const changeRole = useCallback(
    (userId: string, role: TRole): Promise<boolean> =>
      act(userId, 'role', async () => {
        await changeSquadMemberRole(squadId, userId, { role })
        await Squads.changed(queryClient, squadId)
      }),
    [act, queryClient, squadId],
  )

  const makeAdmin = useCallback(
    (userId: string): Promise<boolean> => changeRole(userId, 'ADMIN'),
    [changeRole],
  )

  const removeAdmin = useCallback(
    (userId: string): Promise<boolean> => changeRole(userId, 'MEMBER'),
    [changeRole],
  )

  const remove = useCallback(
    (userId: string): Promise<boolean> =>
      act(userId, 'squad', async () => {
        await removeSquadMember(squadId, userId)
        await Squads.changed(queryClient, squadId)
      }),
    [act, queryClient, squadId],
  )

  const leave = useCallback(async (): Promise<boolean> => {
    const me = members.find((member) => member.isMe)

    if (me === undefined) {
      fail('errors.generic')

      return false
    }

    return act(me.id, 'squad', async () => {
      await removeSquadMember(squadId, me.id)
      await Squads.left(queryClient, squadId)
    })
  }, [act, fail, members, queryClient, squadId])

  return { busyUserId, error, leave, makeAdmin, remove, removeAdmin, requestId }
}
