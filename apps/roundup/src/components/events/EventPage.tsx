import type { NativeStackNavigationOptions } from 'expo-router'
import type { ReactElement } from 'react'
import type { ViewStyle } from 'react-native'
import type { Edge } from 'react-native-safe-area-context'

import { Stack, useRouter } from 'expo-router'
import { useCallback, useMemo } from 'react'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import type { IEventInfo, IUseEvent } from '@roundup/core'

import { EventStatus, useEvent, useSquad } from '@roundup/core'
import { useT } from '@roundup/i18n'
import { AvatarGroup, Badge, Button, EmptyState, List, Skeleton, Text } from '@roundup/ui'

import { EventText } from '@/components/events/event-text'
import { NominationRow } from '@/components/events/NominationRow'
import { RsvpChips } from '@/components/events/RsvpChips'
import { TabPage } from '@/components/TabPage'
import { useErrorText } from '@/hooks/useErrorText'
import { useLayout } from '@/hooks/useLayout'
import { Paths } from '@/navigation/paths'

/** Props for EventPage. */
export interface IEventPageProps {
  /** The event to show. */
  eventId: string
}

/** Props for the sections of the page. */
interface ISectionProps {
  /** The event the section is about. */
  event: IEventInfo
}

/** The edge iOS's floating tab bar covers, which the footer stops above. */
const BOTTOM: readonly Edge[] = ['bottom']

/** Fills the width under the page's content. */
const FOOTER: ViewStyle = { width: '100%' }

/**
 * What the event is, at the top of its page: its status, kind of night and squad, when it starts
 * and who started it.
 * @returns The status line, the date and who started it.
 */
const Summary = ({
  event,
  squadName,
}: ISectionProps & {
  /** The squad's name, once it has loaded. */ squadName: string | undefined
}): ReactElement => {
  const { t } = useT()
  const type = EventText.type(t, event.type)

  return (
    <View className="gap-1.5">
      <View className="flex-row flex-wrap items-center gap-2">
        <Badge tone={EventText.tone(event.status)}>{EventText.status(t, event.status)}</Badge>
        <Text tone="muted" variant="caption">
          {squadName === undefined ? type : t('screens.event.typeIn', { squad: squadName, type })}
        </Text>
      </View>
      <Text variant="body-strong">{event.when}</Text>
      <Text tone="muted" variant="body-sm">
        {EventText.startedBy(t, event)}
      </Text>
    </View>
  )
}

/** Props for Answer. */
interface IAnswerProps extends ISectionProps {
  /** The answer being sent, if any. */
  answering: IUseEvent['answering']
  /** Sends the person's answer. */
  onAnswer: IUseEvent['rsvp']
}

/**
 * The person's answer to "Are you in?" as chips, for an event they may answer.
 * @returns The label and the chips, or null when the person may not answer.
 */
const Answer = ({ answering, event, onAnswer }: IAnswerProps): null | ReactElement => {
  const { t } = useT()

  if (!event.permissions.canRsvp) return null

  return (
    <View className="gap-2">
      <Text variant="label">{t('screens.event.areYouIn')}</Text>
      <RsvpChips onSelect={onAnswer} value={answering ?? event.myRsvp} />
    </View>
  )
}

/**
 * The card of who is going: their avatars, and how many answered each way.
 * @returns The card.
 */
const Going = ({ event }: ISectionProps): ReactElement => {
  const { t } = useT()
  const { going, maybe, pending } = event.rsvpCounts

  return (
    <View className="gap-1.5 rounded-2xl border border-border bg-bg-raised p-4 lg:p-5">
      <AvatarGroup max={5} people={event.going} size={32} total={going} />
      <Text tone="muted" variant="caption">
        {t('screens.event.counts', { going, maybe, pending })}
      </Text>
    </View>
  )
}

/** Props for Places. */
interface IPlacesProps extends ISectionProps {
  /** The suggestion being taken back, if any. */
  removingId: string | undefined
  /** Takes a suggestion back. */
  onRemove: IUseEvent['remove']
}

/**
 * The places suggested so far, each with a Remove button where the person may take it back.
 * @returns The heading and the list.
 */
const Places = ({ event, onRemove, removingId }: IPlacesProps): ReactElement => {
  const { t } = useT()

  return (
    <View className="gap-2">
      <View className="flex-row items-baseline justify-between">
        <Text heading={2} variant="heading">
          {t('screens.event.places')}
        </Text>
        <Text tone="muted" variant="caption">
          {t('screens.event.suggested', { count: event.nominations.length })}
        </Text>
      </View>
      {event.nominations.length === 0 ? null : (
        <List>
          {event.nominations.map((nomination) => (
            <NominationRow
              key={nomination.id}
              nomination={nomination}
              onRemove={onRemove}
              removing={removingId === nomination.id}
            />
          ))}
        </List>
      )}
    </View>
  )
}

/** Props for EventLoading. */
interface IEventLoadingProps {
  /** True on the wide layout, where the answer and who is going sit in an aside. */
  wide: boolean
}

/**
 * The placeholders of an event's page while it loads: the sections, with the aside beside them on
 * the wide layout and the pinned bar below them where Start voting would be.
 * @returns The placeholders.
 */
