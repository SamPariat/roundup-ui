import type { ReactElement } from 'react'

import { fireEvent, screen, waitFor } from '@testing-library/react-native'
import { useCallback, useState } from 'react'
import { Keyboard, Platform } from 'react-native'

import { Button } from '../../src/components/Button'
import { Modal } from '../../src/components/Modal'
import { Text } from '../../src/components/Text'
import { KeyboardFixtures } from '../helpers/keyboard'
import { Render } from '../helpers/render'

/**
 * Modal test helpers. Static methods only.
 */
class ModalFixtures {
  /**
   * onRequestClose lives on the native Modal, the ancestor of the dialog Surface; fireEvent wants that element.
   * @returns The native modal's host element.
   */
  static modalHost() {
    let node = screen.getByLabelText('Add member')

    while (node.props['onRequestClose'] === undefined && node.parent !== null) node = node.parent

    return node
  }

  /**
   * The tallest the dialog may grow, which is set on the view around it.
   * @returns The cap in points.
   */
  static maxHeight(): number | undefined {
    let node = screen.getByLabelText('Add member').parent

    while (node !== null) {
      const cap = (
        node.props['style'] as
          | undefined
          | {
              /**
               *
               */
              maxHeight?: unknown
            }
      )?.maxHeight

      if (typeof cap === 'number') return cap

      node = node.parent
    }

    return undefined
  }

  /**
   * The sheet's bottom padding, which the Modal sets on the dialog Surface.
   * @returns The padding in points.
   */
  static paddingBottom(): unknown {
    const style: unknown = screen.getByLabelText('Add member').props['style']
    const styles: unknown[] = Array.isArray(style) ? style.flat() : [style]

    return styles
      .map(
        (entry) =>
          (
            entry as
              | undefined
              | {
                  /** The bottom padding. */
                  paddingBottom?: unknown
                }
          )?.paddingBottom,
      )
      .findLast((value) => value !== undefined)
  }

  /**
   * The blurred backdrop behind the dialog. It is hidden from assistive technology, so it is found
   * by walking up from the dialog to the sibling that hides its descendants.
   * @returns The backdrop's host element.
   */
  static backdrop() {
    let root = screen.getByLabelText('Add member')

    while (root.parent !== null) root = root.parent

    const pending = [root]

    for (let node = pending.pop(); node !== undefined; node = pending.pop()) {
      if (node.props['importantForAccessibility'] === 'no-hide-descendants') return node

      for (const child of node.children) if (typeof child !== 'string') pending.push(child)
    }

    throw new Error('The modal has no backdrop')
  }
}

