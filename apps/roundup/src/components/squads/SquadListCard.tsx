import type { ReactElement } from 'react'

import { useRouter } from 'expo-router'
import { useCallback } from 'react'

import type { ISquadCard } from '@roundup/core'

import { SquadCard } from '@roundup/ui'

import { Paths } from '../../navigation/paths'

/** Props for SquadListCard. */
export interface ISquadListCardProps {
  /** The squad the card shows. */
  squad: ISquadCard
}

/**
 * One card of the Squads list. Pressing it opens that squad's page.
 * @returns The card as one pressable block.
 */
export const SquadListCard = ({ squad }: ISquadListCardProps): ReactElement => {
  const router = useRouter()

  const open = useCallback((): void => {
    router.push(Paths.squad(squad.id))
  }, [router, squad.id])

  return (
    <SquadCard
      id={squad.id}
      memberCount={squad.memberCount}
      members={squad.members}
      name={squad.name}
      onPress={open}
      role={squad.role}
      {...(squad.avatarURL === undefined ? {} : { avatarURL: squad.avatarURL })}
    />
  )
}
