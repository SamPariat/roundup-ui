import type { KeyboardEventName } from 'react-native'

import { act } from '@testing-library/react-native'
import { Keyboard } from 'react-native'

/**
 * Keyboard test helpers. Static methods only.
 */
export class KeyboardFixtures {
  /** The listeners code under test added, by event name. */
  private static readonly listeners = new Map<KeyboardEventName, () => void>()

  /** Records the keyboard listeners code adds from now on, so a test can raise the events itself. */
  static capture(): void {
    KeyboardFixtures.listeners.clear()

    jest.spyOn(Keyboard, 'addListener').mockImplementation((name, listener) => {
      KeyboardFixtures.listeners.set(name, listener as () => void)

      return { remove: jest.fn() }
    })
  }

  /**
   * Raises a keyboard event as the system would.
   * @param name - The event, such as keyboardWillShow.
   */
  static async emit(name: KeyboardEventName): Promise<void> {
    await act(() => KeyboardFixtures.listeners.get(name)?.())
  }
}
