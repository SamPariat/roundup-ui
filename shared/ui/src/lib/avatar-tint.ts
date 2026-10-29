export type AvatarTint = 1 | 2 | 3 | 4 | 5 | 6

export const initialsOf = (name: string): string => {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? '?'
  const last = parts.length > 1 ? (parts.at(-1)?.[0] ?? '') : ''

  return `${first}${last}`.toUpperCase()
}

// A stable tint per person: the same ID always lands on the same one of the six.
export const tintOf = (key: string): AvatarTint => {
  let hash = 0

  for (const char of key) hash = Math.trunc(hash * 31 + (char.codePointAt(0) ?? 0))

  return ((Math.abs(hash) % 6) + 1) as AvatarTint
}
