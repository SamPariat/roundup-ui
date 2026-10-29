import '@testing-library/react-native'

// AsyncStorage ships a Jest mock; theme persistence tests rely on it.
jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual<object>('@react-native-async-storage/async-storage/jest/async-storage-mock'),
)
