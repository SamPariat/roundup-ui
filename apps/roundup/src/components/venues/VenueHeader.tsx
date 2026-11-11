import type { ReactElement } from 'react'

import { Image, View } from 'react-native'

import type { IVenueInfo } from '@roundup/core'

import { useT } from '@roundup/i18n'
import { Badge, Price, Rating, Text } from '@roundup/ui'

/** Props for VenueHeader. */
export interface IVenueHeaderProps {
  /** The venue the header introduces. */
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
 * The top of a venue's page: its photo when it has one, its name, and its rating, price and
 * whether it is open now, in one wrapping row.
 * @returns The photo, the title and the facts.
 */
export const VenueHeader = ({ venue }: IVenueHeaderProps): ReactElement => {
  const count = venue.reviews === undefined ? {} : { count: venue.reviews }

  return (
    <View className="gap-3">
      {venue.photo === undefined ? null : (
        <Image
          accessibilityIgnoresInvertColors
          alt=""
          className="aspect-video w-full rounded-2xl bg-bg-sunken"
          source={{ uri: venue.photo }}
        />
      )}
      <Text heading={1} variant="title">
        {venue.name}
      </Text>
      <View className="flex-row flex-wrap items-center gap-2">
        {venue.rating === undefined ? null : <Rating value={venue.rating} {...count} />}
        <Price level={venue.priceLevel} />
        {venue.isOpen === undefined ? null : <OpenBadge isOpen={venue.isOpen} />}
      </View>
    </View>
  )
}
