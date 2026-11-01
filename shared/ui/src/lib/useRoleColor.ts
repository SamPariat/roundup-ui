/** Role colours that a prop (not a class) has to receive. */
export type RoleColor = 'accent' | 'bg' | 'bg-raised' | 'bg-sunken' | 'fg-subtle'

/**
 * A role colour for the few props that cannot take a className, such as a placeholder or a glass
 * tint. On the web the stylesheet resolves a CSS variable, so the string is returned as it is and
 * follows the theme with no re-render. Native has its own version (useRoleColor.native.ts).
 * @param role - The role to read.
 * @returns A value for a colour prop.
 */
// eslint-disable-next-line @eslint-react/no-unnecessary-use-prefix -- the native version of this file calls a hook, and both export the same name
export const useRoleColor = (role: RoleColor): string => `var(--color-${role})`
