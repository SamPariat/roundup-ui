import { render, screen } from '@testing-library/react-native'

import { Skeleton } from '../../src/components/Skeleton.tsx'

describe('Skeleton', () => {
  it('is one busy region named Loading', async () => {
    await render(<Skeleton count={3} />)

    expect(screen.getByLabelText('Loading')).toBeBusy()
  })

  it('draws a card', async () => {
    await render(<Skeleton variant="card" />)

    expect(screen.getByLabelText('Loading')).toBeBusy()
  })
})
