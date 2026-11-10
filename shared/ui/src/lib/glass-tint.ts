/**
 * Glass tint helpers. Static methods only.
 */
export class GlassTint {
  /**
   * How much of the role color Liquid Glass takes: enough to keep the theme's color, little enough
   * that what is behind shows through. An opaque tint turns the glass into a flat fill.
   */
  static readonly panelStrength = 0.5

  /**
   * Makes a role color see-through for a glass tint, by adding an alpha channel to a #rrggbb color.
   * A color in any other form (a CSS variable on the web, where glass is never drawn) is returned as
   * it is.
   * @param color - The role color, as useRoleColor gives it.
   * @param alpha - How opaque the tint is, from 0 to 1.
   * @returns The color with the alpha channel added.
   */
  static of(color: string, alpha: number = GlassTint.panelStrength): string {
    if (color.length !== 7 || !color.startsWith('#')) return color

    const channel = Math.round(alpha * 255)
      .toString(16)
      .padStart(2, '0')

    return `${color}${channel}`
  }
}
