import { render, screen } from '@testing-library/react-native'

import { Price } from './Price.tsx'

describe('Price', () => {
  it('speaks the price level', async () => {
    await render(<Price level={2} />)

    expect(screen.getByLabelText('Price level 2 of 4')).toBeOnTheScreen()
  })

  it('renders nothing when the level is unknown', async () => {
    await render(<Price level={0} />)

    expect(screen.toJSON()).toBeNull()
  })
})
