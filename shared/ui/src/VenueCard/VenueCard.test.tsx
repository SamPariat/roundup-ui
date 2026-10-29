import { fireEvent, screen } from '@testing-library/react-native'

import { renderWithTheme } from '../test/render.tsx'
import { VenueCard } from './VenueCard.tsx'

describe('VenueCard', () => {
  it('shows the name as a heading', async () => {
    await renderWithTheme(<VenueCard name="Toit" />)

    expect(screen.getByRole('heading', { name: 'Toit' })).toBeOnTheScreen()
  })

  it('says in words whether it is open', async () => {
    await renderWithTheme(<VenueCard isOpen name="Toit" />)

    expect(screen.getByText('Open')).toBeOnTheScreen()
  })

  it('offers saving with a name that reflects the state', async () => {
    const onSave = jest.fn()
    await renderWithTheme(<VenueCard name="Toit" onSave={onSave} saved={false} />)

    await fireEvent.press(screen.getByRole('button', { name: 'Save to squad' }))

    expect(onSave).toHaveBeenCalledTimes(1)
  })

  it('names the button Saved when saved', async () => {
    await renderWithTheme(<VenueCard name="Toit" saved />)

    expect(screen.getByRole('button', { name: 'Saved to squad' })).toBeOnTheScreen()
  })

  it('has no save button unless asked for', async () => {
    await renderWithTheme(<VenueCard name="Toit" />)

    expect(screen.queryByRole('button')).not.toBeOnTheScreen()
  })
})
