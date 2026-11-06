import { fireEvent, screen, waitFor } from '@testing-library/react-native'
import { Platform } from 'react-native'

import { Button } from '../../src/components/Button'
import { Modal } from '../../src/components/Modal'
import { Text } from '../../src/components/Text'
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

  it('closes from its Close button', async () => {
    const onClose = jest.fn()

    await Render.withTheme(
      <Modal onClose={onClose} title="Add member">
        <Text>Body</Text>
      </Modal>,
    )

    await fireEvent.press(screen.getByRole('button', { name: 'Close' }))

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  it('has no Close button on a confirmation', async () => {
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

  it('can hide its Close button', async () => {
    await Render.withTheme(
      <Modal closable={false} title="Add member">
        <Text>Body</Text>
      </Modal>,
    )

    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeOnTheScreen()
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

    it('hides the close button', async () => {
      await Render.withTheme(busyModal)

      expect(screen.queryByRole('button', { name: 'Close' })).not.toBeOnTheScreen()
    })

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
})
