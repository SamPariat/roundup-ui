import type { ReactElement } from 'react'

import { useRouter } from 'expo-router'
import { useCallback } from 'react'
import { View } from 'react-native'

import type { IEventCard, RSVPStatus } from '@roundup/core'

import { EventStatus } from '@roundup/core'
import { useT } from '@roundup/i18n'
import { Button, Text } from '@roundup/ui'

import { EventText } from '@/components/events/event-text'
import { RsvpChips } from '@/components/events/RsvpChips'
import { Paths } from '@/navigation/paths'

/** Props for NeedsAnswerCard. */
export interface INeedsAnswerCardProps {
  /** The event that most needs the person's answer. */
  event: IEventCard
  /** The answer being sent for this event, if any. */
  answering: RSVPStatus | undefined
  /** Sends the person's answer. */
  onAnswer: (event: IEventCard, status: RSVPStatus) => Promise<boolean>
}

/**
 * The highlight card of the Events tab: the open event the person has yet to answer, or to vote
 * in, with the answer chips in place and a button that opens the event.
 * @returns A bordered card in the accent color.
 */
export const NeedsAnswerCard = ({
  answering,
  event,
  onAnswer,
}: INeedsAnswerCardProps): ReactElement => {
  const { t } = useT()
  const router = useRouter()

  const handleOpen = useCallback((): void => {
    router.push(Paths.squadEvent(event.id, event.name))
  }, [event.id, event.name, router])

  const handleAnswer = useCallback(
    (status: RSVPStatus): Promise<boolean> => onAnswer(event, status),
    [event, onAnswer],
  )

  const voting = event.status === EventStatus.VOTING && !event.hasVoted

  return (
    <View className="gap-2.5 rounded-2xl border border-accent bg-accent-soft p-4 lg:p-5">
      <Text tone="muted" variant="caption">
        {t('screens.events.needsAnswer')}
      </Text>
      <Text variant="body-strong">{event.name}</Text>
      <Text tone="muted" variant="body-sm">
        {t('screens.events.line.startsDeadline', {
          deadline: event.votingCloses,
          when: event.when,
        })}
      </Text>
      <View className="gap-2">
        <Text variant="label">{t('screens.events.areYouIn')}</Text>
        <RsvpChips onSelect={handleAnswer} value={answering ?? event.myRsvp} />
      </View>
      <Text tone="muted" variant="body-sm">
        {EventText.pending(t, event)}
      </Text>
      <Button block onPress={handleOpen}>
        {voting ? t('screens.events.openAndVote') : t('screens.events.open')}
      </Button>
    </View>
  )
}
