import type { ReactElement } from 'react'

import { View } from 'react-native'

import { Icon } from '../Icon/Icon.tsx'
import { Text } from '../Text/Text.tsx'

export interface RatingProps {
  value: number
  count?: number
}

const countFormat = new Intl.NumberFormat('en-IN')

export const Rating = ({ count, value }: RatingProps): ReactElement => {
  const spoken =
    count === undefined
      ? `${value.toFixed(1)} out of 5`
      : `${value.toFixed(1)} out of 5, ${countFormat.format(count)} reviews`

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
