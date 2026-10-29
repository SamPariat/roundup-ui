import type { ReactElement, ReactNode } from 'react'

import { View } from 'react-native'
import Svg, { Circle, Path, Rect } from 'react-native-svg'

import { Text } from '../Text/Text.tsx'
import { useTheme } from '../theme/theme.tsx'

export interface EmptyStateProps {
  title: string
  body?: string
  art?: 'favorites' | 'search' | 'squads'
  action?: ReactNode
}

// Shapes only: discs and pills from the radius scale, in role colours.
const EmptyArt = ({ kind }: { kind: NonNullable<EmptyStateProps['art']> }): ReactElement => {
  const { roles } = useTheme()
  const wash = roles['accent-soft']
  const edge = roles['border-strong']
  const raised = roles['bg-raised']

  return (
    <Svg aria-hidden height={96} viewBox="0 0 96 96" width={96}>
      <Circle cx={48} cy={48} fill={wash} r={48} />
      {kind === 'search' ? (
        <>
          <Circle cx={44} cy={44} fill={raised} r={20} stroke={edge} strokeWidth={2} />
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
      ) : kind === 'favorites' ? (
        <>
          <Path d="M32 22h32v54l-16-11-16 11z" fill={roles.accent} />
          <Circle cx={70} cy={26} fill={roles.highlight} r={8} />
        </>
      ) : (
        <>
          <Circle cx={36} cy={42} fill={roles.accent} r={14} />
          <Circle cx={62} cy={46} fill={roles.highlight} r={11} />
          <Rect
            fill={raised}
            height={16}
            rx={8}
            stroke={edge}
            strokeWidth={2}
            width={60}
            x={18}
            y={62}
          />
        </>
      )}
    </Svg>
  )
}

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
      <Text className="mb-4 max-w-[280px] text-center" tone="muted" variant="body-sm">
        {body}
      </Text>
    )}
    {action}
  </View>
)
