import { fireEvent, screen } from '@testing-library/react-native'

import { BottomNav } from '../../src/components/BottomNav.tsx'
import { renderWithTheme } from '../helpers/render.tsx'

describe('BottomNav', () => {
  it('marks the current destination as selected', async () => {
    await renderWithTheme(<BottomNav value="explore" />)

    expect(screen.getByRole('tab', { name: 'Explore' })).toBeSelected()
    expect(screen.getByRole('tab', { name: 'Squads' })).not.toBeSelected()
  })

  it('defaults to Squads', async () => {
    await renderWithTheme(<BottomNav />)

    expect(screen.getByRole('tab', { name: 'Squads' })).toBeSelected()
  })

  it('reports which destination was picked', async () => {
    const onChange = jest.fn()

    await renderWithTheme(<BottomNav onChange={onChange} />)

    await fireEvent.press(screen.getByRole('tab', { name: 'Profile' }))

    expect(onChange).toHaveBeenCalledWith('profile')
  })
})
