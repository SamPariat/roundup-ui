// Tests run with the beta API address, as a developer's .env.beta would have it.
process.env.EXPO_PUBLIC_API_URL = 'http://localhost:8080'
process.env.APP_ENV = 'beta'

// expo-contacts builds classes on its native module, which Jest does not have, so even loading it
// fails. Tests that read contacts use a fake source; this keeps loading the module harmless.
jest.mock('expo-contacts', () => ({
  Contact: { getAllDetails: jest.fn() },
  ContactField: { PHONES: 'phones' },
  requestPermissionsAsync: jest.fn(),
}))

// expo-location needs its native module just to load, which Jest does not have. Tests that read the
// position use a fake source; this keeps loading the module harmless.
jest.mock('expo-location', () => ({
  Accuracy: { Balanced: 3 },
  getCurrentPositionAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
}))

// The native date and time picker needs its native module, which Jest does not have; shared/ui's
// stand-in is a button whose press picks the moment an hour later, and the Android dialog is a mock.
jest.mock(
  '@react-native-community/datetimepicker',
  () =>
    jest.requireActual<{
      /** The stand-in's module. */
      datetimepickerModule: object
    }>('../../shared/ui/tests/helpers/datetimepicker').datetimepickerModule,
)
