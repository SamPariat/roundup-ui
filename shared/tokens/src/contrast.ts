// WCAG 2 contrast, used by the accessibility tests and by the glass fallback check.
const channel = (value: number): number => {
  const scaled = value / 255

  return scaled <= 0.039_28 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4
}

const luminance = (hex: string): number => {
  const digits = hex.replace('#', '')

  const [red = 0, green = 0, blue = 0] = [0, 2, 4].map((start) =>
    Number.parseInt(digits.slice(start, start + 2), 16),
  )

  return 0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue)
}

export const contrastRatio = (foreground: string, background: string): number => {
  const [lighter, darker] = [luminance(foreground), luminance(background)].toSorted((a, b) => b - a)

  return ((lighter ?? 0) + 0.05) / ((darker ?? 0) + 0.05)
}
