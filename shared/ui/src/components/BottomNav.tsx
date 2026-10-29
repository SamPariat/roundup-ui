import type { ReactElement } from 'react'

import { View } from 'react-native'

import type { NavItemData } from '../lib/nav-items.ts'

import { cn } from '../lib/cn.ts'
import { DEFAULT_NAV_ITEMS } from '../lib/nav-items.ts'
import { Icon } from './Icon.tsx'
import { NavTab } from './NavTab.tsx'
import { SafeArea } from './SafeArea.tsx'
import { Text } from './Text.tsx'

export interface BottomNavProps {
  items?: readonly NavItemData[]
  /** Defaults to 'squads'. */
  value?: string
  onChange?: (id: string) => void
}

// Height is size-nav (72) plus the gesture inset, which SafeArea reads from the bottom edge only.
export const BottomNav = ({
  items = DEFAULT_NAV_ITEMS,
  onChange,
  value = 'squads',
}: BottomNavProps): ReactElement => (
  <SafeArea className="border-t border-border bg-bg-sunken" edges={['bottom', 'left', 'right']}>
    <View accessibilityLabel="Main" className="h-nav flex-row" role="tablist">
      {items.map((item) => {
        const active = item.id === value

        return (
          <NavTab
            active={active}
            className="min-h-tap flex-1 items-center justify-center gap-1 focus:outline-2 focus:outline-offset-[-2px] focus:outline-focus-ring"
            item={item}
            key={item.id}
            onChange={onChange}
          >
            <View
              className={cn(
                'h-[32px] w-[56px] items-center justify-center rounded-full',
                active && 'bg-accent-soft',
              )}
            >
              <Icon decorative name={item.icon} size={22} tone={active ? 'accent' : 'fg-muted'} />
            </View>
            {/* Capped at 1.3x so three labels still fit a 360-wide phone at large system font sizes. */}
            <Text maxFontSizeMultiplier={1.3} tone={active ? 'fg' : 'muted'} variant="caption">
              {item.label}
            </Text>
          </NavTab>
        )
      })}
    </View>
  </SafeArea>
)
