import type { ReactElement } from 'react'
import type { ViewStyle } from 'react-native'

import { useCallback, useMemo } from 'react'
import { Pressable, View } from 'react-native'

import type { IEventNomination } from '@roundup/core'

import { useT } from '@roundup/i18n'
import { AvatarGroup, Badge, cn, Spinner, Text } from '@roundup/ui'

import { Ballot } from '@/components/events/ballot'
import { EventText } from '@/components/events/event-text'

/** Props for VoteCard. */
export interface IVoteCardProps {
  /** The suggested place the card shows. */
  nomination: IEventNomination
  /** The votes cast for every place, which the bar's width is a share of. */
  total: number
  /** True when the place has the most votes, so its bar is drawn in the accent. */
  leading: boolean
  /** True when this is the person's choice, or the vote being sent for it. */
  chosen: boolean
  /** True while the vote for this card is being sent. */
  sending: boolean
  /** True when the card cannot be pressed: a vote is being sent, or the person may not vote. */
  disabled: boolean
  /** True to show the street address, as the wide layout does. */
  showAddress: boolean
  /** How many voters' avatars show before the rest collapse into a +N chip. */
  maxVoters: number
  /** Called with the place when the card is pressed. */
  onVote: (nomination: IEventNomination) => Promise<boolean>
}

/**
 * One place of a ballot, as a button the person presses to vote for it: its name and who suggested
 * it, "Your vote" when it is theirs, a bar for its share of the votes, the count (a spinner and
 * Sending… while their vote for it is on its way) and the avatars of those who voted for it.
 * @returns The pressable card, selected when it is the person's vote.
 */
export const VoteCard = ({
  chosen,
  disabled,
  leading,
  maxVoters,
  nomination,
  onVote,
  sending,
  showAddress,
  total,
}: IVoteCardProps): ReactElement => {
  const { t } = useT()
  const votes = t('screens.event.votes', { count: nomination.voteCount })

  const label = chosen
    ? t('screens.event.voteSpokenMine', { name: nomination.name, votes })
    : t('screens.event.voteSpoken', { name: nomination.name, votes })

  const fill = useMemo(
    (): ViewStyle => ({ width: `${Ballot.percent(nomination.voteCount, total)}%` }),
    [nomination.voteCount, total],
  )

  const handleVote = useCallback(async (): Promise<void> => {
    await onVote(nomination)
  }, [nomination, onVote])

  // A press only starts the vote; the promise is not handed back to the Pressable.
  const handlePress = useCallback((): void => {
    void handleVote()
  }, [handleVote])

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      aria-busy={sending}
      aria-disabled={disabled}
      aria-selected={chosen}
      className={cn(
        'w-full gap-3 rounded-2xl border p-4 focus:outline-2 focus:outline-offset-2 focus:outline-focus-ring lg:px-5',
        chosen ? 'border-accent bg-accent-soft' : 'border-border bg-bg-raised hover:bg-bg-hover',
      )}
      disabled={disabled}
      onPress={handlePress}
    >
      <View className="flex-row items-start justify-between gap-2">
        <View className="min-w-0 flex-1 gap-0.5">
          <Text variant="body-strong">{nomination.name}</Text>
          <Text tone="muted" variant="caption">
            {EventText.nominationLine(t, nomination)}
          </Text>
        </View>
        {chosen ? <Badge tone="accent">{t('screens.event.yourVote')}</Badge> : null}
      </View>
      {showAddress && nomination.address !== undefined ? (
        <Text tone="muted" variant="body-sm">
          {nomination.address}
        </Text>
      ) : null}
      <View className="w-full flex-row items-center gap-2.5">
        <View className="h-2 flex-1 overflow-hidden rounded-full bg-bg-sunken">
          <View
            className={cn('h-full rounded-full', leading ? 'bg-accent' : 'bg-fg-subtle')}
            style={fill}
          />
        </View>
        <View className="min-w-22 flex-row items-center justify-end gap-2">
          {sending ? <Spinner tone="fg-subtle" /> : null}
          <Text accessibilityLiveRegion="polite" aria-live="polite" variant="caption">
            {sending ? t('screens.event.voteSending') : votes}
          </Text>
        </View>
      </View>
      {nomination.voteCount === 0 ? null : (
        <AvatarGroup
          max={maxVoters}
          people={nomination.voters}
          size={showAddress ? 28 : 24}
          total={nomination.voteCount}
        />
      )}
    </Pressable>
  )
}
