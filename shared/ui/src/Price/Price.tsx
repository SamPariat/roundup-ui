import type { ReactElement } from 'react'

import { View } from 'react-native'

import { Text } from '../Text/Text.tsx'

/** Google Places price level 0–4, drawn as ₹ marks. */
export interface PriceProps {
  level: 0 | 1 | 2 | 3 | 4
}

const MARKS = [1, 2, 3, 4] as const

export const Price = ({ level }: PriceProps): null | ReactElement => {
  if (level === 0) return null

  return (
    <View
      accessibilityLabel={`Price level ${String(level)} of 4`}
      accessible
      className="flex-row"
      role="img"
    >
      {MARKS.map((mark) => (
        <Text key={mark} tone={mark <= level ? 'fg' : 'subtle'} variant="label">
          ₹
        </Text>
      ))}
    </View>
  )
}
