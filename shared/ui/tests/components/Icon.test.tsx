import { screen } from '@testing-library/react-native'

import { Icon } from '../../src/components/Icon'
import { ICONS } from '../../src/lib/icons'
import { RenderHelper } from '../helpers/render'

describe('Icon', () => {
  it('is announced as an image when it has a label', async () => {
    await RenderHelper.withTheme(<Icon label="Back" name="back" />)

    expect(screen.getByRole('image', { name: 'Back' })).toBeOnTheScreen()
  })

  it('is hidden from screen readers when decorative', async () => {
    await RenderHelper.withTheme(<Icon decorative name="check" />)

    expect(screen.queryByRole('image')).not.toBeOnTheScreen()
  })

  it('draws every icon in the set', async () => {
    const names = Object.keys(ICONS) as (keyof typeof ICONS)[]

    for (const name of names) {
      await RenderHelper.withTheme(<Icon label={name} name={name} />)

      expect(screen.getByRole('image', { name })).toBeOnTheScreen()
    }
  })
})
