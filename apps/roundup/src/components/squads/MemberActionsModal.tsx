import type { ReactElement } from 'react'

import { useCallback, useState } from 'react'

import type { ISquadMember, ISquadPermissions } from '@roundup/core'

import { useSquadMembersViewModel } from '@roundup/core'
import { useT } from '@roundup/i18n'
import { Avatar, Button, Icon, List, ListRow, Modal } from '@roundup/ui'

import { useErrorText } from '../../hooks/useErrorText'
import { InlineError } from '../InlineError'

/** Something the person may do to another member. */
export type TMemberAction = 'makeAdmin' | 'remove' | 'removeAdmin'

/**
 * Member action helpers. Static methods only.
 */
export class MemberActions {
  /**
   * Works out what the person may do to a member from what the server allows them. Your own row
   * has nothing: leaving is a separate action on the squad.
   * @param member - The member the row shows.
   * @param permissions - What the signed-in person may do in the squad.
   * @returns The actions to offer, in the order the modal lists them; empty when there are none.
   */
  static available(member: ISquadMember, permissions: ISquadPermissions): TMemberAction[] {
    if (member.isMe) return []

    const roleChange: TMemberAction = member.role === 'ADMIN' ? 'removeAdmin' : 'makeAdmin'

    return [
      ...(permissions.canChangeRoles ? [roleChange] : []),
      ...(permissions.canRemoveMembers ? (['remove'] as TMemberAction[]) : []),
    ]
  }
}

/** Props for MemberActionsModal. */
export interface IMemberActionsModalProps {
  /** The squad the member belongs to. */
  squadId: string
  /** The member the actions are for. */
  member: ISquadMember
  /** What the signed-in person may do in the squad. */
  permissions: ISquadPermissions
  /** Called when the person closes the modal, or once an action is done. */
  onClose: () => void
}

/**
 * The Member actions modal: Make admin or Remove admin, and Remove from squad, each only when the
 * server lets the person do it. The row being worked on shows a spinner while the rest go inert.
 * @returns The modal with the member's actions.
 */
export const MemberActionsModal = ({
  member,
  onClose,
  permissions,
  squadId,
}: IMemberActionsModalProps): ReactElement => {
  const { t } = useT()

  const { busyUserId, error, makeAdmin, remove, removeAdmin, requestId } =
    useSquadMembersViewModel(squadId)

  const errorText = useErrorText(error, requestId)
  const [chosen, setChosen] = useState<TMemberAction | undefined>()
  const available = MemberActions.available(member, permissions)
  const busy = busyUserId === member.id

  const perform = useCallback(
    (action: TMemberAction, request: () => Promise<boolean>): void => {
      setChosen(action)

      void request().then((done) => {
        if (done) onClose()
      })
    },
    [onClose],
  )

  const promote = useCallback((): void => {
    perform('makeAdmin', () => makeAdmin(member.id))
  }, [makeAdmin, member.id, perform])

  const demote = useCallback((): void => {
    perform('removeAdmin', () => removeAdmin(member.id))
  }, [member.id, perform, removeAdmin])

  const kick = useCallback((): void => {
    perform('remove', () => remove(member.id))
  }, [member.id, perform, remove])

  /**
   * The spinner shown on the row the person pressed while its request runs.
   * @param action - The row's action.
   * @returns The spinner, or undefined on every other row.
   */
  const working = (action: TMemberAction): ReactElement | undefined =>
    busy && chosen === action ? (
      <Button loading loadingLabel={t('screens.squad.member.saving')} size="sm" variant="ghost">
        {t('screens.squad.member.saving')}
      </Button>
    ) : undefined

  return (
    <Modal
      busy={busy}
      leading={
        <Avatar
          id={member.id}
          name={member.name}
          size={40}
          {...(member.src === undefined ? {} : { src: member.src })}
        />
      }
      onClose={onClose}
      subtitle={
        member.role === 'ADMIN'
          ? t('screens.squad.member.roleAdmin')
          : t('screens.squad.member.roleMember')
      }
      title={member.name}
    >
      <List>
        {available.includes('makeAdmin') ? (
          <ListRow
            busy={busy}
            leading={<Icon decorative name="shield" />}
            onPress={promote}
            subtitle={t('screens.squad.member.makeAdminHint')}
            title={t('screens.squad.member.makeAdmin')}
            trailing={working('makeAdmin')}
          />
        ) : null}
        {available.includes('removeAdmin') ? (
          <ListRow
            busy={busy}
            leading={<Icon decorative name="shield" />}
            onPress={demote}
            subtitle={t('screens.squad.member.removeAdminHint')}
            title={t('screens.squad.member.removeAdmin')}
            trailing={working('removeAdmin')}
          />
        ) : null}
        {available.includes('remove') ? (
          <ListRow
            busy={busy}
            destructive
            leading={<Icon decorative name="trash" tone="danger" />}
            onPress={kick}
            title={t('screens.squad.member.remove')}
            trailing={working('remove')}
          />
        ) : null}
      </List>
      <InlineError message={errorText} />
    </Modal>
  )
}
