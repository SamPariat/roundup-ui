import { createContext, use } from 'react'

/** The preview widths the toolbar offers. `full` fills the window. */
export type FrameWidth = '360' | '768' | '1024' | 'full'

/** One choice in the toolbar's width picker. */
export interface FrameOption {
  /** Tailwind class that caps the preview's width; empty for the full width. */
  className: string
  /** Stable ID, also the value held in state. */
  id: FrameWidth
  /** The chip text. */
  label: string
}

/** The widths a component can be previewed at: a phone, a tablet, a small desktop and the window. */
export const FRAME_OPTIONS = [
  { id: '360', label: '360', className: 'max-w-90' },
  { id: '768', label: '768', className: 'max-w-3xl' },
  { id: '1024', label: '1024', className: 'max-w-5xl' },
  { id: 'full', label: 'Full', className: '' },
] as const satisfies readonly FrameOption[]

/** What useFrame returns. */
export interface FrameState {
  /** Chooses another preview width. */
  setWidth: (width: FrameWidth) => void
  /** The chosen preview width. */
  width: FrameWidth
}

/** Holds the chosen preview width for the toolbar that sets it and the frame that obeys it. */
export const FrameContext = createContext<FrameState | null>(null)

/**
 * Reads the preview width and its setter. Throws outside a FrameProvider so a missing provider fails loudly.
 * @returns The chosen width and its setter.
 */
export const useFrame = (): FrameState => {
  const frame = use(FrameContext)

  if (frame === null) throw new Error('useFrame must be used inside <FrameProvider>')

  return frame
}
