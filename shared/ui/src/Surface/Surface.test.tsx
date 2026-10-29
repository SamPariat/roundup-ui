import type { ComponentType } from 'react'

import { screen } from '@testing-library/react-native'
import { Platform } from 'react-native'

import { renderWithTheme } from '../test/render.tsx'
import { Text } from '../Text/Text.tsx'
import { Surface } from './Surface.tsx'

jest.mock('expo-glass-effect', () => {
  const { View } = jest.requireActual<{ View: ComponentType }>('react-native')
  return {
    GlassView: View,
    isLiquidGlassAvailable: jest.fn(() => true),
    isGlassEffectAPIAvailable: jest.fn(() => true),
  }
})

describe('Surface', () => {
  const originalOs = Platform.OS

  afterEach(() => {
    Platform.OS = originalOs
  })

  it('renders its children on a solid surface off iOS', async () => {
    Platform.OS = 'android'

    await renderWithTheme(
      <Surface>
        <Text>Inside</Text>
      </Surface>,
    )

    expect(screen.getByText('Inside')).toBeOnTheScreen()
  })

  it('renders its children over glass on iOS', async () => {
    Platform.OS = 'ios'

    await renderWithTheme(
      <Surface tone="sunken">
        <Text>Inside</Text>
      </Surface>,
    )

    expect(screen.getByText('Inside')).toBeOnTheScreen()
  })
})
