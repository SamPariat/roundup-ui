import type { ReactNode } from 'react'

import { render } from '@testing-library/react-native'

import Ios from '../app/(tabs)/_layout.ios.tsx'
import Shared from '../app/(tabs)/_layout.tsx'
import { TAB_ITEMS, tabIdForPath } from './tabs.ts'

const mockTriggers: string[] = []

jest.mock('expo-router/native-tabs', () => {
  const Trigger = Object.assign(
    function NativeTrigger({ name }: { name: string }) {
      mockTriggers.push(`native:${name}`)
      return null
    },
    { Icon: () => null, Label: () => null },
  )
  return {
    NativeTabs: Object.assign(
      function NativeTabs({ children }: { children: ReactNode }) {
        return children
      },
      { Trigger },
    ),
  }
})

jest.mock('expo-router/ui', () => ({
  Tabs: function Tabs({ children }: { children: ReactNode }) {
    return children
  },
  TabList: function TabList({ children }: { children: ReactNode }) {
    return children
  },
  TabSlot: function TabSlot() {
    return null
  },
  TabTrigger: function TabTrigger({ name }: { name: string }) {
    mockTriggers.push(`headless:${name}`)
    return null
  },
}))

jest.mock('expo-router', () => ({ usePathname: () => '/explore' }))
jest.mock('../shell/AppShell.tsx', () => ({
  AppShell: function AppShell({ children }: { children: ReactNode }) {
    return children
  },
}))

const triggersWith = (prefix: string): string[] =>
  mockTriggers
    .filter((entry) => entry.startsWith(prefix))
    .map((entry) => entry.slice(prefix.length))

describe('tab layouts', () => {
  beforeEach(() => {
    mockTriggers.length = 0
  })

  it('give the iOS system tab bar and the web shell the same routes in the same order', async () => {
    await render(<Ios />)
    await render(<Shared />)

    expect(triggersWith('native:')).toEqual(TAB_ITEMS.map((item) => item.id))
    expect(triggersWith('headless:')).toEqual(triggersWith('native:'))
  })
})

describe('tabIdForPath', () => {
  it.each([
    ['/squads', 'squads'],
    ['/squads/42/members', 'squads'],
    ['/explore', 'explore'],
    ['/profile', 'profile'],
    ['/unknown', 'squads'],
  ] as const)('maps %s to %s', (path, id) => {
    expect(tabIdForPath(path)).toBe(id)
  })
})
