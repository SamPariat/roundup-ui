import type { ReactElement } from 'react'

import { useLocalSearchParams } from 'expo-router'

import { useSquad } from '@roundup/core'
import { Skeleton, Text } from '@roundup/ui'

import { TabPage } from '../../../components/TabPage'

/**
 * One squad. For now just its name; the member list follows.
 * @returns The squad's name, or a placeholder while it loads.
 */
export default function SquadScreen(): ReactElement {
  const { squadId } = useLocalSearchParams<'/squads/[squadId]'>()
  const { loading, squad } = useSquad(squadId)

  return (
    <TabPage>
      {loading || squad === undefined ? (
        <Skeleton variant="row" />
      ) : (
        <Text heading={1} variant="heading">
          {squad.name}
        </Text>
      )}
    </TabPage>
  )
}
