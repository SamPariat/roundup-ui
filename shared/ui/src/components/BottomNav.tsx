import type { ReactElement } from 'react'

import { View } from 'react-native'

import { useT } from '@roundup/i18n'

import type { INavItemData } from '../lib/nav-items'

import { ClassHelper } from '../lib/class-helper'
import { useDefaultNavItems } from '../lib/nav-items'
import { Icon } from './Icon'
import { NavTab } from './NavTab'
import { SafeArea } from './SafeArea'
import { Text } from './Text'

/** Props for BottomNav. */
export interface IBottomNavProps {
  /** The destinations to show. Defaults to Squads, Explore and Profile. */
  items?: readonly INavItemData[]
  /** Defaults to 'squads'. */
  value?: string
  /** Called with the id of the tab that was pressed. */
  onChange?: (id: string) => void
}

/**
 * The tab bar shown below the tablet breakpoint: one tab per destination, a pill behind the active icon, and the bottom safe area underneath.
 * Height is size-nav (72) plus the gesture inset, which SafeArea reads from the bottom edge only.
 * @returns The tab bar, a navigation tablist.
 */
export const BottomNav = ({ items, onChange, value = 'squads' }: IBottomNavProps): ReactElement => {
  const { t } = useT()
  const defaults = useDefaultNavItems()
  const shown = items ?? defaults

  return (
    <SafeArea className="border-t border-border bg-bg-sunken" edges={['bottom', 'left', 'right']}>
      <View accessibilityLabel={t('nav.main')} className="h-18 flex-row" role="tablist">
        {shown.map((item) => {
          const active = item.id === value

          return (
            <NavTab
              active={active}
              className="min-h-12 flex-1 items-center justify-center gap-1 focus:outline-2 focus:-outline-offset-2 focus:outline-focus-ring"
              item={item}
              key={item.id}
              onChange={onChange}
            >
              <View
                className={ClassHelper.cn(
                  'h-8 w-14 items-center justify-center rounded-full',
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
}
