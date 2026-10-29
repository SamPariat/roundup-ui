import '@testing-library/react-native'

// Importing the package initialises i18next with the bundled English strings, so tests query the
// real copy.
import '@roundup/i18n'

// AsyncStorage ships a Jest mock; theme persistence tests rely on it.
jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual<object>('@react-native-async-storage/async-storage/jest/async-storage-mock'),
)
