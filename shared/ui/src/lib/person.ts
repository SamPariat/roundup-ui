/** Who a person is, as much as an Avatar needs to draw them. */
export interface Person {
  /** Stable ID; picks the initials tint so it stays the same across screens. */
  id?: string
  /** Display name, also the avatar's accessible name. */
  name: string
  /** Photo URL. Without it the initials are drawn. */
  src?: string
}
