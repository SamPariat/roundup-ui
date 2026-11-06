import { useMemo } from 'react'

import { ApiError, HttpStatus, useGetSquad } from '@roundup/api'

import type { TErrorKey } from '../helpers/error-key'
import type { ISquadInfo, ISquadMember, ISquadPermissions, TRole } from './types'

import { useDeps } from '../di/useDeps'
import { Squads } from '../helpers/squads'
import { useSignedIn } from '../session/useSignedIn'

/** What the squad detail screen shows. */
export interface IUseSquad {
  /** The squad, once loaded. */
  squad: ISquadInfo | undefined
  /** Its members, in the order the server sends them. */
  members: ISquadMember[]
  /** What the signed-in person may do in it; undefined until loaded. */
  permissions: ISquadPermissions | undefined
  /** The signed-in person's role in it; undefined until loaded. */
  myRole: TRole | undefined
  /** True while the squad loads. */
  loading: boolean
  /** True when the squad does not exist or the person is not in it. */
  notFound: boolean
  /** The message key to show, or undefined. */
  error: TErrorKey | undefined
  /** The request ID for the generic message. */
  requestId: string | undefined
}

/** No members, kept as one array so a squad that has not loaded does not re-render its readers. */
const NO_MEMBERS: ISquadMember[] = []

/**
 * Loads one squad with its members and the signed-in person's permissions.
 * @param squadId - Which squad to load.
 * @returns The squad and the loading state.
 */
export const useSquad = (squadId: string): IUseSquad => {
  const { helpers } = useDeps()
  const signedIn = useSignedIn()
  const { data, error, isPending } = useGetSquad(squadId, { query: { enabled: signedIn } })
  const detail = data?.data

  const members = useMemo(
    (): ISquadMember[] | undefined => detail?.members.map((member) => Squads.toMember(member)),
    [detail],
  )

  const squad = useMemo((): ISquadInfo | undefined => detail && Squads.toInfo(detail), [detail])

  const permissions = useMemo(
    (): ISquadPermissions | undefined => detail && Squads.toPermissions(detail),
    [detail],
  )

  const message = error === null ? undefined : helpers.errors.toMessage(error, 'squad')

  return {
    error: message?.key,
    loading: signedIn && isPending,
    members: members ?? NO_MEMBERS,
    myRole: detail?.myRole,
    notFound: ApiError.is(error) && error.status === HttpStatus.notFound,
    permissions,
    requestId: message?.requestId,
    squad,
  }
}
