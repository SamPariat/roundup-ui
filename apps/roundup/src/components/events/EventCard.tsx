import type { ReactElement } from 'react'

import { useRouter } from 'expo-router'
import { useCallback } from 'react'
import { Pressable, View } from 'react-native'

import type { IEventCard } from '@roundup/core'

import { useT } from '@roundup/i18n'
import { AvatarGroup, Badge, Icon, Text } from '@roundup/ui'

import { EventText } from '@/components/events/event-text'
import { Paths } from '@/navigation/paths'

/** Props for EventCard. */
export interface IEventCardProps {
  /** The event the card shows. */
  event: IEventCard
}

/**
 * One open event as a card: its name, when and what kind of night, a status badge, what it is up
 * to, who is going and how many have answered. Pressing it opens the event.
 * @returns The card as one pressable block named by the event.
 */
export const EventCard = ({ event }: IEventCardProps): ReactElement => {
  const { t } = useT()
  const router = useRouter()

  const handleOpen = useCallback((): void => {
    router.push(Paths.squadEvent(event.id, event.name))
  }, [event.id, event.name, router])

  return (
    <Pressable
      accessibilityLabel={event.name}
      accessibilityRole="button"
      className="gap-3 rounded-2xl border border-border bg-bg-raised p-4 hover:bg-bg-hover focus:outline-2 focus:outline-offset-2 focus:outline-focus-ring"
      onPress={handleOpen}
    >
      <View className="flex-row items-start justify-between gap-2">
        <View className="min-w-0 flex-1 gap-1">
          <Text variant="body-strong">{event.name}</Text>
          <Text tone="muted" variant="body-sm">
            {EventText.whenLine(t, event)}
          </Text>
        </View>
        <Badge tone={EventText.tone(event.status)}>{EventText.status(t, event.status)}</Badge>
      </View>
      <View className="flex-row items-center gap-2">
        <Icon decorative name={EventText.icon(event.status)} size={16} />
        <Text className="min-w-0 flex-1" variant="body-sm">
          {EventText.detail(t, event)}
        </Text>
      </View>
      <View className="flex-row items-center justify-between gap-2">
        <AvatarGroup max={5} people={event.going} size={32} total={event.rsvpCounts.going} />
        <Text tone="muted" variant="caption">
          {EventText.rsvpSummary(t, event.rsvpCounts)}
        </Text>
      </View>
    </Pressable>
  )
}
