import type { ReactElement } from 'react'

import { useRouter } from 'expo-router'
import { useCallback } from 'react'
import { View } from 'react-native'

import type { IFavoriteRow, IUseSquadFavorites } from '@roundup/core'

import { useT } from '@roundup/i18n'
import { Button, EmptyState, List, Skeleton, Text, Toast } from '@roundup/ui'

import type { TSquadTab } from '@/navigation/squad-tab'

import { FavoriteRowItem } from '@/components/squads/FavoriteRow'
import { TabList } from '@/components/TabList'
import { useErrorText } from '@/hooks/useErrorText'
import { usePullRefresh } from '@/hooks/usePullRefresh'
import { Paths } from '@/navigation/paths'

/** What the favorites views read of the squad's favorites. */
export type TFavorites = Pick<
  IUseSquadFavorites,
  | 'complete'
  | 'error'
  | 'favorites'
  | 'hasMore'
  | 'loading'
  | 'loadingMore'
  | 'loadMore'
  | 'remove'
  | 'removingId'
  | 'requestId'
>

/** Props for the favorites views. */
export interface ISquadFavoritesProps {
  /** The squad's favorites, as useSquadFavorites gives them. */
  state: TFavorites
}

/**
 * The empty state of a squad's favorites, with a way to Explore to save the first place.
 * @returns The empty state.
 */
const NoFavorites = (): ReactElement => {
  const { t } = useT()
  const router = useRouter()

  const handleExplore = useCallback((): void => {
    router.push(Paths.tabsExplore())
  }, [router])

  return (
    <EmptyState
      action={<Button onPress={handleExplore}>{t('screens.squad.favorites.emptyAction')}</Button>}
      art="favorites"
      body={t('screens.squad.favorites.emptyBody')}
      title={t('screens.squad.favorites.emptyTitle')}
    />
  )
}

/**
 * The body of the aside: placeholders while the first page loads, the empty state, or the rows.
 * @returns The list of favorites in the state that applies.
 */
const AsideBody = ({ state }: ISquadFavoritesProps): ReactElement => {
  if (state.loading) return <Skeleton count={3} />

  if (state.favorites.length === 0) return <NoFavorites />

  return (
    <List>
      {state.favorites.map((favorite) => (
        <FavoriteRowItem
          favorite={favorite}
          key={favorite.id}
          onRemove={state.remove}
          removing={state.removingId === favorite.id}
        />
      ))}
    </List>
  )
}

/**
 * The favorites on the wide layout: a heading that counts what is saved, the rows in a list, and
 * Show more while there are further pages. Before the last page the count carries a "+", since the
 * API sends no total.
 * @returns The aside's content.
 */
export const FavoritesAside = ({ state }: ISquadFavoritesProps): ReactElement => {
  const { t } = useT()
  const errorText = useErrorText(state.error, state.requestId)
  const count = state.favorites.length

  const heading = t(
    state.complete ? 'screens.squad.favorites.saved' : 'screens.squad.favorites.savedMore',
    { count },
  )

  /**
   *
   */
  return (
    <View className="gap-3">
      <Text heading={2} variant="heading">
        {heading}
      </Text>
      {errorText === undefined ? null : (
        <Text aria-live="polite" role="alert" tone="danger" variant="body-sm">
          {errorText}
        </Text>
      )}
      <AsideBody state={state} />
      {state.hasMore ? (
        <Button
          loading={state.loadingMore}
          loadingLabel={t('common.loading')}
          onPress={state.loadMore}
          variant="secondary"
        >
          {t('screens.squad.favorites.showMore')}
        </Button>
      ) : null}
    </View>
  )
}

/**
 * Draws one favorite as a bordered card, for the phone's list of favorites.
 * @param favorite - The favorite to draw.
 * @param remove - Takes the person's save out of the favorites.
 * @param removingId - The venue whose save is being removed, if any.
 * @returns The card.
 */
const renderFavorite = (
  favorite: IFavoriteRow,
  remove: TFavorites['remove'],
  removingId: string | undefined,
): ReactElement => (
  <View className="max-w-160 overflow-hidden rounded-2xl border border-border bg-bg-raised">
    <FavoriteRowItem favorite={favorite} onRemove={remove} removing={removingId === favorite.id} />
  </View>
)

/** Props for FavoritesFailed. */
interface IFavoritesFailedProps {
  /** Why the favorites did not load. */
  text: string
}

/**
 * The state of a squad's favorites that did not load.
 * @returns The error state.
 */
const FavoritesFailed = ({ text }: IFavoritesFailedProps): ReactElement => {
  const { t } = useT()

  return <EmptyState art="favorites" body={text} title={t('screens.squad.favorites.errorTitle')} />
}

