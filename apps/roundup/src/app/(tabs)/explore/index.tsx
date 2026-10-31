import type { ReactElement } from 'react'

import { View } from 'react-native'

import { useT } from '@roundup/i18n'
import { EmptyState } from '@roundup/ui'

/**
 * The Explore tab. Venue search arrives with the places work; for now it shows an empty state.
 * @returns The empty state, centred.
 */
export default function ExploreScreen(): ReactElement {
  const { t } = useT()

  return (
    <View className="flex-1 justify-center">
      <EmptyState
        art="search"
        body={t('screens.explore.emptyBody')}
        title={t('screens.explore.emptyTitle')}
      />
    </View>
  )
}
