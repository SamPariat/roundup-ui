import type { ReactElement } from 'react'

import { Platform, View } from 'react-native'

import { Text, ThemeSwitch, useTheme } from '@roundup/ui'

import { FRAME_OPTIONS, useFrame } from '../hooks/useFrame.ts'
import { FrameChip } from './FrameChip.tsx'

/**
 * The theme switch (system, Latte or Mocha) and, on the web, the preview width picker, which sit above every demo.
 * @returns The row of controls.
 */
export const Toolbar = (): ReactElement => {
  const { preference, setPreference } = useTheme()
  const { setWidth, width } = useFrame()

  return (
    <View className="flex-row flex-wrap items-center gap-x-6 gap-y-3">
      <ThemeSwitch onChange={setPreference} value={preference} />
      {Platform.OS === 'web' ? (
        <View className="flex-row items-center gap-2">
          <Text tone="muted" variant="label">
            Width
          </Text>
          <View accessibilityLabel="Preview width" className="flex-row gap-2" role="group">
            {FRAME_OPTIONS.map((option) => (
              <FrameChip
                key={option.id}
                onSelect={setWidth}
                option={option}
                selected={option.id === width}
              />
            ))}
          </View>
        </View>
      ) : null}
    </View>
  )
}
