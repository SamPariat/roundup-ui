import type { ReactElement } from 'react'

import { useLocalSearchParams } from 'expo-router'

import { VenuePage } from '@/components/venues/VenuePage'

/**
 * One venue, opened from a squad's favorites, inside the Squads tab's stack, so Back returns to the squad. The
 * page itself is shared with Explore's route.
 * @returns The venue page.
 */
export default function VenueScreen(): ReactElement {
  const { placeId } = useLocalSearchParams<'/squads/venue/[placeId]'>()

  return <VenuePage placeId={placeId} />
}
