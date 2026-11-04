import { screen } from '@testing-library/react-native'

import { AvatarGroup } from '../../src/components/AvatarGroup'
import { RenderHelper } from '../helpers/render'

const people = [
  { id: '1', name: 'Meera Krishnan' },
  { id: '2', name: 'Arjun Rao' },
  { id: '3', name: 'Sana Khan' },
]

describe('AvatarGroup', () => {
  it('speaks the real member count', async () => {
    await RenderHelper.withTheme(<AvatarGroup people={people} total={12} />)

    expect(screen.getByLabelText('12 members')).toBeOnTheScreen()
  })

  it('shows how many more there are beyond the shown few', async () => {
    await RenderHelper.withTheme(<AvatarGroup max={2} people={people} total={12} />)

    expect(screen.getByText('+10', { includeHiddenElements: true })).toBeOnTheScreen()
  })
})
