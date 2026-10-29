import type { ReactElement } from 'react'

import { View } from 'react-native'

import { useT } from '@roundup/i18n'

import { Text } from './Text.tsx'

/** Google Places price level 0–4, drawn as ₹ marks. */
export interface PriceProps {
  level: 0 | 1 | 2 | 3 | 4
}

const MARKS = [1, 2, 3, 4] as const

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
