import { screen } from '@testing-library/react-native'

import { ListRow } from '../ListRow/ListRow.tsx'
import { renderWithTheme } from '../test/render.tsx'
import { List } from './List.tsx'

describe('List', () => {
  it('shows every row it is given', async () => {
    await renderWithTheme(
      <List>
        <ListRow title="Meera" />
        <ListRow title="Arjun" />
      </List>,
    )

    expect(screen.getByText('Meera')).toBeOnTheScreen()
    expect(screen.getByText('Arjun')).toBeOnTheScreen()
  })
})
