import type { ReactElement, ReactNode } from 'react'

import { Platform, View } from 'react-native'

import { cn } from '@roundup/ui'

import { FRAME_OPTIONS, useFrame } from '../hooks/useFrame.ts'

/** Props for Frame. */
export interface FrameProps {
  /** The preview to constrain. */
  children: ReactNode
}

/**
 * Holds a preview to the width the toolbar chose (360, 768, 1024 or the whole window), centred and
 * outlined so its edge is visible. Native windows are the device's own size, so there it does nothing.
 * Width is the only thing it changes: components that read the window size (useBreakpoint) still
 * see the real window.
 * @returns The constrained preview.
 */
export const Frame = ({ children }: FrameProps): ReactElement => {
  const { width } = useFrame()
  const option = FRAME_OPTIONS.find(({ id }) => id === width)
  const capped = Platform.OS === 'web' && option !== undefined && option.id !== 'full'

  return (
    <View
      className={cn(
        'w-full self-center',
        capped && ['border border-dashed border-border-strong', option.className],
      )}
    >
      {children}
    </View>
  )
}
