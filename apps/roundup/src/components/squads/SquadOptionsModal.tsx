import type { ReactElement } from 'react'

import type { ISquadInfo, ISquadPermissions, TRole } from '@roundup/core'

import { useT } from '@roundup/i18n'
import { Avatar, Button, Icon, List, ListRow, Modal } from '@roundup/ui'

/** Props for SquadOptionsModal. */
export interface ISquadOptionsModalProps {
  /** The squad the options are for. */
  squad: ISquadInfo
  /** What the signed-in person may do in the squad. */
  permissions: ISquadPermissions
  /** The signed-in person's role in the squad. */
  myRole: TRole | undefined
  /** Called when Rename squad is pressed. */
  onRename: () => void
  /** Called when Leave squad is pressed. */
  onLeave: () => void
  /** Called when the person closes the modal. */
  onClose: () => void
}

/**
 * The squad's options menu, opened from its header: Rename squad, for people the server lets edit
 * the squad, and Leave squad.
 * @returns The modal listing the options.
 */
export const SquadOptionsModal = ({
  myRole,
  onClose,
  onLeave,
  onRename,
  permissions,
  squad,
}: ISquadOptionsModalProps): ReactElement => {
  const { t } = useT()
  const members = t('common.members', { count: squad.memberCount })

  const subtitle =
    myRole === 'ADMIN'
      ? t('screens.squad.optionsSubtitleAdmin', { members })
      : t('screens.squad.optionsSubtitleMember', { members })

  // Modals have no close button, so a ghost Cancel dismisses this one.
  const actions = [
    <Button key="cancel" onPress={onClose} variant="ghost">
      {t('common.cancel')}
    </Button>,
  ]

  return (
    <Modal
      actions={actions}
      leading={
        <Avatar
          id={squad.id}
          name={squad.name}
          size={40}
          {...(squad.avatarURL === undefined ? {} : { src: squad.avatarURL })}
        />
      }
      onClose={onClose}
      subtitle={subtitle}
      title={squad.name}
    >
      <List>
        {permissions.canEditSquad ? (
          <ListRow
            chevron
            leading={<Icon decorative name="edit" />}
            onPress={onRename}
            title={t('screens.squad.renameRow')}
          />
        ) : null}
        <ListRow
          destructive
          leading={<Icon decorative name="logout" tone="danger" />}
          onPress={onLeave}
          subtitle={t('screens.squad.leaveRowHint')}
          title={t('screens.squad.leaveRow')}
        />
      </List>
    </Modal>
  )
}
