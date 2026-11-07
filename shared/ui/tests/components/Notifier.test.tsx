import type { ReactElement } from 'react'

import { act, fireEvent, screen } from '@testing-library/react-native'
import { useCallback, useState } from 'react'
import { AccessibilityInfo, Pressable, Text } from 'react-native'

import type { INotice } from '../../src/components/Notifier'

import { Notifier } from '../../src/components/Notifier'
import { Render } from '../helpers/render'

/** An offline notice. */
const OFFLINE: INotice = { id: 'offline', message: 'You are offline', tone: 'error' }

/** The notice that follows it. */
const BACK: INotice = { id: 'back', message: 'Back online', tone: 'success' }

/** Props for Host. */
interface IHostProps {
  /** The notice on screen at first. */
  first?: INotice
  /** The notice a press switches to; undefined clears it. */
  next?: INotice
}

/**
 * A notifier whose notice changes when the button is pressed, as it does in the app.
 * @returns The notifier and the button.
 */
const Host = ({ first, next }: IHostProps): ReactElement => {
  const [notice, setNotice] = useState<INotice | undefined>(first)

  const change = useCallback((): void => {
    setNotice(next)
  }, [next])

  return (
    <>
      <Notifier notice={notice} />
      <Pressable accessibilityRole="button" onPress={change}>
        <Text>change</Text>
      </Pressable>
    </>
  )
}

describe('Notifier', () => {
  afterEach(() => {
    jest.restoreAllMocks()
    jest.useRealTimers()
  })

  it('renders nothing without a notice', async () => {
    await Render.withTheme(<Notifier />)

    expect(screen.queryByRole('alert')).toBeNull()
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('shows an error notice as an alert', async () => {
    await Render.withTheme(<Notifier notice={OFFLINE} />)

    expect(screen.getByRole('alert')).toHaveTextContent('You are offline')
  })

  it('shows a success notice as a status', async () => {
    await Render.withTheme(<Notifier notice={BACK} />)

    expect(screen.getByRole('status')).toHaveTextContent('Back online')
  })

  it('replaces the message when the notice changes', async () => {
    await Render.withTheme(<Host first={OFFLINE} next={BACK} />)
    await fireEvent.press(screen.getByRole('button', { name: 'change' }))

    expect(screen.getByRole('status')).toHaveTextContent('Back online')
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('lets touches through everywhere but the toast', async () => {
    const { toJSON } = await Render.withTheme(<Notifier notice={OFFLINE} />)

    expect(JSON.stringify(toJSON())).toContain('"pointerEvents":"box-none"')
  })

  it('stays until it has slid out, then unmounts', async () => {
    jest.useFakeTimers()

    await Render.withTheme(<Host first={OFFLINE} />)
    await fireEvent.press(screen.getByRole('button', { name: 'change' }))

    expect(screen.getByRole('alert')).toBeOnTheScreen()

    await act(async () => {
      await jest.advanceTimersByTimeAsync(500)
    })

    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('hides within a frame under Reduce Motion, not after the slide', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true)
    jest.useFakeTimers()

    await Render.withTheme(<Host first={OFFLINE} />)

    await act(async () => {
      await jest.advanceTimersByTimeAsync(0)
    })

    await fireEvent.press(screen.getByRole('button', { name: 'change' }))

    await act(async () => {
      await jest.advanceTimersByTimeAsync(50)
    })

    expect(screen.queryByRole('alert')).toBeNull()
  })
})
