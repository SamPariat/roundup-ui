import type { ReactElement } from 'react'

import { View } from 'react-native'

import { useT } from '@roundup/i18n'

import { Text } from './Text.tsx'

/** Google Places price level 0–4, drawn as ₹ marks. */
export interface PriceProps {
  /** 0 means unknown (nothing is drawn); 1 to 4 is how many of four marks are lit. */
  level: 0 | 1 | 2 | 3 | 4
}

const MARKS = [1, 2, 3, 4] as const

/**
 * Draws a price level as four ₹ marks, lit up to the level and dimmed after it, spoken as "Price level N of 4".
 * @returns The mark row, or null for level 0 (unknown).
 */
export const Price = ({ level }: PriceProps): null | ReactElement => {
  const { t } = useT()

  if (level === 0) return null

  return (
    <View
      accessibilityLabel={t('price.level', { level })}
      accessible
      className="flex-row"
      role="img"
    >
      {MARKS.map((mark) => (
        <Text key={mark} tone={mark <= level ? 'fg' : 'subtle'} variant="label">
          {t('price.mark')}
        </Text>
      ))}
    </View>
  )
}
