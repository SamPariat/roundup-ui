import type { ReactElement } from 'react'

import { View } from 'react-native'

import { Text } from '@roundup/ui'

import { Specimen } from '../components/Specimen.tsx'

/** One role colour and the class that paints it. */
interface Swatch {
  /** The Tailwind class that fills a box with the role. Spelled out so Tailwind can see it. */
  fill: string
  /** The role's name, as in the class names (bg-*, text-*, border-*). */
  role: string
}

/** A group of related roles. */
interface Family {
  /** What to look for. */
  note: string
  /** The roles of the group. */
  swatches: Swatch[]
  /** The group's name. */
  title: string
}

/**
 * Every role colour of shared/ui/theme.css, in the order the file lists them. Each swatch is a
 * class, so it follows the theme the toolbar picks: switch between Mocha and Latte to compare.
 * The useRoleColor hook is not used here: it only reads the five roles that props (not classes) need.
 */
const FAMILIES: Family[] = [
  {
    title: 'Surfaces',
    note: 'Page, raised cards and dialogs, bars and tracks, and the hover and pressed fill.',
    swatches: [
      { role: 'bg', fill: 'bg-bg' },
      { role: 'bg-raised', fill: 'bg-bg-raised' },
      { role: 'bg-sunken', fill: 'bg-bg-sunken' },
      { role: 'bg-hover', fill: 'bg-bg-hover' },
    ],
  },
  {
    title: 'Lines',
    note: 'Dividers, input outlines and the keyboard focus ring.',
    swatches: [
      { role: 'border', fill: 'bg-border' },
      { role: 'border-strong', fill: 'bg-border-strong' },
      { role: 'focus-ring', fill: 'bg-focus-ring' },
    ],
  },
  {
    title: 'Text',
    note: 'Body, secondary and tertiary text.',
    swatches: [
      { role: 'fg', fill: 'bg-fg' },
      { role: 'fg-muted', fill: 'bg-fg-muted' },
      { role: 'fg-subtle', fill: 'bg-fg-subtle' },
    ],
  },
  {
    title: 'Brand',
    note: 'The accent, the highlight, what is written on them, and their soft fills.',
    swatches: [
      { role: 'accent', fill: 'bg-accent' },
      { role: 'on-accent', fill: 'bg-on-accent' },
      { role: 'accent-soft', fill: 'bg-accent-soft' },
      { role: 'highlight', fill: 'bg-highlight' },
      { role: 'on-highlight', fill: 'bg-on-highlight' },
      { role: 'highlight-soft', fill: 'bg-highlight-soft' },
    ],
  },
  {
    title: 'Status',
    note: 'Each status has a solid colour and a soft fill.',
    swatches: [
      { role: 'success', fill: 'bg-success' },
      { role: 'success-soft', fill: 'bg-success-soft' },
      { role: 'warning', fill: 'bg-warning' },
      { role: 'warning-soft', fill: 'bg-warning-soft' },
      { role: 'danger', fill: 'bg-danger' },
      { role: 'danger-soft', fill: 'bg-danger-soft' },
      { role: 'info', fill: 'bg-info' },
      { role: 'info-soft', fill: 'bg-info-soft' },
    ],
  },
  {
    title: 'Avatar tints',
    note: 'The six fills behind initials.',
    swatches: [
      { role: 'avatar-1', fill: 'bg-avatar-1' },
      { role: 'avatar-2', fill: 'bg-avatar-2' },
      { role: 'avatar-3', fill: 'bg-avatar-3' },
      { role: 'avatar-4', fill: 'bg-avatar-4' },
      { role: 'avatar-5', fill: 'bg-avatar-5' },
      { role: 'avatar-6', fill: 'bg-avatar-6' },
    ],
  },
  {
    title: 'Logo and scrim',
    note: 'The three parts of the mark, and the dim behind a modal.',
    swatches: [
      { role: 'logo-stem', fill: 'bg-logo-stem' },
      { role: 'logo-bowl', fill: 'bg-logo-bowl' },
      { role: 'logo-leg', fill: 'bg-logo-leg' },
      { role: 'scrim', fill: 'bg-scrim' },
    ],
  },
]

/**
 * Every role colour as a swatch with its name, grouped by use.
 * @returns The specimens.
 */
export const ColoursDemo = (): ReactElement => (
  <>
    {FAMILIES.map(({ note, swatches, title }) => (
      <Specimen key={title} note={note} title={title}>
        <View className="flex-row flex-wrap gap-4">
          {swatches.map(({ fill, role }) => (
            <View className="w-28 gap-2" key={role}>
              <View className={`h-14 rounded-lg border border-border ${fill}`} />
              <Text variant="caption">{role}</Text>
            </View>
          ))}
        </View>
      </Specimen>
    ))}
  </>
)
