import type { ReactElement } from 'react'

import { Platform, View } from 'react-native'

import type { TIconName } from '../lib/icons'

import { cn } from '../lib/cn'
import { Button } from './Button'
import { Surface } from './Surface'

/** Props for FloatingActionButton. */
export interface IFloatingActionButtonProps {
  /** What the button does, e.g. "New squad". Its accessible name unless `label` is given. */
  children: string
  /** Leading icon, usually plus. */
  icon: TIconName
  /** Called when the button is pressed. */
  onPress?: (() => void) | undefined
  /** Overrides the accessible name taken from the text. */
  label?: string
}

/**
 * The web's glass: the accent at three quarters over a blur of the page. iOS draws Liquid Glass
 * through Surface instead, and Android a solid accent.
 */
const WEB_GLASS = Platform.select({
  default: '',
  web: 'bg-accent/75 backdrop-blur-xl backdrop-saturate-150',
})

/**
 * The one create action of a screen, floating in the bottom-right corner above its content: a large
 * Button with an icon and a label on accent-tinted glass, raised by a shadow. It positions itself against the
 * nearest parent, 16 points above its bottom edge, so the parent decides how wide the area is and
 * what it clears (the app's TabPage and TabList keep it inside the content column and above the
 * iOS tab bar). Taps around it reach the content beneath.
 * @returns The Button, pinned to its parent's corner.
 */
export const FloatingActionButton = ({
  children,
  icon,
  label,
  onPress,
}: IFloatingActionButtonProps): ReactElement => (
  <View className="absolute right-0 bottom-4" pointerEvents="box-none">
    <Surface
      className={cn('rounded-xl border border-glass-edge shadow-toast', WEB_GLASS)}
      tone="accent"
    >
      {/* The Surface is the fill, so the Button's own accent comes off. */}
      <Button
        className="bg-transparent"
        icon={icon}
        onPress={onPress}
        size="lg"
        {...(label === undefined ? {} : { label })}
      >
        {children}
      </Button>
    </Surface>
  </View>
)