describe('Modal', () => {
  describe('on each platform', () => {
    const originalOs = Platform.OS

    afterEach(() => {
      Platform.OS = originalOs
      Reflect.deleteProperty(globalThis, 'document')
    })

    it('draws its own opening motion in the app instead of the system one', async () => {
      Platform.OS = 'ios'

      await Render.withTheme(<Modal title="Add member" />)

      expect(ModalFixtures.modalHost().props['animationType']).toBe('none')
    })

    it('draws its own fade on web too, as a centered card', async () => {
      Platform.OS = 'web'

      // On web the theme provider writes data-theme to <html>; this suite runs without a DOM.
      Object.defineProperty(globalThis, 'document', {
        configurable: true,
        value: { documentElement: { dataset: {}, style: {} } },
      })

      await Render.withTheme(<Modal title="Add member" />)

      expect(ModalFixtures.modalHost().props['animationType']).toBe('none')
    })

    it('lets the sheet grow to the status bar, so a form that fits shows whole', async () => {
      Platform.OS = 'ios'

      await Render.withTheme(
        <Modal title="Add member">
          <Text>Body</Text>
        </Modal>,
      )

      // The window is 1334 points tall here and the safe area has no insets.
      expect(ModalFixtures.maxHeight()).toBe(1334 - 16)
    })

    it('sits the last action a small gap over the home indicator', async () => {
      Platform.OS = 'ios'

      await Render.withTheme(
        <Modal title="Add member">
          <Text>Body</Text>
        </Modal>,
        { insets: { bottom: 34, left: 0, right: 0, top: 59 } },
      )

      expect(ModalFixtures.paddingBottom()).toBe(34 + 8)
    })

    it('puts the keyboard away when the sheet is tapped outside its fields', async () => {
      Platform.OS = 'ios'
      const dismiss = jest.spyOn(Keyboard, 'dismiss')

      await Render.withTheme(
        <Modal title="Add member">
          <Text>Body</Text>
        </Modal>,
      )

      await fireEvent.press(screen.getByText('Add member'))

      expect(dismiss).toHaveBeenCalled()

      jest.restoreAllMocks()
    })

    it('drops the home indicator inset while the keyboard is up', async () => {
      Platform.OS = 'ios'
      KeyboardFixtures.capture()

      await Render.withTheme(
        <Modal title="Add member">
          <Text>Body</Text>
        </Modal>,
      )

      // 24 points of padding over an inset of 0 here.
      expect(ModalFixtures.paddingBottom()).toBe(24)

      await KeyboardFixtures.emit('keyboardWillShow')

      expect(ModalFixtures.paddingBottom()).toBe(16)

      await KeyboardFixtures.emit('keyboardWillHide')

      expect(ModalFixtures.paddingBottom()).toBe(24)

      jest.restoreAllMocks()
    })

    it('keeps the web card to 85% of the window', async () => {
      Platform.OS = 'web'

      Object.defineProperty(globalThis, 'document', {
        configurable: true,
        value: { documentElement: { dataset: {}, style: {} } },
      })

      await Render.withTheme(
        <Modal title="Add member">
          <Text>Body</Text>
        </Modal>,
      )

      expect(ModalFixtures.maxHeight()).toBeCloseTo(1334 * 0.85)
    })
  })

  it('has no close button, so its own actions close it', async () => {
    await Render.withTheme(
      <Modal
        actions={[<Button key="leave">Leave</Button>]}
        body="You can rejoin later."
        title="Leave squad?"
        tone="confirm"
      />,
    )

    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeOnTheScreen()
    expect(screen.getByRole('button', { name: 'Leave' })).toBeOnTheScreen()
  })

  it('is a dialog named by its title', async () => {
    await Render.withTheme(
      <Modal title="Add member">
        <Text>Body</Text>
      </Modal>,
    )

    expect(screen.getByRole('heading', { name: 'Add member' })).toBeOnTheScreen()
    expect(screen.getByLabelText('Add member')).toBeOnTheScreen()
  })

  it('closes when the system asks it to (Esc or the Android back button)', async () => {
    const onClose = jest.fn()

    await Render.withTheme(
      <Modal onClose={onClose} title="Add member">
        <Text>Body</Text>
      </Modal>,
    )

    await fireEvent(ModalFixtures.modalHost(), 'requestClose')

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  it('closes when the backdrop is tapped', async () => {
    const onClose = jest.fn()

    await Render.withTheme(
      <Modal onClose={onClose} title="Add member">
        <Text>Body</Text>
      </Modal>,
    )

    await fireEvent.press(ModalFixtures.backdrop())

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  it('shows nothing while not visible', async () => {
    await Render.withTheme(<Modal title="Add member" visible={false} />)

    expect(screen.queryByRole('heading', { name: 'Add member' })).not.toBeOnTheScreen()
  })

  describe('while busy', () => {
    const busyModal = (
      <Modal
        actions={[
          <Button key="send" loading loadingLabel="Sending…">
            Send invite
          </Button>,
          <Button key="cancel" variant="secondary">
            Cancel
          </Button>,
        ]}
        busy
        onClose={jest.fn()}
        title="Add member"
      >
        <Text>Body</Text>
      </Modal>
    )

    it('disables every action except the one that is loading', async () => {
      await Render.withTheme(busyModal)

      expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Send invite' })).toBeBusy()
    })

    it('ignores the back button', async () => {
      const onClose = jest.fn()

      await Render.withTheme(
        <Modal busy onClose={onClose} title="Add member">
          <Text>Body</Text>
        </Modal>,
      )

      await fireEvent(ModalFixtures.modalHost(), 'requestClose')

      expect(onClose).not.toHaveBeenCalled()
    })

    it('ignores a tap on the backdrop', async () => {
      const onClose = jest.fn()

      await Render.withTheme(
        <Modal busy onClose={onClose} title="Add member">
          <Text>Body</Text>
        </Modal>,
      )

      await fireEvent.press(ModalFixtures.backdrop())

      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe('stacked on another modal', () => {
    it('opens on top of the modal it sits in and leaves it open when it closes', async () => {
      /**
       * A modal with a second modal in its body, as a form with a date field has.
       * @returns The outer modal.
       */
      const Stack = (): ReactElement => {
        const [open, setOpen] = useState<boolean>(true)

        const handleClose = useCallback((): void => {
          setOpen(false)
        }, [])

        return (
          <Modal title="Outer">
            <Modal
              actions={[
                <Button key="ok" onPress={handleClose}>
                  Dismiss
                </Button>,
              ]}
              onClose={handleClose}
              title="Inner"
              visible={open}
            />
          </Modal>
        )
      }

      await Render.withTheme(<Stack />)

      expect(screen.getByLabelText('Outer')).toBeOnTheScreen()
      expect(screen.getByLabelText('Inner')).toBeOnTheScreen()

      await fireEvent.press(screen.getByRole('button', { name: 'Dismiss' }))

      await waitFor(() => {
        expect(screen.queryByLabelText('Inner')).toBeNull()
      })

      expect(screen.getByLabelText('Outer')).toBeOnTheScreen()
    })
  })
})
