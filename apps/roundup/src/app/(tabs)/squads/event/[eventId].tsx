import type { ReactElement } from 'react'

import { useLocalSearchParams } from 'expo-router'

import { EventPage } from '@/components/events/EventPage'

/**
 * One event, opened from a squad's Events tab, inside the Squads tab's stack, so Back returns to
 * the squad.
 * @returns The event page.
 */
export default function EventScreen(): ReactElement {
  const { eventId } = useLocalSearchParams<'/squads/event/[eventId]'>()

  return <EventPage eventId={eventId} />
}
