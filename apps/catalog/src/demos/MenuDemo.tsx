import type { ReactElement } from 'react'

import { useMemo, useState } from 'react'
import { View } from 'react-native'

import type { IMenuItem } from '@roundup/ui'

import { Menu, Text } from '@roundup/ui'

import { Specimen } from '@/components/Specimen'

/**
 * Menu with its own ⋯ button over a stand-in screen, a destructive row last.
 * @returns The specimen.
 */
export const MenuDemo = (): ReactElement => {
  const [radius, setRadius] = useState<number>(3)
  const [picked, setPicked] = useState<string>('Nothing yet')

  const items = useMemo(
    (): IMenuItem[] => [
      {
        icon: 'edit',
        label: 'Rename squad',
        /** Shows that Rename squad was picked. */
        onPress: () => {
          setPicked('Rename squad')
        },
      },
      {
        destructive: true,
        icon: 'logout',
        label: 'Leave squad',
        /** Shows that Leave squad was picked. */
        onPress: () => {
          setPicked('Leave squad')
        },
      },
    ],
    [],
  )

  const steps = useMemo(
    (): IMenuItem[] =>
      [1, 3, 10].map((km) => ({
        label: `${km} km`,
        /** Picks this radius. */
        onPress: () => {
          setRadius(km)
        },
        selected: km === radius,
      })),
    [radius],
  )

  return (
    <>
      <Specimen note="Press ⋯, then a row or anywhere outside." title="destructive last">
        <View className="h-48 rounded-xl bg-bg-sunken p-4">
          <View className="flex-row items-center justify-between">
            <Text tone="muted">Picked: {picked}</Text>
            <Menu items={items} label="Squad options" />
          </View>
        </View>
      </Specimen>
      <Specimen
        note="A chip trigger picks one value; the current one has a check."
        title="chip, one choice"
      >
        <View className="h-56 rounded-xl bg-bg-sunken p-4">
          <Menu chip={`Within ${radius} km`} items={steps} label={`Search radius, ${radius} km`} />
        </View>
      </Specimen>
    </>
  )
}
