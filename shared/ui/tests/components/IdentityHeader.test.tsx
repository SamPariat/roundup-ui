import { screen } from '@testing-library/react-native'

import { IdentityHeader } from '../../src/components/IdentityHeader'
import { Render } from '../helpers/render'

describe('IdentityHeader', () => {
  it('titles the screen with the name', async () => {
    await Render.withTheme(<IdentityHeader subtitle="12 members" title="Friday crew" />)

    expect(screen.getByRole('heading', { name: 'Friday crew' })).toBeOnTheScreen()
    expect(screen.getByText('12 members')).toBeOnTheScreen()
  })

  it('names the avatar after whose it is', async () => {
    await Render.withTheme(
      <IdentityHeader avatar={{ id: 's1', name: 'Friday crew' }} title="Friday crew" />,
    )

    expect(screen.getByRole('image', { name: 'Friday crew' })).toBeOnTheScreen()
  })
})
