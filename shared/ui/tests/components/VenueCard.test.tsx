import { fireEvent, screen } from '@testing-library/react-native'

import { VenueCard } from '../../src/components/VenueCard'
import { Render } from '../helpers/render'

describe('VenueCard', () => {
  it('shows the name as a heading', async () => {
    await Render.withTheme(<VenueCard name="Toit" />)

    expect(screen.getByRole('heading', { name: 'Toit' })).toBeOnTheScreen()
  })

  it('says in words whether it is open', async () => {
    await Render.withTheme(<VenueCard isOpen name="Toit" />)

    expect(screen.getByText('Open')).toBeOnTheScreen()
  })

  it('offers saving with a name that reflects the state', async () => {
    const onSave = jest.fn()

    await Render.withTheme(<VenueCard name="Toit" onSave={onSave} saved={false} />)

    await fireEvent.press(screen.getByRole('button', { name: 'Save to squad' }))

    expect(onSave).toHaveBeenCalledTimes(1)
  })

  it('names the button Saved when saved', async () => {
    await Render.withTheme(<VenueCard name="Toit" saved />)

    expect(screen.getByRole('button', { name: 'Saved to squad' })).toBeOnTheScreen()
  })

  it('has no save button unless asked for', async () => {
    await Render.withTheme(<VenueCard name="Toit" />)

    expect(screen.queryByRole('button')).not.toBeOnTheScreen()
  })
})
