import { render, screen } from '@testing-library/react-native'

import { Text } from '../../src/components/Text'

describe('Text', () => {
  it('is exposed as a heading when given a level', async () => {
    await render(<Text heading={1}>Your squads</Text>)

    expect(screen.getByRole('heading', { name: 'Your squads' })).toBeOnTheScreen()
  })

  it('is plain text without a level', async () => {
    await render(<Text>Members</Text>)

    expect(screen.queryByRole('heading')).not.toBeOnTheScreen()
  })

  it('keeps the device text size from enlarging it past 1.3 times', async () => {
    await render(<Text>Members</Text>)

    expect(screen.getByText('Members')).toHaveProp('maxFontSizeMultiplier', 1.3)
  })

  it('lets a caller set a tighter limit', async () => {
    await render(<Text maxFontSizeMultiplier={1.1}>Members</Text>)

    expect(screen.getByText('Members')).toHaveProp('maxFontSizeMultiplier', 1.1)
  })
})
