/** Whether the person let the app read their contacts. */
export type TContactsPermission = 'denied' | 'granted'

/**
 * Where core reads phone numbers from the person's address book. The real source reads
 * expo-contacts on iOS and Android; tests pass a fake through CoreProvider. It reads phone numbers
 * and nothing else: never names, photos or addresses.
 */
export interface IContactsSource {
  /** Asks for access to the contacts, or reports the answer already given. */
  requestPermission: () => Promise<TContactsPermission>
  /** Reads every phone number in the address book, as written there. Needs access first. */
  phoneNumbers: () => Promise<string[]>
}
