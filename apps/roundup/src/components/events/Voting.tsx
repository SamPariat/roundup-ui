import type { ReactElement } from 'react'

import { useMemo } from 'react'
import { View } from 'react-native'

import type { IEventInfo, IUseEvent } from '@roundup/core'

import { EVENT_LIVE_SECONDS, useDeps } from '@roundup/core'
import { useT } from '@roundup/i18n'
import { Badge, Icon, Text } from '@roundup/ui'

import { Ballot } from '@/components/events/ballot'
import { EventText } from '@/components/events/event-text'
import { VoteCard } from '@/components/events/VoteCard'
import { useLayout } from '@/hooks/useLayout'
import { useNow } from '@/hooks/useNow'

/** Props for the voting sections. */
export interface IVotingProps {
  /** The event being voted on. */
  event: IEventInfo
}

/** Props for Ballots. */
export interface IBallotsProps extends IVotingProps {
  /** The place a vote is being sent for, if any. */
  votingId: IUseEvent['votingId']
  /** Votes for a place. */
  onVote: IUseEvent['vote']
  /** True on the wide layout, whose cards show the address and larger avatars. */
  wide: boolean
}

/**
 * What the event is while voting runs: its status and kind of night, how long voting has left
 * (read again every minute), when it closes and how many members have voted.
 * @returns The status line, the countdown and the turnout.
 */
export const VotingSummary = ({ event }: IVotingProps): ReactElement => {
  const { t } = useT()
  const { helpers } = useDeps()
  const { canPull } = useLayout()

  const now = useNow()

  const left = helpers.dates.left(now, event.votingDeadline)

  return (
    <View className="gap-1.5">
      <View className="flex-row flex-wrap items-center gap-2">
        <Badge tone={EventText.tone(event.status)}>{EventText.status(t, event.status)}</Badge>
        <Text tone="muted" variant="caption">
          {EventText.whenLine(t, event)}
        </Text>
      </View>
      <View className="flex-row items-center gap-2">
        <Icon decorative name="clock" size={16} />
        <Text variant="body-strong">{t('screens.event.closesIn', { left })}</Text>
      </View>
      <Text aria-live="polite" tone="muted" variant="body-sm">
        {t('screens.event.votedLine', {
          members: event.memberCount,
          voted: event.votedCount,
          when: event.votingCloses,
        })}
      </Text>
      {/* Votes come in from the rest of the squad: the page says how often it looks, and on a phone
          that a pull looks now. */}
      <Text tone="subtle" variant="caption">
        {canPull
          ? t('screens.event.liveHintPull', { seconds: EVENT_LIVE_SECONDS })
          : t('screens.event.liveHint', { seconds: EVENT_LIVE_SECONDS })}
      </Text>
    </View>
  )
}

/**
 * The ballot: "Pick one", a card for each suggested place that the person presses to vote for it,
 * and the note on how the winner is picked.
 * @returns The label, the cards and the note.
 */
export const Ballots = ({ event, onVote, votingId, wide }: IBallotsProps): ReactElement => {
  const { t } = useT()
  const { nominations, permissions } = event

  const total = useMemo((): number => Ballot.total(nominations), [nominations])
  const top = useMemo((): number => Ballot.top(nominations), [nominations])

  const voting = votingId !== undefined

  return (
    <View className="gap-3">
      <Text variant="label">{t('screens.event.pickOne')}</Text>
      <View className="gap-3">
        {nominations.map((nomination) => (
          <VoteCard
            chosen={voting ? votingId === nomination.id : nomination.votedByMe}
            disabled={voting || !permissions.canVote}
            key={nomination.id}
            leading={nomination.voteCount > 0 && nomination.voteCount === top}
            maxVoters={wide ? 5 : 4}
            nomination={nomination}
            onVote={onVote}
            sending={votingId === nomination.id}
            showAddress={wide}
            total={total}
          />
        ))}
      </View>
      <Text tone="muted" variant="caption">
        {t('screens.event.voteNote')}
      </Text>
    </View>
  )
}
