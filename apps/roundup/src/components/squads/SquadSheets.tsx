import type { ReactElement } from 'react'

import { useCallback } from 'react'

import type { ISquadInfo, ISquadMember, ISquadPermissions, TRole } from '@roundup/core'

import { AddPeopleModal } from './AddPeopleModal'
import { LeaveSquadModal } from './LeaveSquadModal'
import { MemberActionsModal } from './MemberActionsModal'
import { RenameSquadModal } from './RenameSquadModal'
import { SquadOptionsModal } from './SquadOptionsModal'

/** Which dialog is open on a squad's page. */
export type TSheet =
  | {
      /** A member's actions are open. */
      kind: 'member'
      /** Who they are for. */
      memberId: string
    }
  | {
      /** One of the dialogs that needs nothing more. */
      kind: 'add' | 'leave' | 'options' | 'rename'
    }

/** Props for SquadSheets. */
export interface ISquadSheetsProps {
  /** The dialog that is open; none when it is undefined. */
  sheet: TSheet | undefined
  /** Opens another dialog, or closes the open one when given undefined. */
  onSheet: (sheet?: TSheet) => void
  /** The squad the dialogs are about. */
  squad: ISquadInfo
  /** Its members, from which a member's dialog finds its person. */
  members: ISquadMember[]
  /** What the signed-in person may do in the squad. */
  permissions: ISquadPermissions
  /** The signed-in person's role in the squad. */
  myRole: TRole | undefined
  /** Called once the person has left the squad. */
  onLeft: () => void
}

/**
 * The dialogs of a squad's page. Only the open one is mounted, so each starts fresh when opened.
 * The options menu hands over to Rename squad and Leave squad.
 * @returns The open dialog, or null.
 */
export const SquadSheets = ({
  members,
  myRole,
  onLeft,
  onSheet,
  permissions,
  sheet,
  squad,
}: ISquadSheetsProps): null | ReactElement => {
  const handleClose = useCallback((): void => {
    onSheet()
  }, [onSheet])

  const handleRename = useCallback((): void => {
    onSheet({ kind: 'rename' })
  }, [onSheet])

  const handleLeave = useCallback((): void => {
    onSheet({ kind: 'leave' })
  }, [onSheet])

  switch (sheet?.kind) {
    case 'add': {
      return <AddPeopleModal onClose={handleClose} squadId={squad.id} squadName={squad.name} />
    }

    case 'leave': {
      return (
        <LeaveSquadModal
          name={squad.name}
          onClose={handleClose}
          onLeft={onLeft}
          squadId={squad.id}
        />
      )
    }

    case 'member': {
      const member = members.find((candidate) => candidate.id === sheet.memberId)

      return member === undefined ? null : (
        <MemberActionsModal
          member={member}
          onClose={handleClose}
          permissions={permissions}
          squadId={squad.id}
        />
      )
    }

    case 'options': {
      return (
        <SquadOptionsModal
          myRole={myRole}
          onClose={handleClose}
          onLeave={handleLeave}
          onRename={handleRename}
          permissions={permissions}
          squad={squad}
        />
      )
    }

    case 'rename': {
      return <RenameSquadModal currentName={squad.name} onClose={handleClose} squadId={squad.id} />
    }

    case undefined: {
      return null
    }
  }
}
