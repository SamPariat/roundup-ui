import type { ReactElement } from 'react'

import { View } from 'react-native'

import type { IVenueReview } from '@roundup/core'

import { useT } from '@roundup/i18n'
import { Rating, Text } from '@roundup/ui'

/** Props for VenueReviews. */
export interface IVenueReviewsProps {
  /** The reviews the venue has. */
  reviews: IVenueReview[]
  /** True on a wide screen: a Reviews heading, every review and when each was written. Otherwise the first alone. */
  wide: boolean
}

/**
 * The reviews of a venue: on a phone the first one, with its author, rating and text; on a wide
 * screen all of them under a Reviews heading, each also saying when it was written. Nothing is
 * drawn without reviews.
 * @returns The reviews, or null when there are none.
 */
export const VenueReviews = ({ reviews, wide }: IVenueReviewsProps): null | ReactElement => {
  const { t } = useT()
  const shown = wide ? reviews : reviews.slice(0, 1)

  if (shown.length === 0) return null

  return (
    <View className="gap-4">
      {wide ? (
        <Text heading={2} variant="heading">
          {t('screens.venue.reviews')}
        </Text>
      ) : null}
      {shown.map((review) => (
        <View
          className={wide ? 'gap-1 border-b border-border pb-4' : 'gap-1'}
          key={`${review.author}-${review.publishedAt}`}
        >
          <View className="flex-row items-center justify-between gap-3">
            <Text variant="body-strong">{review.author}</Text>
            <Rating value={review.rating} />
          </View>
          <Text tone="muted" variant="body-sm">
            {review.text}
          </Text>
          {wide ? (
            <Text tone="subtle" variant="caption">
              {review.publishedAt}
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  )
}
