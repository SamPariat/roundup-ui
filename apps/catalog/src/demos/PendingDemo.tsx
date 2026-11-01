import type { ReactElement } from 'react'

import { EmptyState } from '@roundup/ui'

/**
 * Stands in for a component whose demo has not been written yet.
 * @returns A short empty state.
 */
export const PendingDemo = (): ReactElement => (
  <EmptyState art="search" body="Its variants and states are on the way." title="No demo yet" />
)
