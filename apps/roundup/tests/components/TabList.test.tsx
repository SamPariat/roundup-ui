import type { ReactElement } from 'react'
import type { TestInstance } from 'test-renderer'

import { Stack } from 'expo-router'
import { fireEvent, screen } from 'expo-router/testing-library'
import { useCallback, useEffect, useState } from 'react'
import { Pressable, Text } from 'react-native'

import type { IUseSquadFavorites } from '@roundup/core'

import type { TSquadTab } from '@/navigation/squad-tab'

import { Render } from '../helpers/render'
import { SquadsFixtures } from '../helpers/squads'
import { PhoneSquad } from '@/components/squads/SquadFavorites'
import { TabList } from '@/components/TabList'

/** A tablet's window: wide enough for two columns of cards, narrow enough for the phone layout. */
const mockWindow = { fontScale: 1, height: 1000, scale: 1, width: 800 }

/**
 * Stand-in for useWindowDimensions that returns the tablet width. A function declaration so the
 * jest.mock factory can reach it before this file's constants are initialized.
 * @returns The mocked window.
 */
function mockUseWindowDimensions(): typeof mockWindow {
  return mockWindow
}

jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: mockUseWindowDimensions,
}))

/** How many times a probe has mounted, by name. */
const mounts = new Map<string, number>()

/** Props for Probe. */
interface IProbeProps {
  /** Which counter it adds to. */
  name: string
}

/**
 * Counts its own mounts, so a test can tell a remount from a re-render.
 * @returns A line of text.
 */
const Probe = ({ name }: IProbeProps): ReactElement => {
  useEffect(() => {
    mounts.set(name, (mounts.get(name) ?? 0) + 1)
  }, [name])

  return <Text>{name}</Text>
}

/** What the phone squad reads of the favorites: none, loaded. */
const STATE: IUseSquadFavorites = {
  complete: true,
  error: undefined,
  favorites: [],
  hasMore: false,
  loading: false,
  loadMore: jest.fn(),
  loadingMore: false,
  refresh: jest.fn(() => Promise.resolve()),
  remove: jest.fn(() => Promise.resolve(true)),
  removingId: undefined,
  requestId: undefined,
}

/** The items of the plain list. */
const ITEMS: readonly string[] = ['a', 'b', 'c']

/**
 * Draws one item as a probe.
 * @param item - The letter of the item, which names its probe.
 * @returns The probe.
 */
const renderItem = (item: string): ReactElement => <Probe name={`item-${item}`} />

/**
 * The key of an item.
 * @param item - The letter of the item.
 * @returns The letter, which is unique.
 */
const keyOf = (item: string): string => item

/**
 * The stack the lists sit in, which gives them the header they measure.
 * @returns The stack, with its default header.
 */
const ListStack = (): ReactElement => <Stack />

/**
 * A plain list of three probes.
 * @returns The list, in its default column count.
 */
const PlainList = (): ReactElement => (
  <TabList data={ITEMS} empty={null} keyExtractor={keyOf} renderItem={renderItem} />
)

/**
 * A squad body with a probe in its header and a button that switches its tab.
 * @returns The phone squad and the button.
 */
const SquadBody = (): ReactElement => {
  const [tab, setTab] = useState<TSquadTab>('members')

  const handleSwitch = useCallback((): void => {
    setTab((current) => (current === 'members' ? 'favorites' : 'members'))
  }, [])

  return (
    <>
      <Pressable accessibilityRole="button" onPress={handleSwitch}>
        <Text>Switch</Text>
      </Pressable>
      <PhoneSquad
        events={<Text>Events block</Text>}
        header={<Probe name="header" />}
        members={<Text>Members block</Text>}
        refreshEvents={jest.fn()}
        state={STATE}
        tab={tab}
      />
    </>
  )
}

/** The props of a view that may measure the list. */
interface IMeasuring {
  /** Its class names. */
  className?: string
  /** What it does on layout. */
  onLayout?: unknown
}

/**
 * Finds the view that measures the list: the one around the FlatList that listens for layout and
 * pulls the cells' padding back out of the gutter, whose class names it.
 * @param item - Any item of the list, to start the search from.
 * @returns The measuring view.
 */
const listOf = (item: TestInstance): TestInstance => {
  for (let node = item.parent; node !== null; node = node.parent) {
    const { className, onLayout } = node.props as IMeasuring

    if (typeof onLayout === 'function' && className?.includes('-mx-1.5') === true) return node
  }

  throw new Error('The list has no measuring view.')
}

describe('TabList', () => {
  beforeEach(() => {
    mounts.clear()
  })

  it('keeps its items mounted through the first layout, which measures the width it assumed', async () => {
    await Render.app(
      { '(list)/_layout': ListStack, '(list)/index': PlainList },
      { backend: SquadsFixtures.backend([]), saved: 'r1', url: '/' },
    )

    await screen.findByText('item-a')

    // Two columns from the window's width, before and after the list reports its own.
    await fireEvent(listOf(screen.getByText('item-a')), 'layout', {
      nativeEvent: { layout: { height: 900, width: 800, x: 0, y: 0 } },
    })

    expect(mounts.get('item-a')).toBe(1)
    expect(mounts.get('item-b')).toBe(1)
  })

  it('still follows the width it measures, so a narrower list changes its columns', async () => {
    await Render.app(
      { '(list)/_layout': ListStack, '(list)/index': PlainList },
      { backend: SquadsFixtures.backend([]), saved: 'r1', url: '/' },
    )

    await screen.findByText('item-a')

    await fireEvent(listOf(screen.getByText('item-a')), 'layout', {
      nativeEvent: { layout: { height: 900, width: 400, x: 0, y: 0 } },
    })

    // One column now, and React Native needs a new list for a new column count.
    expect(mounts.get('item-a')).toBe(2)
  })

  it('keeps the squad header mounted when the tab switches, on a tablet', async () => {
    await Render.app(
      { '(list)/_layout': ListStack, '(list)/index': SquadBody },
      { backend: SquadsFixtures.backend([]), saved: 'r1', url: '/' },
    )

    await screen.findByText('Members block')

    // The list has been measured: two columns of cards fit, but a squad's tabs are rows.
    await fireEvent(listOf(screen.getByText('Members block')), 'layout', {
      nativeEvent: { layout: { height: 900, width: 800, x: 0, y: 0 } },
    })

    await fireEvent.press(screen.getByRole('button', { name: 'Switch' }))
    await screen.findByText('Nothing saved yet')
    await fireEvent.press(screen.getByRole('button', { name: 'Switch' }))
    await screen.findByText('Members block')

    expect(mounts.get('header')).toBe(1)
  })
})
