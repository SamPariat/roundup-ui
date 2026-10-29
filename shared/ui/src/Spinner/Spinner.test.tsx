import { render, screen } from '@testing-library/react-native'

import { Spinner } from './Spinner.tsx'

describe('Spinner', () => {
  it('stays out of the accessibility tree', async () => {
    await render(<Spinner />)

    expect(screen.queryByRole('progressbar')).not.toBeOnTheScreen()
    expect(screen.toJSON()).not.toBeNull()
  })
})
