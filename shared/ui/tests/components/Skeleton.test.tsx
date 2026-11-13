import { render, screen } from '@testing-library/react-native'

import { Skeleton } from '../../src/components/Skeleton'

describe('Skeleton', () => {
  it('is one busy region named Loading', async () => {
    await render(<Skeleton count={3} />)

    expect(screen.getByLabelText('Loading')).toBeBusy()
  })

  it.each([
    'answer',
    'bar',
    'card',
    'event',
    'events',
    'item',
    'rsvp',
    'search',
    'squad',
    'venue',
  ] as const)('is one busy region as a %s', async (variant) => {
    await render(<Skeleton variant={variant} />)

    expect(screen.getByLabelText('Loading')).toBeBusy()
  })
})
