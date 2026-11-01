import type { ReactElement } from 'react'

import { useState } from 'react'
import { View } from 'react-native'

import { SideNav } from '@roundup/ui'

import { Specimen } from '../components/Specimen.tsx'
import { NAV_USER } from '../fixtures.ts'

/**
 * SideNav without and with the signed-in person pinned to its bottom. The rail is 248 wide and as
 * tall as its parent, so each specimen gives it a fixed height.
 * @returns The specimens.
 */
export const SideNavDemo = (): ReactElement => {
  const [value, setValue] = useState('squads')

  return (
    <>
      <Specimen title="value=squads (default)">
        <View className="h-96 flex-row overflow-hidden rounded-lg">
          <SideNav />
        </View>
      </Specimen>
      <Specimen note="Press a tab." title="user · Interactive">
        <View className="h-96 flex-row overflow-hidden rounded-lg">
          <SideNav onChange={setValue} user={NAV_USER} value={value} />
        </View>
      </Specimen>
    </>
  )
}
