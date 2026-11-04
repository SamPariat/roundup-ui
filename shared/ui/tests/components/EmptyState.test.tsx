import { screen } from '@testing-library/react-native'

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
})
