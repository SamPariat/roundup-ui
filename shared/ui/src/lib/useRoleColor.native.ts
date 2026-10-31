import { useUnstableNativeVariable } from 'nativewind'

import type { RoleColor } from './useRoleColor.ts'

// The package's types resolve to its web build, whose stub takes no argument; the native build takes the name.
const useVariable = useUnstableNativeVariable as (name: string) => unknown

/**
 * A role colour for the few props that cannot take a className, such as a placeholder or a glass
 * tint. It reads the theme's CSS variable from react-native-css, so it re-renders when the
 * theme changes.
 * @param role - The role to read.
 * @returns The colour the theme currently gives the role.
 */
export const useRoleColor = (role: RoleColor): string => String(useVariable(`--color-${role}`))
