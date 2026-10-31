import { fireEvent, screen } from '@testing-library/react-native'

import { Button } from '../../src/components/Button.tsx'
import { Modal } from '../../src/components/Modal.tsx'
import { Text } from '../../src/components/Text.tsx'
import { renderWithTheme } from '../helpers/render.tsx'

/**
 * onRequestClose lives on the native Modal, the ancestor of the dialog Surface; fireEvent wants that element.
 * @returns The native modal's host element.
 */
const modalHost = () => {
  let node = screen.getByLabelText('Add member')

  while (node.props['onRequestClose'] === undefined && node.parent !== null) node = node.parent

  return node
}

describe('Modal', () => {
  it('is a dialog named by its title', async () => {
    await renderWithTheme(
      <Modal title="Add member">
        <Text>Body</Text>
      </Modal>,
    )

    expect(screen.getByRole('heading', { name: 'Add member' })).toBeOnTheScreen()
    expect(screen.getByLabelText('Add member')).toBeOnTheScreen()
  })

  it('closes when the system asks it to (Esc or the Android back button)', async () => {
    const onClose = jest.fn()

    await renderWithTheme(
      <Modal onClose={onClose} title="Add member">
        <Text>Body</Text>
      </Modal>,
    )

    await fireEvent(modalHost(), 'requestClose')

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes from its Close button', async () => {
    const onClose = jest.fn()

    await renderWithTheme(
      <Modal onClose={onClose} title="Add member">
        <Text>Body</Text>
      </Modal>,
    )

    await fireEvent.press(screen.getByRole('button', { name: 'Close' }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('has no Close button on a confirmation', async () => {
    await renderWithTheme(
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
    await renderWithTheme(
      <Modal closable={false} title="Add member">
        <Text>Body</Text>
      </Modal>,
    )

    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeOnTheScreen()
  })

  it('shows nothing while not visible', async () => {
    await renderWithTheme(<Modal title="Add member" visible={false} />)

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
      await renderWithTheme(busyModal)

      expect(screen.queryByRole('button', { name: 'Close' })).not.toBeOnTheScreen()
    })

    it('disables every action except the one that is loading', async () => {
      await renderWithTheme(busyModal)

      expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Send invite' })).toBeBusy()
    })

    it('ignores the back button', async () => {
      const onClose = jest.fn()

      await renderWithTheme(
        <Modal busy onClose={onClose} title="Add member">
          <Text>Body</Text>
        </Modal>,
      )

      await fireEvent(modalHost(), 'requestClose')

      expect(onClose).not.toHaveBeenCalled()
    })
  })
})
