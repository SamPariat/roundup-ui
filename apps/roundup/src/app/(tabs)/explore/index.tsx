import type { ReactElement } from 'react'

import { useCallback, useMemo, useState } from 'react'
import { Linking, Platform, View } from 'react-native'

import type { IVenueCard, TVenueType } from '@roundup/core'

import { useExploreViewModel, VenueType } from '@roundup/core'
import { useT } from '@roundup/i18n'
import { Button, EmptyState, Skeleton, Text, TextField } from '@roundup/ui'

import { TabList } from '@/components/TabList'
import { TabPage } from '@/components/TabPage'
import { FilterChip } from '@/components/venues/FilterChip'
import { VenueListCard } from '@/components/venues/VenueListCard'
import { useErrorText } from '@/hooks/useErrorText'
import { useWhenActive } from '@/hooks/useWhenActive'

/** One chip of the filter row. */
interface IFilter {
  /** The kind of place it selects. */
  type: TVenueType
  /** Its text. */
  label: string
}

/**
 * The Explore tab: finds the person, then lists places within 3 km of them as cards under a search
 * field and kind-of-place chips. It loads more as the end of the list comes into view and reloads
 * on a pull. Without access to the location it explains why Roundup asks, with a way to allow it:
 * Settings on a phone, a retry on the web (and on both, coming back to the app tries again).
 * @returns The results, or their placeholders, empty state or the location explanation.
 */
export default function ExploreScreen(): ReactElement {
  const { t } = useT()

  const {
    error,
    filter,
    hasMore,
    loading,
    loadingMore,
    loadMore,
    phase,
    query,
    radiusKm,
    refresh,
    requestId,
    retryLocation,
    setQuery,
    toggleFilter,
    venues,
  } = useExploreViewModel()

  const [refreshing, setRefreshing] = useState<boolean>(false)
  const errorText = useErrorText(error, requestId)

  const filters = useMemo(
    (): IFilter[] => [
      { label: t('screens.explore.filters.bars'), type: VenueType.BAR },
      { label: t('screens.explore.filters.restaurants'), type: VenueType.RESTAURANT },
      { label: t('screens.explore.filters.cafes'), type: VenueType.CAFE },
      { label: t('screens.explore.filters.nightClubs'), type: VenueType.NIGHT_CLUB },
    ],
    [t],
  )

  const handleOpenSettings = useCallback((): void => {
    void Linking.openSettings()
  }, [])

  // Coming back from Settings, or to the browser tab, tries the location again when it was refused.
  const handleReturn = useCallback((): void => {
    if (phase === 'denied') retryLocation()
  }, [phase, retryLocation])

  useWhenActive(handleReturn)

  const handleReload = useCallback(async (): Promise<void> => {
    setRefreshing(true)

    try {
      await refresh()
    } finally {
      setRefreshing(false)
    }
  }, [refresh])

  const handleLoadNext = useCallback((): void => {
    if (hasMore) loadMore()
  }, [hasMore, loadMore])

  const renderCard = useCallback(
    (venue: IVenueCard): ReactElement => <VenueListCard venue={venue} />,
    [],
  )

  const keyOf = useCallback((venue: IVenueCard): string => venue.id, [])

  if (phase === 'denied') {
    const label = Platform.select({
      default: t('screens.explore.denied.openSettings'),
      web: t('screens.explore.denied.tryAgain'),
    })

    const handlePress = Platform.select({ default: handleOpenSettings, web: retryLocation })

    return (
      <TabPage centered>
        <EmptyState
          action={<Button onPress={handlePress}>{label}</Button>}
          art="search"
          body={t('screens.explore.denied.body')}
          title={t('screens.explore.denied.title')}
        />
      </TabPage>
    )
  }

  const header =
    phase === 'ready' ? (
      <View className="gap-3 pb-3">
        <TextField
          icon="search"
          label={t('screens.explore.searchLabel')}
          onChangeText={setQuery}
          placeholder={t('screens.explore.searchPlaceholder')}
          value={query}
        />
        <View
          accessibilityLabel={t('screens.explore.filters.label')}
          className="flex-row flex-wrap gap-2"
          role="group"
        >
          {filters.map((item) => (
            <FilterChip
              key={item.type}
              label={item.label}
              onToggle={toggleFilter}
              selected={filter === item.type}
              type={item.type}
            />
          ))}
        </View>
        {loading ? null : (
          <Text aria-live="polite" tone="muted" variant="caption">
            {t('screens.explore.caption', { count: venues.length, km: radiusKm })}
          </Text>
        )}
      </View>
    ) : undefined

  const empty =
    errorText === undefined ? (
      <EmptyState
        art="search"
        body={t('screens.explore.emptyBody')}
        title={t('screens.explore.emptyTitle')}
      />
    ) : (
      <EmptyState art="search" body={errorText} title={t('screens.explore.errorTitle')} />
    )

  return (
    <TabList
      data={venues}
      empty={empty}
      footer={loadingMore ? <Skeleton variant="card" /> : undefined}
      header={header}
      keyExtractor={keyOf}
      loading={phase === 'locating' || loading}
      onEndReached={handleLoadNext}
      onRefresh={handleReload}
      refreshing={refreshing}
      renderItem={renderCard}
      skeleton="card"
    />
  )
}
