import { fireEvent, screen } from '@testing-library/react-native'

import { Welcome } from '../../src/components/Welcome.tsx'
import { renderWithTheme } from '../helpers/render.tsx'

const layoutAt = async (width: number): Promise<void> => {
  await fireEvent(screen.getByLabelText('Welcome to Roundup'), 'layout', {
    nativeEvent: { layout: { width, height: 800, x: 0, y: 0 } },
  })
}

describe('Welcome', () => {
  it('leads with the page title as a level 1 heading', async () => {
    await renderWithTheme(<Welcome />)

    expect(
      screen.getByRole('header', { name: 'Weekend plans for the whole squad.' }),
    ).toBeOnTheScreen()
  })

  it('starts sign-in from its button', async () => {
    const onStart = jest.fn()

    await renderWithTheme(<Welcome onStart={onStart} />)

    await fireEvent.press(screen.getByRole('button', { name: 'Continue with phone' }))

    expect(onStart).toHaveBeenCalledTimes(1)
  })

  it('takes its own title, body and button label', async () => {
    await renderWithTheme(<Welcome body="Body text" startLabel="Get going" title="Hello squad" />)

    expect(screen.getByText('Hello squad')).toBeOnTheScreen()
    expect(screen.getByText('Body text')).toBeOnTheScreen()
    expect(screen.getByRole('button', { name: 'Get going' })).toBeOnTheScreen()
  })

  it.each([360, 766, 768, 1440])('keeps all three points at %i wide', async (width) => {
    await renderWithTheme(<Welcome />)
    await layoutAt(width)

    expect(screen.getByText('Squads')).toBeOnTheScreen()
    expect(screen.getByText('Explore')).toBeOnTheScreen()
    expect(screen.getByText('History')).toBeOnTheScreen()
  })
})
