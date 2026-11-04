import { screen } from '@testing-library/react-native'

import { Avatar } from '../../src/components/Avatar'
import { AvatarHelper } from '../../src/lib/avatar-helper'
import { RenderHelper } from '../helpers/render'

describe('initialsOf', () => {
  it('uses the first and last name', () => {
    expect(AvatarHelper.initialsOf('Meera Krishnan Iyer')).toBe('MI')
  })

  it('uses one letter for a single name', () => {
    expect(AvatarHelper.initialsOf('meera')).toBe('M')
  })
})

describe('tintOf', () => {
  it('stays within the six tints', () => {
    for (const key of ['a', 'b', 'squad-7', 'x'.repeat(40)]) {
      expect(AvatarHelper.tintOf(key)).toBeGreaterThanOrEqual(1)
      expect(AvatarHelper.tintOf(key)).toBeLessThanOrEqual(6)
    }
  })
})

describe('Avatar', () => {
  it('is named after the person', async () => {
    await RenderHelper.withTheme(<Avatar name="Meera Krishnan" />)

    expect(screen.getByRole('image', { name: 'Meera Krishnan' })).toBeOnTheScreen()
  })
})
