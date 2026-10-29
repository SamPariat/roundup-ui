import type { ReactElement, ReactNode } from 'react'

import { Children, isValidElement } from 'react'
import { View } from 'react-native'

/** A rounded container that draws dividers between ListRows. */
export const List = ({ children }: { children?: ReactNode }): ReactElement => (
  <View className="overflow-hidden rounded-2xl border border-border bg-bg-raised" role="list">
    {/* eslint-disable-next-line @eslint-react/no-children-to-array -- the divider belongs to every row but the first, so the rows must be enumerated */}
    {Children.toArray(children).map((row, position) => (
      <View
        className={position === 0 ? '' : 'border-t border-border'}
        // eslint-disable-next-line @eslint-react/no-array-index-key -- Children.toArray keys every element; only text nodes fall back to their position
        key={isValidElement(row) ? row.key : position}
        role="listitem"
      >
        {row}
      </View>
    ))}
  </View>
)
