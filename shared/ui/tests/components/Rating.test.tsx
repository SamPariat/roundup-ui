import { screen } from '@testing-library/react-native'

import { Rating } from '../../src/components/Rating'
import { RenderHelper } from '../helpers/render'

describe('Rating', () => {
  it('speaks the score and the review count', async () => {
    await RenderHelper.withTheme(<Rating count={1250} value={4.4} />)

    expect(screen.getByLabelText('4.4 out of 5, 1,250 reviews')).toBeOnTheScreen()
  })

  it('speaks only the score without a count', async () => {
    await RenderHelper.withTheme(<Rating value={4} />)

    expect(screen.getByLabelText('4.0 out of 5')).toBeOnTheScreen()
  })
})
