import { render, screen } from '@testing-library/react-native'

import { Spinner } from '../../src/components/Spinner'

describe('Spinner', () => {
  it('stays out of the accessibility tree', async () => {
    await render(<Spinner />)

    expect(screen.queryByRole('progressbar')).not.toBeOnTheScreen()
  })
})
