/**
 * Builds addresses on the Roundup API. Static methods only.
 */
export class ApiUrl {
  /**
   * Turns a path the API sends, such as a venue photo's, into an address an image can load. The
   * variable is written out in full because Expo inlines EXPO_PUBLIC_* only for that literal.
   * @param path - The path on the API, starting with a slash.
   * @returns The absolute address.
   */
  static of(path: string): string {
    return `${process.env.EXPO_PUBLIC_API_URL}${path}`
  }
}
