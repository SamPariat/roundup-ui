import type { ReactElement } from 'react'

import { useCallback, useState } from 'react'

import type { ISquadMember, ISquadPermissions } from '@roundup/core'

import { Role, useSquadMembersViewModel } from '@roundup/core'
import { useT } from '@roundup/i18n'
import { Avatar, Button, Icon, List, ListRow, Modal, Toast } from '@roundup/ui'

import { useErrorText } from '@/hooks/useErrorText'

/** Something the person may do to another member. */
/** What can be done to a member, as a constant object in the same shape orval gives Role. */
const MemberAction = {
  MAKE_ADMIN: 'makeAdmin',
  REMOVE: 'remove',
  REMOVE_ADMIN: 'removeAdmin',
} as const

/** One of the member actions. */
export type TMemberAction = (typeof MemberAction)[keyof typeof MemberAction]

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

    const roleChange: TMemberAction =
      member.role === Role.ADMIN ? MemberAction.REMOVE_ADMIN : MemberAction.MAKE_ADMIN

    return [
      ...(permissions.canChangeRoles ? [roleChange] : []),
      ...(permissions.canRemoveMembers ? [MemberAction.REMOVE] : []),
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
    async (action: TMemberAction, request: () => Promise<boolean>): Promise<void> => {
      setChosen(action)

      if (await request()) onClose()
    },
    [onClose],
  )

  const handlePromote = useCallback(
    (): Promise<void> => perform(MemberAction.MAKE_ADMIN, () => makeAdmin(member.id)),
    [makeAdmin, member.id, perform],
  )

  const handleDemote = useCallback(
    (): Promise<void> => perform(MemberAction.REMOVE_ADMIN, () => removeAdmin(member.id)),
    [member.id, perform, removeAdmin],
  )

  const handleKick = useCallback(
    (): Promise<void> => perform(MemberAction.REMOVE, () => remove(member.id)),
    [member.id, perform, remove],
  )

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

  // Modals have no close button, so a ghost Cancel dismisses this one.
  const actions = [
    <Button key="cancel" onPress={onClose} variant="ghost">
      {t('common.cancel')}
    </Button>,
  ]

  return (
    <Modal
      actions={actions}
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
        member.role === Role.ADMIN
          ? t('screens.squad.member.roleAdmin')
          : t('screens.squad.member.roleMember')
      }
      title={member.name}
    >
      <List>
        {available.includes(MemberAction.MAKE_ADMIN) ? (
          <ListRow
            busy={busy}
            leading={<Icon decorative name="shield" />}
            onPress={handlePromote}
            subtitle={t('screens.squad.member.makeAdminHint')}
            title={t('screens.squad.member.makeAdmin')}
            trailing={working(MemberAction.MAKE_ADMIN)}
          />
        ) : null}
        {available.includes(MemberAction.REMOVE_ADMIN) ? (
          <ListRow
            busy={busy}
            leading={<Icon decorative name="shield" />}
            onPress={handleDemote}
            subtitle={t('screens.squad.member.removeAdminHint')}
            title={t('screens.squad.member.removeAdmin')}
            trailing={working(MemberAction.REMOVE_ADMIN)}
          />
        ) : null}
        {available.includes(MemberAction.REMOVE) ? (
          <ListRow
            busy={busy}
            destructive
            leading={<Icon decorative name="trash" tone="danger" />}
            onPress={handleKick}
            title={t('screens.squad.member.remove')}
            trailing={working(MemberAction.REMOVE)}
          />
        ) : null}
      </List>
      {errorText === undefined ? null : <Toast tone="error">{errorText}</Toast>}
    </Modal>
  )
}
