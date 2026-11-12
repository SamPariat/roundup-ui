import type { ReactElement } from 'react'

import { useLocalSearchParams } from 'expo-router'

import { VenuePage } from '@/components/venues/VenuePage'

/**
 * One venue, opened from Explore. The page itself is shared with the Squads tab's route.
 * @returns The venue page.
 */
export default function VenueScreen(): ReactElement {
  const { placeId } = useLocalSearchParams<'/explore/[placeId]'>()

  return <VenuePage placeId={placeId} />
}
