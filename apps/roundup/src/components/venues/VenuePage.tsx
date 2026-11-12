import type { NativeStackNavigationOptions } from 'expo-router'
import type { ReactElement } from 'react'

import { Stack, useRouter } from 'expo-router'
import { useCallback, useMemo, useState } from 'react'
import { View } from 'react-native'

import type { IVenueInfo } from '@roundup/core'

import { useVenue } from '@roundup/core'
import { useT } from '@roundup/i18n'
import { Button, EmptyState, FloatingActionButton, Skeleton, Text } from '@roundup/ui'

import { TabPage } from '@/components/TabPage'
import { SaveVenueModal } from '@/components/venues/SaveVenueModal'
import { VenueDetails } from '@/components/venues/VenueDetails'
import { VenueFacts } from '@/components/venues/VenueFacts'
import { VenueHeader } from '@/components/venues/VenueHeader'
import { VenuePhotoGrid } from '@/components/venues/VenuePhotoGrid'
import { VenueReviews } from '@/components/venues/VenueReviews'
import { useErrorText } from '@/hooks/useErrorText'
import { useLayout } from '@/hooks/useLayout'
import { Paths } from '@/navigation/paths'

/** What separates a venue's tags from its address in the line under the title. */
const TAG_SEPARATOR = ' · '

/**
 * A header button that draws nothing: the options type has no undefined for headerRight, and
 * options merge, so this is how the wide layout's Save leaves the header.
 * @returns Null, which React draws as no element.
 */
const renderNothing = (): null => null

/** Props for VenuePage. */
export interface IVenuePageProps {
  /** The venue's Google place ID. */
  placeId: string
}

/**
 * One venue. On a phone: its photo, name, rating, price and whether it is open now, then its
 * summary, a list of its address, hours, phone, website and the squads it is saved in, and its
 * first review, with Save to squad floating over the page. On a wide screen: the header holds
 * Save to squad, the photos tile a grid, About and every review stand on the left, and the facts
 * and the list sit in a raised card on the right. A venue that does not exist shows a not-found
 * state with a way to Explore. Both the Explore tab and the Squads tab show it, each in its own
 * stack, so Back returns to where the person came from.
 * @returns The venue, a placeholder while it loads, or the not-found state.
 */
export const VenuePage = ({ placeId }: IVenuePageProps): ReactElement => {
  const { t } = useT()
  const router = useRouter()
  const { nav, systemChrome } = useLayout()
  const [saving, setSaving] = useState<boolean>(false)
  const { error, loading, notFound, requestId, venue } = useVenue(placeId)
  const errorText = useErrorText(error, requestId)
  const wide = nav === 'side'
  const inHeader = wide && !systemChrome

  const handleGoToExplore = useCallback((): void => {
    router.dismissTo(Paths.tabsExplore())
  }, [router])

  const handleOpenSave = useCallback((): void => {
    setSaving(true)
  }, [])

  const handleCloseSave = useCallback((): void => {
    setSaving(false)
  }, [])

  const renderHeaderRight = useCallback(
    (): ReactElement => (
      <Button icon="bookmark" onPress={handleOpenSave}>
        {t('venueCard.save')}
      </Button>
    ),
    [handleOpenSave, t],
  )

  // Options merge, so leaving the wide layout must replace Save, not just stop setting it.
  const headerOptions = useMemo(
    (): NativeStackNavigationOptions => ({
      headerRight: inHeader ? renderHeaderRight : renderNothing,
    }),
    [inHeader, renderHeaderRight],
  )

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
        <Skeleton variant="venue" />
      </TabPage>
    )
  }

  const save = inHeader ? undefined : (
    <FloatingActionButton icon="bookmark" onPress={handleOpenSave}>
      {t('venueCard.save')}
    </FloatingActionButton>
  )

  const body = wide ? <WideVenue venue={venue} /> : <PhoneVenue venue={venue} />

  return (
    <>
      <Stack.Screen options={headerOptions} />
      <TabPage fab={save}>{body}</TabPage>
      {saving ? (
        <SaveVenueModal name={venue.name} onClose={handleCloseSave} placeId={venue.id} />
      ) : null}
    </>
  )
}

/** Props for the two layouts of the page. */
interface ILayoutProps {
  /** The venue to lay out. */
  venue: IVenueInfo
}

/**
 * The phone layout: header, summary, list and the first review in one column.
 * @returns The column.
 */
const PhoneVenue = ({ venue }: ILayoutProps): ReactElement => (
  <View className="gap-6">
    <VenueHeader venue={venue} />
    {venue.summary === undefined ? null : (
      <Text tone="muted" variant="body-sm">
        {venue.summary}
      </Text>
    )}
    <VenueDetails venue={venue} />
    <VenueReviews reviews={venue.reviewList} wide={false} />
  </View>
)

/**
 * The wide layout: the photo grid, then About and the reviews beside a raised card of the facts
 * and the list.
 * @returns The grid and the two columns.
 */
const WideVenue = ({ venue }: ILayoutProps): ReactElement => {
  const { t } = useT()
  const line = [...venue.types, ...(venue.address === undefined ? [] : [venue.address])]

  return (
    <View className="gap-8">
      <VenuePhotoGrid photos={venue.photos} />
      <View className="flex-row items-start gap-8">
        <View className="max-w-160 min-w-0 flex-1 gap-6">
          <View className="gap-2">
            <Text heading={2} variant="heading">
              {t('screens.venue.about')}
            </Text>
            <Text tone="muted" variant="body-sm">
              {line.join(TAG_SEPARATOR)}
            </Text>
            {venue.summary === undefined ? null : <Text tone="muted">{venue.summary}</Text>}
          </View>
          <VenueReviews reviews={venue.reviewList} wide />
        </View>
        <View className="w-80 gap-4 rounded-2xl border border-border bg-bg-raised p-5">
          <VenueFacts venue={venue} />
          <VenueDetails venue={venue} />
        </View>
      </View>
    </View>
  )
}
