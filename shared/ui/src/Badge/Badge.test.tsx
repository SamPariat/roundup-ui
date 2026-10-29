import { render, screen } from '@testing-library/react-native'

import { Badge } from './Badge.tsx'

describe('Badge', () => {
  it('shows its words', async () => {
    await render(<Badge tone="success">Open</Badge>)

    expect(screen.getByText('Open')).toBeOnTheScreen()
  })

  it('renders without a dot for plain tags', async () => {
    await render(<Badge dot={false}>Bar</Badge>)

    expect(screen.getByText('Bar')).toBeOnTheScreen()
  })
})
