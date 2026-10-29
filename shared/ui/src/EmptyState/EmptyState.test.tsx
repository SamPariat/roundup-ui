import { screen } from '@testing-library/react-native'

import { renderWithTheme } from '../test/render.tsx'
import { EmptyState } from './EmptyState.tsx'

describe('EmptyState', () => {
  it('titles itself with a heading', async () => {
    await renderWithTheme(<EmptyState title="No squads yet" />)

    expect(screen.getByRole('heading', { name: 'No squads yet' })).toBeOnTheScreen()
  })

  it('shows its body text', async () => {
    await renderWithTheme(
      <EmptyState body="Make one and add your friends." title="No squads yet" />,
    )

    expect(screen.getByText('Make one and add your friends.')).toBeOnTheScreen()
  })

  it.each(['squads', 'search', 'favorites'] as const)('draws the %s art', async (art) => {
    await renderWithTheme(<EmptyState art={art} title="Nothing here" />)

    expect(screen.getByRole('heading')).toBeOnTheScreen()
  })
})
