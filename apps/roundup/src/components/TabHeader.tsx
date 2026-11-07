import type { NativeStackHeaderProps } from 'expo-router'
import type { ReactElement, ReactNode } from 'react'

import { View } from 'react-native'

import { useT } from '@roundup/i18n'
import { cn, PageHeader, TopAppBar } from '@roundup/ui'

import { useBack } from '@/hooks/useBack'
import { useLayout } from '@/hooks/useLayout'
import { useCurrentTab, useTabItem } from '@/hooks/useTabItems'

/** The route name of a tab's own screen, as its file under the tab spells it. */
const TAB_ROOT = 'index'

/**
 * The bar above a screen on web and Android, drawn by the tab's stack from the screen's own
 * options, so a title is written once, in the stack layout (or by the screen, as the squad page
 * does with the squad's name). Phones get a TopAppBar with the logo on a tab's own screen and a
 * back button on a pushed one; desktop gets a PageHeader with a back link. The screen's
 * headerRight goes in the bar's actions. iOS uses the system header instead (see TabStack).
 * @returns The bar for the current screen.
 */
export const TabHeader = ({ options, route }: NativeStackHeaderProps): ReactElement => {
  const { t } = useT()
  const { gutterClass, nav } = useLayout()
  const tab = useTabItem(useCurrentTab())
  const goBack = useBack(tab.href)
  const pushed = route.name !== TAB_ROOT
  const title = options.title ?? ''
  const actions: ReactNode = options.headerRight?.({ canGoBack: pushed })

  if (nav === 'side') {
    // The row is filled with the page color, so the stack's own header background never shows.
    return (
      <View className="w-full bg-bg">
        <View className={cn('mx-auto w-full max-w-content pt-8 pb-6', gutterClass)}>
          <PageHeader
            actions={actions}
            title={title}
            {...(pushed ? { back: t('common.back'), onBack: goBack } : {})}
          />
        </View>
      </View>
    )
  }

  return (
    <TopAppBar
      actions={actions}
      title={title}
      {...(pushed ? { back: true, onBack: goBack } : { logo: true })}
    />
  )
}
