import type { ReactElement } from 'react'

import { useT } from '@roundup/i18n'
import { EmptyState } from '@roundup/ui'

import { TabPage } from '../../../components/TabPage'

/**
 * The Squads tab. Squads arrive with the backend work; for now it shows an empty state.
 * @returns The empty state, centered.
 */
export default function SquadsScreen(): ReactElement {
  const { t } = useT()

  return (
    <TabPage centered>
      <EmptyState
        art="squads"
        body={t('screens.squads.emptyBody')}
        title={t('screens.squads.emptyTitle')}
      />
    </TabPage>
  )
}
