import type { ReactElement } from 'react'

import { View } from 'react-native'

import type { IUseSquadEvents } from '@roundup/core'

import { useT } from '@roundup/i18n'
import { Button, EmptyState, List, Skeleton, Text } from '@roundup/ui'

import { EventCard } from '@/components/events/EventCard'
import { NeedsAnswerCard } from '@/components/events/NeedsAnswerCard'
import { PastEventRow } from '@/components/events/PastEventRow'
import { useErrorText } from '@/hooks/useErrorText'

/** What the events views read of the squad's events. */
export type TSquadEvents = Pick<
  IUseSquadEvents,
  | 'answering'
  | 'error'
  | 'hasMore'
  | 'loading'
  | 'loadingMore'
  | 'loadMore'
  | 'needsAnswer'
  | 'past'
  | 'requestId'
  | 'rsvp'
  | 'upcoming'
>

/** Props for the events views. */
export interface ISquadEventsProps {
  /** The squad's events, as useSquadEvents gives them. */
  state: TSquadEvents
}

/** Props for EventsBlock. */
export interface IEventsBlockProps extends ISquadEventsProps {
  /** Opens the New event modal. */
  onNew: () => void
  /** True to draw New event beside "Coming up"; false where the page's header holds it. */
  newInRow: boolean
  /** True on the wide layout: cards side by side, and the answer card left to the aside. */
  wide: boolean
}

/** Props for the empty and failed states. */
interface IEventsStateProps {
  /** Opens the New event modal. */
  onNew: () => void
  /** Why the events did not load, when they did not. */
  text: string | undefined
}

/**
 * The state of a squad with no events, or whose events did not load.
 * @returns The empty state, with a way to plan the first event.
 */
const NoEvents = ({ onNew, text }: IEventsStateProps): ReactElement => {
  const { t } = useT()

  if (text !== undefined) {
    return <EmptyState art="squads" body={text} title={t('screens.events.errorTitle')} />
  }

  return (
    <EmptyState
      action={
        <Button block onPress={onNew}>
          {t('screens.events.newEvent')}
        </Button>
      }
      art="squads"
      body={t('screens.events.emptyBody')}
      title={t('screens.events.emptyTitle')}
    />
  )
}

/**
 * What the Events tab holds below the squad's tabs: the card that needs an answer (on a phone), the
 * open events as cards, the closed ones as rows and Show older events while there are further
 * pages. Placeholders while the first page loads, then the empty state, or the error when nothing
 * loaded; an error after that, such as a failed answer, shows above the cards.
 * @returns The cards, rows and buttons of the tab.
 */
export const EventsBlock = ({ newInRow, onNew, state, wide }: IEventsBlockProps): ReactElement => {
  const { t } = useT()
  const errorText = useErrorText(state.error, state.requestId)
  const { answering, needsAnswer, past, upcoming } = state

  if (state.loading) return <Skeleton variant="events" />

  if (upcoming.length === 0 && past.length === 0) {
    return <NoEvents onNew={onNew} text={errorText} />
  }

  return (
    <View className="gap-4">
      {errorText === undefined ? null : (
        <Text aria-live="polite" role="alert" tone="danger" variant="body-sm">
          {errorText}
        </Text>
      )}
      {needsAnswer === undefined || wide ? null : (
        <NeedsAnswerCard
          answering={answering?.eventId === needsAnswer.id ? answering.status : undefined}
          event={needsAnswer}
          onAnswer={state.rsvp}
        />
      )}
      <View className="flex-row items-center justify-between gap-2">
        <Text heading={2} variant="heading">
          {t('screens.events.comingUp')}
        </Text>
        {newInRow ? (
          <Button icon="plus" onPress={onNew} size="sm" variant="secondary">
            {t('screens.events.newEvent')}
          </Button>
        ) : null}
      </View>
      <View className={wide ? 'flex-row flex-wrap gap-4' : 'gap-4'}>
        {upcoming.map((event) => (
          <View className={wide ? 'min-w-72 flex-1' : ''} key={event.id}>
            <EventCard event={event} />
          </View>
        ))}
      </View>
      {past.length === 0 ? null : (
        <>
          <Text heading={2} variant="heading">
            {t('screens.events.past')}
          </Text>
          <List>
            {past.map((event) => (
              <PastEventRow event={event} key={event.id} />
            ))}
          </List>
        </>
      )}
      {state.hasMore ? (
        <Button
          loading={state.loadingMore}
          loadingLabel={t('common.loading')}
          onPress={state.loadMore}
          variant="ghost"
        >
          {t('screens.events.showOlder')}
        </Button>
      ) : null}
    </View>
  )
}

/**
 * The aside of the wide Events tab: the card that needs an answer, or its placeholder while the
 * events load. Nothing when no event needs an answer.
 * @returns The card, its placeholder or null.
 */
export const EventsAside = ({ state }: ISquadEventsProps): null | ReactElement => {
  if (state.loading) return <Skeleton variant="answer" />

  const { answering, needsAnswer } = state

  if (needsAnswer === undefined) return null

  return (
    <NeedsAnswerCard
      answering={answering?.eventId === needsAnswer.id ? answering.status : undefined}
      event={needsAnswer}
      onAnswer={state.rsvp}
    />
  )
}
