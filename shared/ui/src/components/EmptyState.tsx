import type { ReactElement, ReactNode } from 'react'

import { View } from 'react-native'
import Svg, { Circle, Path, Rect } from 'react-native-svg'

import type { Theme } from '../theme/theme.tsx'

import { useTheme } from '../theme/theme.tsx'
import { Text } from './Text.tsx'

/** Props for EmptyState. */
export interface EmptyStateProps {
  /** Headline saying what is missing. */
  title: string
  /** One sentence on what will appear here or what to do. */
  body?: string
  /** Which illustration to draw. Defaults to squads. */
  art?: 'favorites' | 'search' | 'squads'
  /** A button or link below the copy. */
  action?: ReactNode
}

/** Props shared by the three illustrations. */
interface ArtProps {
  /** Role colours of the active theme, which the shapes are filled with. */
  roles: Theme['roles']
}

/** Props for the illustration frame. */
interface EmptyArtProps {
  /** Which illustration to draw. */
  kind: NonNullable<EmptyStateProps['art']>
}

/**
 * Magnifying-glass illustration. All three illustrations are shapes only: discs and pills from the
 * radius scale, in role colours.
 * @returns The SVG shapes.
 */
const SearchArt = ({ roles }: ArtProps): ReactElement => (
  <>
    <Circle
      cx={44}
      cy={44}
      fill={roles['bg-raised']}
      r={20}
      stroke={roles['border-strong']}
      strokeWidth={2}
    />
    <Rect
      fill={roles.accent}
      height={10}
      rx={5}
      transform="rotate(45 71 67)"
      width={26}
      x={58}
      y={62}
    />
  </>
)

/**
 * Bookmark illustration.
 * @returns The SVG shapes.
 */
const FavoritesArt = ({ roles }: ArtProps): ReactElement => (
  <>
    <Path d="M32 22h32v54l-16-11-16 11z" fill={roles.accent} />
    <Circle cx={70} cy={26} fill={roles.highlight} r={8} />
  </>
)

/**
 * People-and-pill illustration.
 * @returns The SVG shapes.
 */
const SquadsArt = ({ roles }: ArtProps): ReactElement => (
  <>
    <Circle cx={36} cy={42} fill={roles.accent} r={14} />
    <Circle cx={62} cy={46} fill={roles.highlight} r={11} />
    <Rect
      fill={roles['bg-raised']}
      height={16}
      rx={8}
      stroke={roles['border-strong']}
      strokeWidth={2}
      width={60}
      x={18}
      y={62}
    />
  </>
)

const ART = { favorites: FavoritesArt, search: SearchArt, squads: SquadsArt } as const

/**
 * Draws the chosen illustration on its round wash. Decorative, so hidden from assistive technology.
 * @returns The SVG.
 */
const EmptyArt = ({ kind }: EmptyArtProps): ReactElement => {
  const { roles } = useTheme()
  const Art = ART[kind]

  return (
    <Svg aria-hidden height={96} viewBox="0 0 96 96" width={96}>
      <Circle cx={48} cy={48} fill={roles['accent-soft']} r={48} />
      <Art roles={roles} />
    </Svg>
  )
}

/**
 * A centred placeholder for a screen or list with nothing in it yet: an illustration, a headline, an explanation and an optional action.
 * @returns The placeholder.
 */
export const EmptyState = ({
  action,
  art = 'squads',
  body,
  title,
}: EmptyStateProps): ReactElement => (
  <View className="items-center gap-2 px-6 pt-12 pb-8">
    <View className="mb-4">
      <EmptyArt kind={art} />
    </View>
    <Text className="text-center" heading={2} variant="heading">
      {title}
    </Text>
    {body === undefined ? null : (
      <Text className="mb-4 max-w-70 text-center" tone="muted" variant="body-sm">
        {body}
      </Text>
    )}
    {action}
  </View>
)
