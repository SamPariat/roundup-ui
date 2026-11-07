import { onlineManager } from '@tanstack/react-query'
import { render } from '@testing-library/react-native'
import { Text } from 'react-native'

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
})
