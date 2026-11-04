import { fireEvent, screen } from '@testing-library/react-native'

import { Tabs } from '../../src/components/Tabs'
import { RenderHelper } from '../helpers/render'

const items = [
  { id: 'members', label: 'Members', count: 12 },
  { id: 'history', label: 'History' },
]

describe('Tabs', () => {
  it('marks only the current tab as selected', async () => {
    await RenderHelper.withTheme(<Tabs items={items} value="history" />)

    expect(screen.getByRole('tab', { name: 'History' })).toBeSelected()
    expect(screen.getByRole('tab', { name: 'Members, 12' })).not.toBeSelected()
  })

  it('reports the tab that was picked', async () => {
    const onChange = jest.fn()

    await RenderHelper.withTheme(<Tabs items={items} onChange={onChange} value="history" />)

    await fireEvent.press(screen.getByRole('tab', { name: 'Members, 12' }))

    expect(onChange).toHaveBeenCalledWith('members')
  })
})
