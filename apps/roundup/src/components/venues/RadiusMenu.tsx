import type { ReactElement } from 'react'

import { useMemo } from 'react'

import type { IMenuItem } from '@roundup/ui'

import { useT } from '@roundup/i18n'
import { Menu } from '@roundup/ui'

/** Props for RadiusMenu. */
export interface IRadiusMenuProps {
  /** The radii to pick from, in kilometers. */
  steps: readonly number[]
  /** The radius in use, in kilometers. */
  value: number
  /** Called with the radius the person picks. */
  onChange: (km: number) => void
}

/**
 * The search radius of Explore: a chip saying "Within 3 km" that opens the steps, with a check on
 * the current one. Its accessible name is "Search radius, 3 km".
 * @returns The chip and its menu.
 */
export const RadiusMenu = ({ onChange, steps, value }: IRadiusMenuProps): ReactElement => {
  const { t } = useT()

  const items = useMemo(
    (): IMenuItem[] =>
      steps.map((km) => ({
        label: t('screens.explore.radius.option', { count: km }),
        /** Picks this radius. */
        onPress: (): void => {
          onChange(km)
        },
        selected: km === value,
      })),
    [onChange, steps, t, value],
  )

  return (
    <Menu
      chip={t('screens.explore.radius.chip', { count: value })}
      items={items}
      label={t('screens.explore.radius.label', { count: value })}
    />
  )
}
