import type { ReactElement } from 'react'

import { View } from 'react-native'

import { useT } from '@roundup/i18n'
import { List, ListRow, Text, ThemeSwitch, useTheme } from '@roundup/ui'

import { TabPage } from '../../../components/TabPage'

/**
 * Preferences: the theme and the language. English is the only language, so its row is plain
 * content, not a button, which would lead nowhere.
 * @returns The appearance and language sections.
 */
export default function PreferencesScreen(): ReactElement {
  const { preference, setPreference } = useTheme()
  const { t } = useT()

  return (
    <TabPage>
      <View className="max-w-160 gap-8">
        <View className="gap-3">
          <Text heading={2} variant="heading">
            {t('screens.preferences.appearance')}
          </Text>
          <ThemeSwitch onChange={setPreference} value={preference} />
          <Text tone="muted" variant="caption">
            {t('screens.preferences.appearanceCaption')}
          </Text>
        </View>
        <View className="gap-3">
          <Text heading={2} variant="heading">
            {t('screens.preferences.language')}
          </Text>
          <List>
            <ListRow
              title={t('screens.preferences.language')}
              trailing={
                <Text tone="muted" variant="body">
                  {t('screens.preferences.languageName')}
                </Text>
              }
            />
          </List>
          <Text tone="muted" variant="caption">
            {t('screens.preferences.languageCaption')}
          </Text>
        </View>
      </View>
    </TabPage>
  )
}
