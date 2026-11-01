import type { ReactNode } from 'react'

import { render } from '@testing-library/react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import Ios from '../../../src/app/(tabs)/_layout.ios.tsx'
import Shared from '../../../src/app/(tabs)/_layout.tsx'

const mockTriggers: string[] = []

/** Props of the stand-ins for navigator containers. */
interface ChildrenProps {
  /** What the container wraps. */
  children: ReactNode
}

/** Props of the stand-ins for tab triggers. */
interface NameProps {
  /** The route the trigger is for. */
  name: string
}

/**
 * Stand-in for a navigator container: renders what it wraps. A function declaration so jest.mock
 * factories can use it before this file's constants are initialised.
 * @returns The children, unchanged.
 */
function mockContainer({ children }: ChildrenProps): ReactNode {
  return children
}

/**
 * Stand-in for a leaf component that draws nothing.
 * @returns Nothing.
 */
function mockEmpty(): null {
  return null
}

/**
 * Records a system tab bar trigger so the test can compare routes and order.
 * @returns Nothing.
 */
function mockNativeTrigger({ name }: NameProps): null {
  mockTriggers.push(`native:${name}`)

  return null
}

/**
 * Records a headless tab trigger so the test can compare routes and order.
 * @returns Nothing.
 */
function mockHeadlessTrigger({ name }: NameProps): null {
  mockTriggers.push(`headless:${name}`)

  return null
}

/**
 * Stand-in for usePathname.
 * @returns A path under the Explore tab.
 */
function mockPathname(): string {
  return '/explore'
}

jest.mock('expo-router/native-tabs', () => ({
  NativeTabs: Object.assign(mockContainer, {
    Trigger: Object.assign(mockNativeTrigger, { Icon: mockEmpty, Label: mockEmpty }),
  }),
}))

jest.mock('expo-router/ui', () => ({
  Tabs: mockContainer,
  TabList: mockContainer,
  TabSlot: mockEmpty,
  TabTrigger: mockHeadlessTrigger,
}))

jest.mock('expo-router', () => ({ usePathname: mockPathname }))

jest.mock('../../../src/components/AppShell.tsx', () => ({ AppShell: mockContainer }))

/**
 * Lists the trigger routes recorded under a prefix, in render order.
 * @param prefix - Which tab bar recorded them, such as "native:".
 * @returns The route names without the prefix.
 */
const triggersWith = (prefix: string): string[] =>
  mockTriggers
    .filter((entry) => entry.startsWith(prefix))
    .map((entry) => entry.slice(prefix.length))

/** Insets and frame of a notched phone, so the safe-area hooks have values. */
const METRICS = {
  frame: { height: 844, width: 390, x: 0, y: 0 },
  insets: { bottom: 34, left: 0, right: 0, top: 47 },
}

describe('tab layouts', () => {
  beforeEach(() => {
    mockTriggers.length = 0
  })

  it('give the iOS system tab bar and the web shell the same routes in the same order', async () => {
    // The iOS layout reads the status bar inset to pad each screen.
    await render(
      <SafeAreaProvider initialMetrics={METRICS}>
        <Ios />
      </SafeAreaProvider>,
    )

    await render(<Shared />)

    expect(triggersWith('native:')).toEqual(['squads', 'explore', 'profile'])
    expect(triggersWith('headless:')).toEqual(triggersWith('native:'))
  })
})
