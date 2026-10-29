import { screen } from '@testing-library/react-native'

import { Avatar } from '../../src/components/Avatar.tsx'
import { initialsOf, tintOf } from '../../src/lib/avatar-tint.ts'
import { renderWithTheme } from '../helpers/render.tsx'

describe('initialsOf', () => {
  it('uses the first and last name', () => {
    expect(initialsOf('Meera Krishnan Iyer')).toBe('MI')
  })

  it('uses one letter for a single name', () => {
    expect(initialsOf('meera')).toBe('M')
  })
})

describe('tintOf', () => {
  it('is stable for the same key', () => {
    expect(tintOf('user-42')).toBe(tintOf('user-42'))
  })

  it('stays within the six tints', () => {
    for (const key of ['a', 'b', 'squad-7', 'x'.repeat(40)]) {
      expect(tintOf(key)).toBeGreaterThanOrEqual(1)
      expect(tintOf(key)).toBeLessThanOrEqual(6)
    }
  })
})

describe('Avatar', () => {
  it('is named after the person', async () => {
    await renderWithTheme(<Avatar name="Meera Krishnan" />)

    expect(screen.getByRole('image', { name: 'Meera Krishnan' })).toBeOnTheScreen()
  })
})
