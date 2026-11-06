import type { ReactElement, ReactNode } from 'react'

import { ScrollView } from 'react-native'

/** Props for StackPage. */
export interface IStackPageProps {
  /** The page content. */
  children: ReactNode
}

/**
 * The body of a screen pushed onto a tab's stack, such as Edit profile. It scrolls, and on iOS
 * the system insets it below the glass header, which floats over the content, so nothing starts
 * underneath the back button. Elsewhere AppShell draws the bar above the page and the inset is
 * zero.
 * @returns The scrolling page.
 */
export const StackPage = ({ children }: IStackPageProps): ReactElement => (
  <ScrollView
    contentContainerClassName="py-6"
    contentInsetAdjustmentBehavior="automatic"
    keyboardShouldPersistTaps="handled"
  >
    {children}
  </ScrollView>
)
