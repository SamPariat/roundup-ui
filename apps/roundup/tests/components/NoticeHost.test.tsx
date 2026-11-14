import type { ReactElement } from 'react'

import { Slot } from 'expo-router'
import { act, fireEvent, screen } from 'expo-router/testing-library'
import { useCallback } from 'react'
import { Pressable, Text } from 'react-native'

import type { IBackend } from '../helpers/fakes'

import { FakeNetwork } from '../helpers/fakes'
import { Render } from '../helpers/render'
import WelcomeScreen from '@/app/index'
import { useNotify } from '@/hooks/useNotify'

/**
 * Stand-in for the tabs layout: renders the active tab.
 * @returns The slot.
 */
const TabsLayout = (): ReactElement => <Slot />

/**
 * Stand-in for the squads screen.
 * @returns A marker text.
 */
const Squads = (): ReactElement => <Text>screen: squads</Text>

/**
 * A screen that floats a notice when its button is pressed, as an event page does for new votes.
 * @returns The button.
 */
const Notifying = (): ReactElement => {
  const notify = useNotify()

  const handlePress = useCallback((): void => {
    notify({ id: 'n1', message: '2 new votes came in', tone: 'info' })
  }, [notify])

  return (
    <Pressable accessibilityRole="button" onPress={handlePress}>
      <Text>Notify</Text>
    </Pressable>
  )
}

/** The offline notice's text. */
const OFFLINE = "You're offline. We'll reconnect when you're back."

/** The backend of the current test. */
let backend: IBackend

/** The network of the current test. */
let network: FakeNetwork

describe('notice host', () => {
  beforeEach(() => {
    backend = { paths: [], user: { name: 'Asha' } }
    network = new FakeNetwork()
  })

  it('shows nothing while online', async () => {
    await Render.app({ index: WelcomeScreen }, { backend, network, url: '/' })

    expect(await screen.findByText('Continue with phone')).toBeOnTheScreen()
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('tells a signed-out visitor they are offline, then that they are back', async () => {
    await Render.app({ index: WelcomeScreen }, { backend, network, url: '/' })
    await screen.findByText('Continue with phone')

    await act(() => {
      network.set(false)
    })

    expect(await screen.findByRole('alert')).toHaveTextContent(OFFLINE)

    await act(() => {
      network.set(true)
    })

    expect(await screen.findByRole('status')).toHaveTextContent('Back online')
  })

  it("shows a screen's notice for a few seconds", async () => {
    await Render.app({ index: Notifying }, { backend, network, url: '/' })
    await screen.findByText('Notify')

    jest.useFakeTimers()

    try {
      await fireEvent.press(screen.getByRole('button', { name: 'Notify' }))

      expect(await screen.findByText('2 new votes came in')).toBeOnTheScreen()

      await act(() => {
        jest.advanceTimersByTime(4000)
      })

      await act(() => {
        jest.runOnlyPendingTimers()
      })

      expect(screen.queryByText('2 new votes came in')).toBeNull()
    } finally {
      jest.useRealTimers()
    }
  })

  it("puts being offline before a screen's notice", async () => {
    await Render.app({ index: Notifying }, { backend, network, url: '/' })
    await screen.findByText('Notify')

    await fireEvent.press(screen.getByRole('button', { name: 'Notify' }))

    await act(() => {
      network.set(false)
    })

    expect(await screen.findByRole('alert')).toHaveTextContent(OFFLINE)
    expect(screen.queryByText('2 new votes came in')).toBeNull()
  })

  it('tells a signed-in person they are offline too', async () => {
    await Render.app(
      { '(tabs)/_layout': TabsLayout, '(tabs)/squads': Squads, index: WelcomeScreen },
      { backend, guarded: true, network, saved: 'r1', url: '/squads' },
    )

    expect(await screen.findByText('screen: squads')).toBeOnTheScreen()

    await act(() => {
      network.set(false)
    })

    expect(await screen.findByRole('alert')).toHaveTextContent(OFFLINE)
  })
})
