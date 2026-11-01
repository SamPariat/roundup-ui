import type { ReactElement } from 'react'

import { useState } from 'react'

import type { ThemeChoice } from '@roundup/ui'

import { Text, ThemeSwitch, useTheme } from '@roundup/ui'

import { Specimen } from '../components/Specimen.tsx'

/**
 * ThemeSwitch with each choice selected, and a live one that is the real theme of this catalog.
 * @returns The specimens.
 */
export const ThemeSwitchDemo = (): ReactElement => {
  const { name, preference, setPreference } = useTheme()
  const [local, setLocal] = useState<ThemeChoice>('system')

  return (
    <>
      <Specimen title="value=system (default)">
        <ThemeSwitch value="system" />
      </Specimen>
      <Specimen title="value=light">
        <ThemeSwitch value="light" />
      </Specimen>
      <Specimen title="value=dark">
        <ThemeSwitch value="dark" />
      </Specimen>
      <Specimen note="Changes nothing but its own selection." title="Interactive · local state">
        <ThemeSwitch onChange={setLocal} value={local} />
      </Specimen>
      <Specimen
        note="This one is the toolbar's switch: it changes the whole catalog."
        title="Interactive · the real theme"
      >
        <ThemeSwitch onChange={setPreference} value={preference} />
        <Text tone="muted" variant="caption">
          {`Preference ${preference}, showing ${name === 'mocha' ? 'Mocha' : 'Latte'}`}
        </Text>
      </Specimen>
    </>
  )
}
