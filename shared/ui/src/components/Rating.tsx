import type { ReactElement } from 'react'

import { View } from 'react-native'

import { useT } from '@roundup/i18n'

import { Icon } from './Icon.tsx'
import { Text } from './Text.tsx'

export interface RatingProps {
  value: number
  count?: number
}

const countFormat = new Intl.NumberFormat('en-IN')

export const Rating = ({ count, value }: RatingProps): ReactElement => {
  const { t } = useT()

  const spoken =
    count === undefined
      ? t('rating.outOf', { value: value.toFixed(1) })
      : t('rating.outOfWithReviews', {
          reviews: countFormat.format(count),
          value: value.toFixed(1),
        })

  return (
    <View accessibilityLabel={spoken} accessible className="flex-row items-center gap-1" role="img">
      <Icon decorative name="star" size={16} tone="warning" />
      <Text variant="numeric">{value.toFixed(1)}</Text>
      {count === undefined ? null : (
        <Text tone="muted" variant="numeric">{`(${countFormat.format(count)})`}</Text>
      )}
    </View>
  )
}
