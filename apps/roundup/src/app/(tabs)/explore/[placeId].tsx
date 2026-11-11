import type { ReactElement } from 'react'

import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { View } from 'react-native'

import { useVenue } from '@roundup/core'
import { useT } from '@roundup/i18n'
import { Button, EmptyState, FloatingActionButton, Rating, Skeleton, Text } from '@roundup/ui'

import { TabPage } from '@/components/TabPage'
import { SaveVenueModal } from '@/components/venues/SaveVenueModal'
import { VenueDetails } from '@/components/venues/VenueDetails'
import { VenueHeader } from '@/components/venues/VenueHeader'
import { useErrorText } from '@/hooks/useErrorText'
import { Paths } from '@/navigation/paths'

/**
 * One venue: its photo, name, rating, price and whether it is open now, then its summary, a list
 * of its address, hours, phone, website and the squads it is saved in, and its first review. Save
 * to squad floats over the page and opens the sheet that picks the squads. A venue that does not
 * exist shows a not-found state with a way back.
 * @returns The venue, a placeholder while it loads, or the not-found state.
 */
export default function VenueScreen(): ReactElement {
  const { placeId } = useLocalSearchParams<'/explore/[placeId]'>()
  const { t } = useT()
  const router = useRouter()
  const [saving, setSaving] = useState<boolean>(false)
  const { error, loading, notFound, requestId, venue } = useVenue(placeId)
  const errorText = useErrorText(error, requestId)

  const handleGoToExplore = useCallback((): void => {
    router.dismissTo(Paths.tabsExplore())
  }, [router])

  const handleOpenSave = useCallback((): void => {
    setSaving(true)
  }, [])

  const handleCloseSave = useCallback((): void => {
    setSaving(false)
  }, [])

  if (notFound || (venue === undefined && error !== undefined)) {
    return (
      <TabPage centered>
        <EmptyState
          action={<Button onPress={handleGoToExplore}>{t('screens.venue.notFoundAction')}</Button>}
          art="search"
          title={notFound ? t('screens.venue.notFoundTitle') : t('screens.venue.errorTitle')}
          {...(errorText === undefined ? {} : { body: errorText })}
        />
      </TabPage>
    )
  }

  if (loading || venue === undefined) {
    return (
      <TabPage>
        <Skeleton count={5} />
      </TabPage>
    )
  }

  const { review } = venue

  const save = (
    <FloatingActionButton icon="bookmark" onPress={handleOpenSave}>
      {t('venueCard.save')}
    </FloatingActionButton>
  )

  return (
    <>
      <TabPage fab={save}>
        <View className="max-w-160 gap-6">
          <VenueHeader venue={venue} />
          {venue.summary === undefined ? null : <Text tone="muted">{venue.summary}</Text>}
          <VenueDetails venue={venue} />
          {review === undefined ? null : (
            <View className="gap-3">
              <Text heading={2} variant="heading">
                {t('screens.venue.review')}
              </Text>
              <View className="gap-2 rounded-2xl border border-border bg-bg-raised p-4">
                <Rating value={review.rating} />
                <Text>{review.text}</Text>
                <Text tone="muted" variant="caption">
                  {t('screens.venue.reviewBy', {
                    author: review.author,
                    publishedAt: review.publishedAt,
                  })}
                </Text>
              </View>
            </View>
          )}
        </View>
      </TabPage>
      {saving ? (
        <SaveVenueModal name={venue.name} onClose={handleCloseSave} placeId={venue.id} />
      ) : null}
    </>
  )
}
