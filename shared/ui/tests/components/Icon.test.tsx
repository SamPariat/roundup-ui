import { screen } from '@testing-library/react-native'

import { Icon } from '../../src/components/Icon.tsx'
import { ICONS } from '../../src/lib/icons.ts'
import { renderWithTheme } from '../helpers/render.tsx'

describe('Icon', () => {
  it('is announced as an image when it has a label', async () => {
    await renderWithTheme(<Icon label="Back" name="back" />)

    expect(screen.getByRole('image', { name: 'Back' })).toBeOnTheScreen()
  })

  it('is hidden from screen readers when decorative', async () => {
    await renderWithTheme(<Icon decorative name="check" />)

    expect(screen.queryByRole('image')).not.toBeOnTheScreen()
  })

  it.each(Object.keys(ICONS) as (keyof typeof ICONS)[])('draws %s', async (name) => {
    await renderWithTheme(<Icon label={name} name={name} />)

    expect(screen.getByRole('image', { name })).toBeOnTheScreen()
  })
})
