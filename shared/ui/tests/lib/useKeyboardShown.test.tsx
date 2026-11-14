import { renderHook } from '@testing-library/react-native'
import { Platform } from 'react-native'

import { useKeyboardShown } from '../../src/lib/useKeyboardShown'
import { KeyboardFixtures } from '../helpers/keyboard'

describe('useKeyboardShown', () => {
  const os = Platform.OS

  beforeEach(() => {
    KeyboardFixtures.capture()
    KeyboardFixtures.followPlatform()
  })

  afterEach(() => {
    Platform.OS = os
    jest.restoreAllMocks()
  })

  it('follows the keyboard as it starts to move on iOS', async () => {
    Platform.OS = 'ios'
    const { result } = await renderHook(() => useKeyboardShown())

    expect(result.current).toBe(false)

    await KeyboardFixtures.emit('keyboardWillShow')

    expect(result.current).toBe(true)

    await KeyboardFixtures.emit('keyboardWillHide')

    expect(result.current).toBe(false)
  })

  it('follows the keyboard once it has moved on Android', async () => {
    Platform.OS = 'android'
    const { result } = await renderHook(() => useKeyboardShown())

    await KeyboardFixtures.emit('keyboardDidShow')

    expect(result.current).toBe(true)

    await KeyboardFixtures.emit('keyboardDidHide')

    expect(result.current).toBe(false)
  })
})
