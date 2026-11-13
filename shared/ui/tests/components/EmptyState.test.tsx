import { screen } from '@testing-library/react-native'

import { Button } from '../../src/components/Button'
import { EmptyState } from '../../src/components/EmptyState'
import { Render } from '../helpers/render'

describe('EmptyState', () => {
  it('titles itself with a heading', async () => {
    await Render.withTheme(<EmptyState title="No squads yet" />)

    expect(screen.getByRole('heading', { name: 'No squads yet' })).toBeOnTheScreen()
  })

  it('shows its body text', async () => {
    await Render.withTheme(
      <EmptyState body="Make one and add your friends." title="No squads yet" />,
    )

    expect(screen.getByText('Make one and add your friends.')).toBeOnTheScreen()
  })

  it('gives its action the whole width of the content column', async () => {
    await Render.withTheme(
      <EmptyState action={<Button block>New event</Button>} title="No events yet" />,
    )

    const button = screen.getByRole('button', { name: 'New event' })

    expect(button).toHaveProp('className', expect.stringContaining('w-full'))
    expect(button.parent).toHaveProp('className', expect.stringContaining('w-full'))
  })
})