const EventLoading = ({ wide }: IEventLoadingProps): ReactElement => {
  const { pageHeader } = useLayout()

  return (
    <View className="flex-1">
      <TabPage>
        {wide ? (
          <View className="flex-row items-start gap-8">
            <View className="min-w-0 flex-1">
              <Skeleton variant="event" />
            </View>
            <View className="w-90 shrink-0">
              <Skeleton variant="rsvp" />
            </View>
          </View>
        ) : (
          <Skeleton variant="event" />
        )}
      </TabPage>
      {pageHeader ? null : (
        <View className="border-t border-border bg-bg px-4 pt-3 pb-4">
          <Skeleton variant="bar" />
        </View>
      )}
    </View>
  )
}

/** Props for StartFooter. */
interface IStartFooterProps {
  /** True while voting is being started. */
  starting: boolean
  /** Starts voting. */
  onStart: () => Promise<void>
}

/**
 * The bar pinned below a draft on a phone: Start voting and the note that suggestions close.
 * @returns The bar.
 */
const StartFooter = ({ onStart, starting }: IStartFooterProps): ReactElement => {
  const { t } = useT()

  return (
    <SafeAreaView edges={BOTTOM} style={FOOTER}>
      <View className="gap-1.5 border-t border-border bg-bg px-4 pt-3 pb-4">
        <Button
          block
          loading={starting}
          loadingLabel={t('screens.event.startingVoting')}
          onPress={onStart}
        >
          {t('screens.event.startVoting')}
        </Button>
        <Text className="text-center" tone="muted" variant="caption">
          {t('screens.event.startNote')}
        </Text>
      </View>
    </SafeAreaView>
  )
}

/**
 * One event: its status, date and who started it, the person's answer, who is going and, while it
 * is a draft, the places suggested so far, with Start voting for those who may. On a phone the
 * sections stack and Start voting is pinned below them; from 1024 wide the answer and who is going
 * sit in an aside, and on web and Android Start voting sits in the page's header. An event that
 * does not exist, or that the person cannot see, shows a not-found state.
 * @returns The event, a placeholder while it loads, or the not-found state.
 */
export const EventPage = ({ eventId }: IEventPageProps): ReactElement => {
  const { t } = useT()
  const router = useRouter()
  const { nav, pageHeader } = useLayout()
  const wide = nav === 'side'

  const {
    answering,
    error,
    event,
    loading,
    notFound,
    remove,
    removingId,
    requestId,
    rsvp,
    start,
    starting,
  } = useEvent(eventId)

  const { squad } = useSquad(event?.squadId)
  const errorText = useErrorText(error, requestId)
  const startable = event?.status === EventStatus.DRAFT && event.permissions.canStartVoting

  const handleStart = useCallback(async (): Promise<void> => {
    await start()
  }, [start])

  const handleGoToSquads = useCallback((): void => {
    router.dismissTo(Paths.tabsSquads())
  }, [router])

  const renderHeaderRight = useCallback(
    (): null | ReactElement =>
      startable && pageHeader ? (
        <Button
          loading={starting}
          loadingLabel={t('screens.event.startingVoting')}
          onPress={handleStart}
        >
          {t('screens.event.startVoting')}
        </Button>
      ) : null,
    [handleStart, pageHeader, startable, starting, t],
  )

  const headerOptions = useMemo(
    (): NativeStackNavigationOptions => ({ headerRight: renderHeaderRight }),
    [renderHeaderRight],
  )

  if (notFound || (event === undefined && error !== undefined)) {
    return (
      <TabPage centered>
        <EmptyState
          action={
            <Button block onPress={handleGoToSquads}>
              {t('screens.event.notFoundAction')}
            </Button>
          }
          art="search"
          title={notFound ? t('screens.event.notFoundTitle') : t('screens.event.errorTitle')}
          {...(errorText === undefined ? {} : { body: errorText })}
        />
      </TabPage>
    )
  }

  if (loading || event === undefined) {
    return <EventLoading wide={wide} />
  }

  const draft = event.status === EventStatus.DRAFT

  const summary = <Summary event={event} squadName={squad?.name} />
  const answer = <Answer answering={answering} event={event} onAnswer={rsvp} />
  const going = <Going event={event} />

  const places = draft ? <Places event={event} onRemove={remove} removingId={removingId} /> : null

  const alert =
    errorText === undefined ? null : (
      <Text aria-live="polite" role="alert" tone="danger" variant="body-sm">
        {errorText}
      </Text>
    )

  const body = wide ? (
    <View className="flex-row items-start gap-8">
      <View className="min-w-0 flex-1 gap-4">
        {summary}
        {places}
        {startable ? (
          <Text tone="muted" variant="caption">
            {t('screens.event.startNote')}
          </Text>
        ) : null}
      </View>
      <View className="w-90 shrink-0 gap-4">
        {answer}
        {going}
      </View>
    </View>
  ) : (
    <View className="gap-5">
      {summary}
      {answer}
      {going}
      {places}
    </View>
  )

  const footer =
    startable && !pageHeader ? <StartFooter onStart={handleStart} starting={starting} /> : null

  return (
    <View className="flex-1">
      <Stack.Screen options={headerOptions} />
      <TabPage>
        <View className="gap-4">
          {alert}
          {body}
        </View>
      </TabPage>
      {footer}
    </View>
  )
}
