import { fireEvent, screen } from '@testing-library/react-native'

import { PhotoStrip } from '../../src/components/PhotoStrip'
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

/** Three credited photos. */
const THREE = [
  { credit: { name: 'Asha' }, src: 'https://example.test/1.jpg' },
  { credit: { name: 'Kabir' }, src: 'https://example.test/2.jpg' },
  { credit: { name: 'Meera' }, src: 'https://example.test/3.jpg' },
]

describe('PhotoStrip', () => {
  it('draws every photo with its credit and counts the first of them', async () => {
    await Render.withTheme(<PhotoStrip className="h-46" photos={THREE} />)

    expect(screen.getAllByLabelText('Photo')).toHaveLength(3)
    expect(screen.getByText('Photo: Asha')).toBeOnTheScreen()
    expect(screen.getByText('Photo: Meera')).toBeOnTheScreen()
    expect(screen.getByLabelText('Photo 1 of 3')).toHaveTextContent('1 / 3')
  })

  it('counts the page swiped to', async () => {
    await Render.withTheme(<PhotoStrip className="h-46" photos={THREE} />)

    const strip = screen.getByLabelText('Photos')

    await fireEvent(strip, 'layout', {
      nativeEvent: { layout: { height: 184, width: 300, x: 0, y: 0 } },
    })

    await fireEvent.scroll(strip, { nativeEvent: { contentOffset: { x: 600, y: 0 } } })

    expect(screen.getByLabelText('Photo 3 of 3')).toHaveTextContent('3 / 3')
  })

  it('has no counter with one photo', async () => {
    await Render.withTheme(<PhotoStrip className="h-46" photos={THREE.slice(0, 1)} />)

    expect(screen.getByLabelText('Photo')).toBeOnTheScreen()
    expect(screen.queryByText(/ \/ /)).not.toBeOnTheScreen()
  })

  it('draws nothing without photos', async () => {
    await Render.withTheme(<PhotoStrip className="h-46" photos={[]} />)

    expect(screen.queryByLabelText('Photo')).not.toBeOnTheScreen()
  })
})
