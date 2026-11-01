import type { ReactElement } from 'react'

import { View } from 'react-native'

import { Surface, Text, useGlass } from '@roundup/ui'

import { Specimen } from '../components/Specimen.tsx'

/** The tones of a surface. */
const TONES = ['raised', 'sunken'] as const

/**
 * Surface in both tones on the page background, then over coloured shapes, where Liquid Glass
 * shows on iOS 26. Elsewhere, or with Reduce Transparency on, the surface is solid.
 * @returns The specimens.
 */
export const SurfaceDemo = (): ReactElement => {
  const { available, reduced } = useGlass()

  return (
    <>
      <Specimen
        note={`Liquid Glass is ${available && !reduced ? 'on' : 'off'} here (available: ${String(available)}, reduce transparency: ${String(reduced)}).`}
        title="Glass status"
      >
        <Text tone="muted">
          Only iOS 26 and later draws glass, and only when transparency is not reduced.
        </Text>
      </Specimen>
      {TONES.map((tone) => (
        <Specimen key={tone} title={`tone=${tone}`}>
          <Surface className="rounded-2xl p-4" tone={tone}>
            <Text variant="body-strong">{`A ${tone} surface`}</Text>
            <Text tone="muted" variant="body-sm">
              Cards and dialogs are raised; bars and tracks are sunken.
            </Text>
          </Surface>
        </Specimen>
      ))}
      <Specimen
        note="Glass blurs what is behind it; a solid surface hides it."
        title="Over a backdrop"
      >
        <View className="h-48 justify-center overflow-hidden rounded-2xl bg-bg-sunken p-4">
          <View className="absolute top-4 left-4 size-24 rounded-full bg-accent" />
          <View className="absolute top-12 right-8 size-28 rounded-full bg-highlight" />
          <View className="absolute bottom-2 left-24 size-20 rounded-full bg-info" />
          <Surface className="rounded-2xl p-4" tone="raised">
            <Text variant="body-strong">Raised surface</Text>
            <Text tone="muted" variant="body-sm">
              The shapes behind it show through as glass.
            </Text>
          </Surface>
        </View>
      </Specimen>
    </>
  )
}
