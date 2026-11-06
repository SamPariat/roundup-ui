import type { ReactElement } from 'react'

import { useCallback } from 'react'

import type { ISquadMember } from '@roundup/core'

import { useT } from '@roundup/i18n'
import { Avatar, Badge, ListRow } from '@roundup/ui'

/** Props for MemberRow. */
export interface IMemberRowProps {
  /** The member the row shows. */
  member: ISquadMember
  /** Called with the member when the row is pressed; leave it out for a row that opens nothing. */
  onSelect?: ((member: ISquadMember) => void) | undefined
}

/**
 * One member of a squad: avatar, name and an Admin badge for admins. Your own row says "(you)".
 * It is a button only when it has something to open.
 * @returns The list row.
 */
export const MemberRow = ({ member, onSelect }: IMemberRowProps): ReactElement => {
  const { t } = useT()

  const select = useCallback((): void => {
    onSelect?.(member)
  }, [member, onSelect])

  return (
    <ListRow
      leading={
        <Avatar
          id={member.id}
          name={member.name}
          size={40}
          {...(member.src === undefined ? {} : { src: member.src })}
        />
      }
      title={member.isMe ? t('screens.squad.you', { name: member.name }) : member.name}
      trailing={
        member.role === 'ADMIN' ? <Badge tone="highlight">{t('screens.squad.admin')}</Badge> : null
      }
      {...(onSelect === undefined ? {} : { onPress: select })}
    />
  )
}
