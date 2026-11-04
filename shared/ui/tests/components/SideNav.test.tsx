import { fireEvent, screen } from '@testing-library/react-native'

import { SideNav } from '../../src/components/SideNav'
import { RenderHelper } from '../helpers/render'

describe('SideNav', () => {
  it('has one tab per destination with the current one selected', async () => {
    await RenderHelper.withTheme(<SideNav value="profile" />)

    expect(screen.getAllByRole('tab')).toHaveLength(3)
    expect(screen.getByRole('tab', { name: 'Profile' })).toBeSelected()
    expect(screen.getByRole('tab', { name: 'Squads' })).not.toBeSelected()
  })

  it('reports which destination was picked', async () => {
    const onChange = jest.fn()

    await RenderHelper.withTheme(<SideNav onChange={onChange} />)

    await fireEvent.press(screen.getByRole('tab', { name: 'Explore' }))

    expect(onChange).toHaveBeenCalledWith('explore')
  })

  it('shows the signed-in person', async () => {
    await RenderHelper.withTheme(
      <SideNav user={{ name: 'Meera Krishnan', phone: '+91 98765 43210' }} />,
    )

    expect(screen.getByText('+91 98765 43210')).toBeOnTheScreen()
  })
})
