import { render, screen } from '@testing-library/react-native'

import { Badge } from '../../src/components/Badge.tsx'

describe('Badge', () => {
  it('shows its words', async () => {
    await render(<Badge tone="success">Open</Badge>)

    expect(screen.getByText('Open')).toBeOnTheScreen()
  })
})
