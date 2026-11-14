import type { ReactElement } from 'react'

import { useRouter } from 'expo-router'
import { useCallback } from 'react'

import type { IEventCard } from '@roundup/core'

import { useT } from '@roundup/i18n'
import { Icon, ListRow } from '@roundup/ui'

import { EventText } from '@/components/events/event-text'
import { Paths } from '@/navigation/paths'

/** Props for PastEventRow. */
export interface IPastEventRowProps {
  /** The closed event the row shows. */
  event: IEventCard
}

/**
 * One closed event: its name, and where it went, when and how many went. Pressing it opens the event.
 * @returns The list row.
 */
export const PastEventRow = ({ event }: IPastEventRowProps): ReactElement => {
  const { t } = useT()
  const router = useRouter()

  const handleOpen = useCallback((): void => {
    router.push(Paths.squadEvent(event.id, event.name))
  }, [event.id, event.name, router])

  return (
    <ListRow
      chevron
      leading={<Icon decorative name="history" />}
      onPress={handleOpen}
      subtitle={EventText.pastLine(t, event)}
      title={event.name}
    />
  )
}