/** The one row of the list while the Members tab shows: the whole members block. */
interface IMembersRow {
  /** Tells it from a favorite. */
  kind: 'members'
}

/** The one row of the list while the Events tab shows: the whole events block. */
interface IEventsRow {
  /** Tells it from a favorite. */
  kind: 'events'
}

/** What the phone's list holds: the members or events block, or the favorites. */
type TPhoneRow = IEventsRow | IFavoriteRow | IMembersRow

/** The members block as the list's only row. */
const MEMBERS_ROW: IMembersRow = { kind: 'members' }

/** The list's rows on the Members tab. */
const MEMBERS_ROWS: readonly IMembersRow[] = [MEMBERS_ROW]

/** The events block as the list's only row. */
const EVENTS_ROW: IEventsRow = { kind: 'events' }

/** The list's rows on the Events tab. */
const EVENTS_ROWS: readonly IEventsRow[] = [EVENTS_ROW]

/**
 * Picks the rows the list holds for a tab.
 * @param tab - The tab that shows.
 * @param favorites - The squad's favorites, the rows of the Favorites tab.
 * @returns The members block, the events block or the favorites.
 */
const phoneRows = (tab: TSquadTab, favorites: readonly IFavoriteRow[]): readonly TPhoneRow[] => {
  if (tab === 'events') return EVENTS_ROWS

  return tab === 'favorites' ? favorites : MEMBERS_ROWS
}

/** Props for PhoneSquad. */
export interface IPhoneSquadProps {
  /** The squad's favorites, as useSquadFavorites gives them. */
  state: TFavorites & Pick<IUseSquadFavorites, 'refresh'>
  /** What sits above the rows: the squad's header and its tabs. */
  header: ReactElement
  /** Which tab shows below the header. */
  tab: TSquadTab
  /** The members block, drawn while the Members tab shows. */
  members: ReactElement
  /** The events block, drawn while the Events tab shows. */
  events: ReactElement
  /** Loads the squad's events again, on a pull while the Events tab shows. */
  refreshEvents: () => Promise<void>
  /** The floating Add people button, when the person may add members. */
  fab?: ReactElement | undefined
}

/**
 * The squad's body on a phone: one list under the squad's header and tabs, so switching tabs
 * changes only the rows below them. All tabs are one column, as in the design's squad board
 * (members and favorites are lists of rows, not grids of cards), so a tab switch never changes the
 * list's columns, which would remount it with its header. The Members and Events tabs are their
 * blocks as the list's single row; the Events tab reloads on a pull. The Favorites tab loads more as its end comes into view and reloads on a pull; failed
 * loads and the empty list have their own states.
 * @returns The virtualized list.
 */
export const PhoneSquad = ({
  events,
  fab,
  header,
  members,
  refreshEvents,
  state,
  tab,
}: IPhoneSquadProps): ReactElement => {
  const errorText = useErrorText(state.error, state.requestId)
  const showingFavorites = tab === 'favorites'
  const showingEvents = tab === 'events'
  const { handleReload, refreshing } = usePullRefresh(showingEvents ? refreshEvents : state.refresh)
  const { remove, removingId } = state

  const renderRow = useCallback(
    (row: TPhoneRow): ReactElement => {
      if (!('kind' in row)) return renderFavorite(row, remove, removingId)

      return <View className="max-w-160">{row.kind === 'events' ? events : members}</View>
    },
    [events, members, remove, removingId],
  )

  const keyOf = useCallback((row: TPhoneRow): string => ('kind' in row ? row.kind : row.id), [])

  // A first load that failed fills the screen; once rows exist, an error (a failed Remove from
  // favorites, or a later page) is a Toast over them, which the empty state cannot show.
  const failed = showingFavorites && errorText !== undefined && state.favorites.length > 0

  const toast = failed ? <Toast tone="error">{errorText}</Toast> : undefined

  return (
    <TabList<TPhoneRow>
      columns={1}
      data={phoneRows(tab, state.favorites)}
      empty={errorText === undefined ? <NoFavorites /> : <FavoritesFailed text={errorText} />}
      fab={showingFavorites ? undefined : fab}
      header={header}
      keyExtractor={keyOf}
      loading={showingFavorites && state.loading}
      loadingMore={showingFavorites && state.loadingMore}
      onEndReached={showingFavorites ? state.loadMore : undefined}
      onRefresh={showingFavorites || showingEvents ? handleReload : undefined}
      refreshing={refreshing}
      renderItem={renderRow}
      toast={toast}
    />
  )
}
