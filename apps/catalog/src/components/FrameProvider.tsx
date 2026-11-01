import type { ReactElement, ReactNode } from 'react'

import { useMemo, useState } from 'react'

import type { FrameWidth } from '../hooks/useFrame.ts'

import { FrameContext } from '../hooks/useFrame.ts'

/** Props for FrameProvider. */
export interface FrameProviderProps {
  /** The app to give the preview width to. */
  children: ReactNode
}

/**
 * Owns the preview width, so the toolbar can set it and every Frame can follow it. It is kept
 * above the router, which means the choice survives moving from one component to the next.
 * @returns The provider wrapping its children.
 */
export const FrameProvider = ({ children }: FrameProviderProps): ReactElement => {
  const [width, setWidth] = useState<FrameWidth>('full')

  const value = useMemo(() => ({ setWidth, width }), [width])

  return <FrameContext value={value}>{children}</FrameContext>
}
