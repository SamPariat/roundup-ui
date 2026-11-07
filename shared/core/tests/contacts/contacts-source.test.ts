import { Contact, ContactField, requestPermissionsAsync } from 'expo-contacts'

import { ContactsSource } from '../../src/contacts/contacts-source'

/** What the permission request answers. */
type TPermission = Awaited<ReturnType<typeof requestPermissionsAsync>>

/** What reading the contacts answers. */
type TDetails = Awaited<ReturnType<typeof Contact.getAllDetails>>

describe('native contacts source', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it.each([
    [true, 'granted'],
    [false, 'denied'],
  ] as const)('reads a permission of granted=%s as %s', async (granted, expected) => {
    jest.mocked(requestPermissionsAsync).mockResolvedValue({ granted } as TPermission)

    await expect(ContactsSource.create().requestPermission()).resolves.toBe(expected)
  })

  it('reads the phone numbers field only and returns every number', async () => {
    const getAll = jest.mocked(Contact.getAllDetails)

    getAll.mockResolvedValue([
      {
        id: '1',
        phones: [
          { id: 'a', number: '98765 43210' },
          { id: 'b', number: '+91 99999 11111' },
        ],
      },
      { id: '2', phones: [] },
      { id: '3', phones: [{ id: 'c' }] },
    ] as TDetails)

    await expect(ContactsSource.create().phoneNumbers()).resolves.toEqual([
      '98765 43210',
      '+91 99999 11111',
    ])

    expect(getAll).toHaveBeenCalledWith([ContactField.PHONES])
  })
})

describe('web contacts source', () => {
  // Jest resolves the extensionless import to the native file, so the web one is loaded by its full name.
  const web = jest.requireActual<{
    /** The web class. */
    ContactsSource: typeof ContactsSource
  }>('../../src/contacts/contacts-source.web.ts').ContactsSource

  it('has no address book to read', async () => {
    const source = web.create()

    await expect(source.requestPermission()).resolves.toBe('denied')
    await expect(source.phoneNumbers()).resolves.toEqual([])
  })
})
