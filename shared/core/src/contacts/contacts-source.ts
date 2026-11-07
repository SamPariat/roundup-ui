import { Contact, ContactField, requestPermissionsAsync } from 'expo-contacts'

import type { IContactsSource } from './types'

/**
 * Builds the contacts source. Static methods only. The web version of this file
 * (contacts-source.web.ts) has the same class and API.
 */
export class ContactsSource {
  /**
   * The native contacts source on expo-contacts. It asks only for the phone numbers field, so the
   * names, photos and addresses of the address book are never read. Limited access on iOS 18 counts
   * as granted: the person chose which contacts to share.
   * @returns A source that reads the device's address book.
   */
  static create(): IContactsSource {
    return {
      /**
       * Reads the numbers of every contact the app may see, as one flat list: a contact holds a list
       * of phones, and each phone may or may not have a number.
       * @returns Every number in the address book, as written there.
       */
      phoneNumbers: async (): Promise<string[]> => {
        const contacts = await Contact.getAllDetails([ContactField.PHONES])
        const phones = contacts.flatMap((contact) => contact.phones)

        return phones
          .map((phone) => phone.number)
          .filter((number): number is string => number !== undefined)
      },
      /**
       * Shows the system prompt the first time, and reports the saved answer afterwards.
       * @returns Whether access was granted.
       */
      requestPermission: async () => {
        const { granted } = await requestPermissionsAsync()

        return granted ? 'granted' : 'denied'
      },
    }
  }
}
