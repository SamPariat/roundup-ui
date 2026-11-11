import type { ReactElement } from 'react'

import { View } from 'react-native'

import type { IVenueInfo } from '@roundup/core'

import { Photo, Text } from '@roundup/ui'

import { VenueFacts } from './VenueFacts'

/** Props for VenueHeader. */
export interface IVenueHeaderProps {
  /** The venue the header introduces. */
  venue: IVenueInfo
}

/**
 * The top of a venue's page on a phone: its first photo when it has one, its name, and its rating,
 * price and whether it is open now.
 * @returns The photo, the title and the facts.
 */
export const VenueHeader = ({ venue }: IVenueHeaderProps): ReactElement => (
  <View className="gap-3">
    {venue.photo === undefined ? null : (
      <Photo className="h-46 w-full rounded-2xl bg-bg-sunken" src={venue.photo} />
    )}
    <Text heading={1} variant="title">
      {venue.name}
    </Text>
    <VenueFacts venue={venue} />
  </View>
)
