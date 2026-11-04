import type { ReactElement } from 'react'

import { Slot } from 'expo-router'
import { act, screen } from 'expo-router/testing-library'
import { Text } from 'react-native'

import type { IBackend } from '../helpers/fakes'

import WelcomeScreen from '../../src/app/index'
import { FakeNetwork } from '../helpers/fakes'
import { RenderHelper } from '../helpers/render'

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

/** The offline notice's text. */
const OFFLINE = "You're offline. We'll reconnect when you're back."

/** The backend of the current test. */
let backend: IBackend

/** The network of the current test. */
let network: FakeNetwork

describe('offline notice', () => {
  beforeEach(() => {
    backend = { paths: [], user: { name: 'Asha' } }
    network = new FakeNetwork()
  })

  it('shows nothing while online', async () => {
    await RenderHelper.app({ index: WelcomeScreen }, { backend, network, url: '/' })

    expect(await screen.findByText('Continue with phone')).toBeOnTheScreen()
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('tells a signed-out visitor they are offline, then that they are back', async () => {
    await RenderHelper.app({ index: WelcomeScreen }, { backend, network, url: '/' })
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

  it('tells a signed-in person they are offline too', async () => {
    await RenderHelper.app(
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
