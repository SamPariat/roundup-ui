import type { ReactElement } from 'react'

import { View } from 'react-native'

import type { IVenueInfo } from '@roundup/core'

import { PhotoStrip, Text } from '@roundup/ui'

import { VenueFacts } from './VenueFacts'

/** Props for VenueHeader. */
export interface IVenueHeaderProps {
  /** The venue the header introduces. */
  venue: IVenueInfo
}

/**
 * The top of a venue's page on a phone: its photos to swipe through when it has any, its name,
 * and its rating, price and whether it is open now.
 * @returns The photos, the title and the facts.
 */
export const VenueHeader = ({ venue }: IVenueHeaderProps): ReactElement => (
  <View className="gap-3">
    <PhotoStrip className="h-46 rounded-2xl" photos={venue.photos} />
    <Text heading={1} variant="title">
      {venue.name}
    </Text>
    <VenueFacts venue={venue} />
  </View>
)
