import type { ReactElement } from 'react'

import { View } from 'react-native'

import type { IVenueInfo } from '@roundup/core'

import { useT } from '@roundup/i18n'
import { Badge, Price, Rating } from '@roundup/ui'

/** Props for VenueFacts. */
export interface IVenueFactsProps {
  /** The venue whose rating, price and opening status the row shows. */
  venue: IVenueInfo
}

/** Props for the open now badge. */
interface IOpenBadgeProps {
  /** Whether the venue is open now. */
  isOpen: boolean
}

/**
 * A success or danger badge that says Open now or Closed now.
 * @returns A status pill worded for the venue's state.
 */
const OpenBadge = ({ isOpen }: IOpenBadgeProps): ReactElement => {
  const { t } = useT()

  if (isOpen) return <Badge tone="success">{t('screens.venue.openNow')}</Badge>

  return <Badge tone="danger">{t('screens.venue.closedNow')}</Badge>
}

/**
 * A venue's rating, price and whether it is open now, in one wrapping row.
 * @returns The facts row.
 */
export const VenueFacts = ({ venue }: IVenueFactsProps): ReactElement => {
  const count = venue.reviews === undefined ? {} : { count: venue.reviews }

  return (
    <View className="flex-row flex-wrap items-center gap-3">
      {venue.rating === undefined ? null : <Rating value={venue.rating} {...count} />}
      <Price level={venue.priceLevel} />
      {venue.isOpen === undefined ? null : <OpenBadge isOpen={venue.isOpen} />}
    </View>
  )
}
