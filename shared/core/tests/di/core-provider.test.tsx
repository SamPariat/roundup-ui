import type { ReactElement } from 'react'
import type { AppStateStatus } from 'react-native'

import { focusManager, onlineManager, useQuery } from '@tanstack/react-query'
import { act, render } from '@testing-library/react-native'
import { AppState, Text } from 'react-native'

import { TestCore } from '../helpers/wrapper'

describe('CoreProvider', () => {
  it('leaves no hold on its network source after it unmounts', async () => {
    const { network, wrapper: Wrapper } = TestCore.create()

    const { unmount } = await render(
      <Wrapper>
        <Text>App</Text>
      </Wrapper>,
    )

    expect(network.listenerCount).toBeGreaterThan(0)

    await unmount()

    // onlineManager is global: whatever subscribes to it next must not reach this provider's network.
    const stop = onlineManager.subscribe(jest.fn())

    expect(network.listenerCount).toBe(0)

    stop()
  })

  describe('when the app state changes', () => {
    let handler: ((state: AppStateStatus) => void) | undefined
    const fetches = jest.fn<string, []>(() => 'answer')

    /**
     * A stale query that counts how often it is read.
     * @returns The answer.
     */
    const Probe = (): ReactElement => {
      const { data } = useQuery({ queryFn: fetches, queryKey: ['probe'], staleTime: 0 })

      return <Text>{data}</Text>
    }

    /**
     * Sends an app state change to the listener the provider installed.
     * @param states - The states, in order.
     */
    const change = async (...states: AppStateStatus[]): Promise<void> => {
      await act(() => {
        for (const state of states) handler?.(state)
      })
    }

    beforeEach(() => {
      fetches.mockClear()
      handler = undefined

      jest.spyOn(AppState, 'addEventListener').mockImplementation((_type, listener) => {
        handler = listener

        return { remove: jest.fn() }
      })
    })

    afterEach(() => {
      jest.restoreAllMocks()
      focusManager.setFocused()
    })

    it('refetches a stale query on the way back from the background', async () => {
      const { wrapper: Wrapper } = TestCore.create()

      await render(
        <Wrapper>
          <Probe />
        </Wrapper>,
      )

      expect(fetches).toHaveBeenCalledTimes(1)

      await change('inactive', 'background', 'active')

      expect(fetches).toHaveBeenCalledTimes(2)
    })

    it('does not refetch when only a system sheet came and went', async () => {
      const { wrapper: Wrapper } = TestCore.create()

      await render(
        <Wrapper>
          <Probe />
        </Wrapper>,
      )

      await change('inactive', 'active')

      expect(fetches).toHaveBeenCalledTimes(1)
    })
  })
})
