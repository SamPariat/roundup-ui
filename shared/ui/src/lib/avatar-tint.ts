/** Which of the six avatar-* role colours fills the initials circle. */
export type AvatarTint = 1 | 2 | 3 | 4 | 5 | 6

/**
 * Takes the initials of a name: first letter of the first and last words, uppercased; `?` for an empty name.
 * @param name - A person or squad name.
 * @returns The one or two initials.
 */
export const initialsOf = (name: string): string => {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? '?'
  const last = parts.length > 1 ? (parts.at(-1)?.[0] ?? '') : ''

  return `${first}${last}`.toUpperCase()
}

/**
 * Hashes a key to one of the six tints, so the same person always gets the same colour.
 * A stable tint per person: the same ID always lands on the same one of the six.
 * @param key - A stable ID, or the name when there is no ID.
 * @returns A tint number from 1 to 6.
 */
export const tintOf = (key: string): AvatarTint => {
  let hash = 0

  for (const char of key) hash = Math.trunc(hash * 31 + (char.codePointAt(0) ?? 0))

  return ((Math.abs(hash) % 6) + 1) as AvatarTint
}
