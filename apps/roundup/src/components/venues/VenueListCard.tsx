import type { ReactElement } from 'react'

import { useRouter } from 'expo-router'
import { useCallback } from 'react'
import { Pressable } from 'react-native'

import type { IVenueCard } from '@roundup/core'

import { VenueCard } from '@roundup/ui'

import { Paths } from '@/navigation/paths'

/** Props for VenueListCard. */
export interface IVenueListCardProps {
  /** The venue the card shows. */
  venue: IVenueCard
}

/**
 * One card of the Explore results. Pressing it opens that venue's page.
 * @returns The card as one pressable block named by the venue.
 */
export const VenueListCard = ({ venue }: IVenueListCardProps): ReactElement => {
  const router = useRouter()

  const handleOpen = useCallback((): void => {
    router.push(Paths.venue(venue.id, venue.name))
  }, [router, venue.id, venue.name])

  return (
    <Pressable
      accessibilityLabel={venue.name}
      accessibilityRole="button"
      className="rounded-2xl focus:outline-2 focus:outline-offset-2 focus:outline-focus-ring"
      onPress={handleOpen}
    >
      <VenueCard {...venue} />
    </Pressable>
  )
}
