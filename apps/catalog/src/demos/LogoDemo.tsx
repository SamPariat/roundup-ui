import type { ReactElement } from 'react'

import { View } from 'react-native'

import { Logo } from '@roundup/ui'

import { Specimen } from '../components/Specimen.tsx'

/** The three artworks. */
const TYPES = ['lockup', 'mark', 'wordmark'] as const

/** The named sizes, from a nav bar to the splash screen. */
const SIZES = ['sm', 'md', 'lg', 'xl'] as const

/**
 * The logo as lockup, mark and wordmark, in brand and mono colour and at each size. Brand colours follow the theme.
 * @returns The specimens.
 */
export const LogoDemo = (): ReactElement => (
  <>
    {TYPES.map((type) => (
      <Specimen key={type} title={`type=${type} · tone=brand / mono`}>
        <View className="flex-row flex-wrap items-center gap-6">
          <Logo type={type} />
          <Logo tone="mono" type={type} />
        </View>
      </Specimen>
    ))}
    <Specimen title="size=sm · md · lg · xl">
      <View className="flex-row flex-wrap items-center gap-6">
        {SIZES.map((size) => (
          <Logo key={size} size={size} type="mark" />
        ))}
      </View>
    </Specimen>
    <Specimen title="size=64 (pixels) · type=lockup">
      <Logo size={64} />
    </Specimen>
  </>
)
