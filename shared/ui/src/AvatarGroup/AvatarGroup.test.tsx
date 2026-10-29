import { screen } from '@testing-library/react-native'

import { renderWithTheme } from '../test/render.tsx'
import { AvatarGroup } from './AvatarGroup.tsx'

const people = [
  { id: '1', name: 'Meera Krishnan' },
  { id: '2', name: 'Arjun Rao' },
  { id: '3', name: 'Sana Khan' },
]

describe('AvatarGroup', () => {
  it('speaks the real member count', async () => {
    await renderWithTheme(<AvatarGroup people={people} total={12} />)

    expect(screen.getByLabelText('12 members')).toBeOnTheScreen()
  })

  it('shows how many more there are beyond the shown few', async () => {
    await renderWithTheme(<AvatarGroup max={2} people={people} total={12} />)

    expect(screen.getByText('+10', { includeHiddenElements: true })).toBeOnTheScreen()
  })
})
