import { act, fireEvent, screen } from '@testing-library/react-native'
import { AccessibilityInfo, Linking } from 'react-native'

import { Photo } from '../../src/components/Photo'
import { Render } from '../helpers/render'

// expo-image draws through a native view, so a plain view that keeps its props stands in for it.
jest.mock(
  'expo-image',
  () =>
    jest.requireActual<{
      /** The stand-in's module. */
      expoImageModule: object
    }>('../helpers/expo-image').expoImageModule,
)

describe('Photo', () => {
  it('draws the picture from its URL, cached, cropped to fill and faded in', async () => {
    await Render.withTheme(
      <Photo className="size-12" recyclingKey="a" src="https://example.test/a.jpg" />,
    )

    const image = screen.getByLabelText('Photo')

    expect(image).toHaveProp('source', { uri: 'https://example.test/a.jpg' })
    expect(image).toHaveProp('cachePolicy', 'memory-disk')
    expect(image).toHaveProp('contentFit', 'cover')
    expect(image).toHaveProp('recyclingKey', 'a')
    expect(image).toHaveProp('transition', 150)
  })

  it('skips the fade when the system asks for less motion', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true)

    await Render.withTheme(<Photo className="size-12" src="https://example.test/a.jpg" />)

    await act(async () => {
      await Promise.resolve()
    })

    expect(screen.getByLabelText('Photo')).toHaveProp('transition', 0)
  })

  it('credits the author over the photo, linking their profile', async () => {
    const open = jest.spyOn(Linking, 'openURL').mockResolvedValue()

    await Render.withTheme(
      <Photo
        className="size-40"
        credit={{ name: 'Asha Rao', url: 'https://maps.example/asha' }}
        src="https://example.test/a.jpg"
      />,
    )

    await fireEvent.press(screen.getByRole('link', { name: 'Photo: Asha Rao' }))

    expect(open).toHaveBeenCalledWith('https://maps.example/asha')

    expect(screen.getByLabelText('Photo')).toHaveProp('source', {
      uri: 'https://example.test/a.jpg',
    })
  })

  it('credits the author as plain text when there is no profile to open', async () => {
    await Render.withTheme(
      <Photo className="size-40" credit={{ name: 'Kabir' }} src="https://example.test/a.jpg" />,
    )

    expect(screen.getByText('Photo: Kabir')).toBeOnTheScreen()
    expect(screen.queryByRole('link')).not.toBeOnTheScreen()
  })

  it('draws no credit when none is given', async () => {
    await Render.withTheme(<Photo className="size-40" src="https://example.test/a.jpg" />)

    expect(screen.queryByText(/^Photo:/)).not.toBeOnTheScreen()
  })
})
