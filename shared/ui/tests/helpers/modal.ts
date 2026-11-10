import type { ReactElement } from 'react'
import type { ModalProps } from 'react-native'

import { createElement, useEffect, useRef } from 'react'

/**
 * The test stand-in for React Native's Modal. Like React Native's own Jest mock it draws its
 * children as a host "Modal" while visible and nothing while hidden, and like iOS it also calls
 * onDismiss once it has hidden, which code that opens one Modal after another waits for.
 * @param props - What the app passes, visible and onDismiss among them.
 * @returns The host Modal with the children, or nothing while hidden.
 */
const DismissingModal = (props: ModalProps): null | ReactElement => {
  const { onDismiss, visible = true } = props
  // Whether it was showing on the render before, so hiding can be told from never having shown.
  const shownRef = useRef<boolean>(visible)

  useEffect(() => {
    if (shownRef.current && !visible) onDismiss?.()

    shownRef.current = visible
  }, [onDismiss, visible])

  return visible ? createElement('Modal', props, props.children) : null
}

/** The stand-in as a module, the shape jest.mock returns for React Native's Modal. */
export const modalModule = { __esModule: true, default: DismissingModal }
