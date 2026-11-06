import type { IContactsSource } from './types'

/**
 * Builds the contacts source. Static methods only. The native version of this file
 * (contacts-source.ts) has the same class and API.
 */
export class ContactsSource {
  /**
   * The web contacts source. A browser has no address book to read, so the Add people dialog asks
   * for a typed number there and never calls this; it answers denied and holds no numbers, so
   * nothing here can load expo-contacts into the web build.
   * @returns A source with no access.
   */
  static create(): IContactsSource {
    return {
      /**
       * Nothing to read in a browser.
       * @returns Always an empty list.
       */
      phoneNumbers: () => Promise.resolve([]),
      /**
       * A browser cannot be given access.
       * @returns Always denied.
       */
      requestPermission: () => Promise.resolve('denied'),
    }
  }
}
