import { screen } from '@testing-library/react-native'

import { List } from '../../src/components/List.tsx'
import { ListRow } from '../../src/components/ListRow.tsx'
import { renderWithTheme } from '../helpers/render.tsx'

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
