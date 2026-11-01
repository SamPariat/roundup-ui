import type { ReactElement } from 'react'

import { useState } from 'react'

import { SideNav } from '@roundup/ui'

import { Preview } from '../components/Preview.tsx'
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
        <Preview className="h-96 flex-row">
          <SideNav />
        </Preview>
      </Specimen>
      <Specimen note="Press a tab." title="user · Interactive">
        <Preview className="h-96 flex-row">
          <SideNav onChange={setValue} user={NAV_USER} value={value} />
        </Preview>
      </Specimen>
    </>
  )
}
