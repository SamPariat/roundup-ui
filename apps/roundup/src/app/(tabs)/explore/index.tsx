import type { ReactElement } from 'react'

import { View } from 'react-native'

import { useT } from '@roundup/i18n'
import { EmptyState } from '@roundup/ui'

import { TabPage } from '../../../components/TabPage'

/**
 * The Explore tab. Venue search arrives with the places work; for now it shows an empty state.
 * @returns The empty state, centered.
 */
export default function ExploreScreen(): ReactElement {
  const { t } = useT()

  return (
    <TabPage>
      <View className="flex-1 justify-center">
        <EmptyState
          art="search"
          body={t('screens.explore.emptyBody')}
          title={t('screens.explore.emptyTitle')}
        />
      </View>
    </TabPage>
  )
}
