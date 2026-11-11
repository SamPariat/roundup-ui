import type { ReactElement } from 'react'

import { useCallback, useMemo } from 'react'
import { Linking, Platform, View } from 'react-native'

import type { IVenueCard, TVenueType } from '@roundup/core'

import { RADIUS_STEPS_KM, useExploreViewModel, VenueType } from '@roundup/core'
import { useT } from '@roundup/i18n'
import { Button, EmptyState, Skeleton, Text, TextField } from '@roundup/ui'

import { TabList } from '@/components/TabList'
import { TabPage } from '@/components/TabPage'
import { FilterChip } from '@/components/venues/FilterChip'
import { RadiusMenu } from '@/components/venues/RadiusMenu'
import { VenueListCard } from '@/components/venues/VenueListCard'
import { useErrorText } from '@/hooks/useErrorText'
import { useExploreParams } from '@/hooks/useExploreParams'
import { usePullRefresh } from '@/hooks/usePullRefresh'
import { useWhenActive } from '@/hooks/useWhenActive'

/** One chip of the filter row. */
interface IFilter {
  /** The kind of place it selects. */
  type: TVenueType
  /** Its text. */
  label: string
}

/**
 * The Explore tab: finds the person, then lists places within 3 km of them (or the radius they
 * pick) as cards under a search field and kind-of-place chips. The words, the kind of place and
 * the radius live in the URL's query, so a reload or a link restores them. It loads more as the end of the list comes into view and reloads
 * on a pull. Without access to the location it explains why Roundup asks, with a way to allow it:
 * Settings on a phone, a retry on the web (and on both, coming back to the app tries again).
 * @returns The results, or their placeholders, empty state or the location explanation.
 */
export default function ExploreScreen(): ReactElement {
  const { t } = useT()

  const { filter, query, radiusKm, setRadiusKm, setText, text, toggleFilter } = useExploreParams()

  const {
    error,
    hasMore,
    loading,
    loadingMore,
    loadMore,
    phase,
    refresh,
    requestId,
    retryLocation,
    venues,
  } = useExploreViewModel({ filter, query, radiusKm })

  const { handleReload, refreshing } = usePullRefresh(refresh)
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

  // The first load draws the field, chips and caption as blocks; later searches keep the real ones.
  const searching = phase === 'ready' && !loading

  const header = searching ? (
    <View className="gap-3 pb-3">
      <View className="flex-row flex-wrap items-center gap-3">
        <View className="w-full md:w-auto md:max-w-120 md:min-w-80 md:flex-1">
          <TextField
            icon="search"
            label={t('screens.explore.searchLabel')}
            onChangeText={setText}
            placeholder={t('screens.explore.searchPlaceholder')}
            value={text}
          />
        </View>
        <View
          accessibilityLabel={t('screens.explore.filters.label')}
          className="max-w-full flex-row flex-wrap gap-2"
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
          <RadiusMenu onChange={setRadiusKm} steps={RADIUS_STEPS_KM} value={radiusKm} />
        </View>
      </View>
      <Text aria-live="polite" tone="muted" variant="caption">
        {t('screens.explore.caption', { count: venues.length, km: radiusKm })}
      </Text>
    </View>
  ) : (
    <View className="pb-3">
      <Skeleton variant="search" />
    </View>
  )

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
      header={header}
      keyExtractor={keyOf}
      loading={phase === 'locating' || loading}
      loadingMore={loadingMore}
      onEndReached={handleLoadNext}
      onRefresh={handleReload}
      pinHeader
      refreshing={refreshing}
      renderItem={renderCard}
      skeleton="card"
    />
  )
}
