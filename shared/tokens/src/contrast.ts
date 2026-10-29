/**
 * WCAG 2 contrast, used by the accessibility tests and by the glass fallback check. This step
 * linearises one sRGB channel.
 * @param value - The channel, 0 to 255.
 * @returns The linear light value from 0 to 1.
 */
const channel = (value: number): number => {
  const scaled = value / 255

  return scaled <= 0.039_28 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4
}

/**
 * Relative luminance of a colour, per WCAG 2.
 * @param hex - A colour as #rrggbb.
 * @returns A number from 0 (black) to 1 (white).
 */
const luminance = (hex: string): number => {
  const digits = hex.replace('#', '')

  const [red = 0, green = 0, blue = 0] = [0, 2, 4].map((start) =>
    Number.parseInt(digits.slice(start, start + 2), 16),
  )

  return 0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue)
}

/**
 * WCAG contrast ratio between two colours.
 * @param foreground - The text or icon colour.
 * @param background - The colour it sits on.
 * @returns A ratio from 1 to 21.
 */
export const contrastRatio = (foreground: string, background: string): number => {
  const [lighter, darker] = [luminance(foreground), luminance(background)].toSorted((a, b) => b - a)

  return ((lighter ?? 0) + 0.05) / ((darker ?? 0) + 0.05)
}
