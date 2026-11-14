import { useCallback, useMemo } from 'react'
import { Linking, Platform } from 'react-native'

import { useT } from '@roundup/i18n'

/** What a screen offers when the person has refused location: a button's words and its press. */
export interface IDeniedAction {
  /** The button's words: open Settings on a phone, try again in a browser. */
  label: string
  /** Opens the system Settings on a phone; asks the browser again on the web. */
  onPress: () => void
}

/**
 * The way back from a refused location, shared by Explore and the Suggest a place sheet. A phone
 * only lets the person allow it again in Settings; a browser can be asked again.
 * @param retry - Asks for the position again, from the location's view model.
 * @returns The button's words and its press.
 */
export const useDeniedAction = (retry: () => void): IDeniedAction => {
  const { t } = useT()

  const handleOpenSettings = useCallback((): void => {
    void Linking.openSettings()
  }, [])

  return useMemo(
    (): IDeniedAction =>
      Platform.select({
        default: { label: t('screens.explore.denied.openSettings'), onPress: handleOpenSettings },
        web: { label: t('screens.explore.denied.tryAgain'), onPress: retry },
      }),
    [handleOpenSettings, retry, t],
  )
}
