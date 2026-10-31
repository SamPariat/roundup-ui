import type { ReactElement } from 'react'

import { View } from 'react-native'

import { useT } from '@roundup/i18n'
import { EmptyState } from '@roundup/ui'

/**
 * The Squads tab. Squads arrive with the backend work; for now it shows an empty state.
 * @returns The empty state, centred.
 */
export default function SquadsScreen(): ReactElement {
  const { t } = useT()

  return (
    <View className="flex-1 justify-center">
      <EmptyState
        art="squads"
        body={t('screens.squads.emptyBody')}
        title={t('screens.squads.emptyTitle')}
      />
    </View>
  )
}
