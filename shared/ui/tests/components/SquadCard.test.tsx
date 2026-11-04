import { fireEvent, screen } from '@testing-library/react-native'

import { SquadCard } from '../../src/components/SquadCard'
import { RenderHelper } from '../helpers/render'

describe('SquadCard', () => {
  it('is a button that names the squad and its size', async () => {
    await RenderHelper.withTheme(<SquadCard memberCount={12} name="Friday crew" />)

    expect(screen.getByRole('button', { name: 'Friday crew, 12 members' })).toBeOnTheScreen()
  })

  it('says Admin when the person runs the squad', async () => {
    await RenderHelper.withTheme(<SquadCard memberCount={1} name="Quiet table" role="ADMIN" />)

    expect(screen.getByRole('button', { name: 'Quiet table, 1 member, Admin' })).toBeOnTheScreen()
  })

  it('calls onPress', async () => {
    const onPress = jest.fn()

    await RenderHelper.withTheme(<SquadCard memberCount={5} name="Friday crew" onPress={onPress} />)

    await fireEvent.press(screen.getByRole('button'))

    expect(onPress).toHaveBeenCalledTimes(1)
  })
})
