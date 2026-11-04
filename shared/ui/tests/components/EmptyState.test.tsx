import { screen } from '@testing-library/react-native'

import { EmptyState } from '../../src/components/EmptyState'
import { RenderHelper } from '../helpers/render'

describe('EmptyState', () => {
  it('titles itself with a heading', async () => {
    await RenderHelper.withTheme(<EmptyState title="No squads yet" />)

    expect(screen.getByRole('heading', { name: 'No squads yet' })).toBeOnTheScreen()
  })

  it('shows its body text', async () => {
    await RenderHelper.withTheme(
      <EmptyState body="Make one and add your friends." title="No squads yet" />,
    )

    expect(screen.getByText('Make one and add your friends.')).toBeOnTheScreen()
  })
})
