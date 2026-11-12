import type { ReactElement } from 'react'

import { useRouter } from 'expo-router'
import { useCallback } from 'react'
import { View } from 'react-native'

import type { IFavoriteRow, IUseSquadFavorites } from '@roundup/core'

import { useT } from '@roundup/i18n'
import { Button, EmptyState, List, Skeleton, Text } from '@roundup/ui'

import { FavoriteRowItem } from '@/components/squads/FavoriteRow'
import { TabList } from '@/components/TabList'
import { useErrorText } from '@/hooks/useErrorText'
import { usePullRefresh } from '@/hooks/usePullRefresh'
import { Paths } from '@/navigation/paths'

/** What the favorites views read of the squad's favorites. */
type TFavorites = Pick<
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
  <View className="overflow-hidden rounded-2xl border border-border bg-bg-raised">
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

/** Props for PhoneFavorites. */
export interface IPhoneFavoritesProps {
  /** The squad's favorites, as useSquadFavorites gives them. */
  state: TFavorites & Pick<IUseSquadFavorites, 'refresh'>
  /** What sits above the rows: the squad's header and its tabs. */
  header: ReactElement
}

/**
 * The favorites on a phone: a list that loads more as its end comes into view and reloads on a
 * pull, under the squad's header. Failed loads and the empty list have their own states.
 * @returns The virtualized list.
 */
export const PhoneFavorites = ({ header, state }: IPhoneFavoritesProps): ReactElement => {
  const errorText = useErrorText(state.error, state.requestId)
  const { handleReload, refreshing } = usePullRefresh(state.refresh)
  const { remove, removingId } = state

  const renderCard = useCallback(
    (favorite: IFavoriteRow): ReactElement => renderFavorite(favorite, remove, removingId),
    [remove, removingId],
  )

  const keyOf = useCallback((favorite: IFavoriteRow): string => favorite.id, [])

  return (
    <TabList
      data={state.favorites}
      empty={errorText === undefined ? <NoFavorites /> : <FavoritesFailed text={errorText} />}
      header={header}
      keyExtractor={keyOf}
      loading={state.loading}
      loadingMore={state.loadingMore}
      onEndReached={state.loadMore}
      onRefresh={handleReload}
      refreshing={refreshing}
      renderItem={renderCard}
    />
  )
}
