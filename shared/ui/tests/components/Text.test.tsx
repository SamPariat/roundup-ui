import { render, screen } from '@testing-library/react-native'

import { Text } from '../../src/components/Text.tsx'

describe('Text', () => {
  it('renders its content', async () => {
    await render(<Text>Friday crew</Text>)

    expect(screen.getByText('Friday crew')).toBeOnTheScreen()
  })

  it('is exposed as a heading when given a level', async () => {
    await render(<Text heading={1}>Your squads</Text>)

    expect(screen.getByRole('heading', { name: 'Your squads' })).toBeOnTheScreen()
  })

  it('is plain text without a level', async () => {
    await render(<Text>Members</Text>)

    expect(screen.queryByRole('heading')).not.toBeOnTheScreen()
  })
})
