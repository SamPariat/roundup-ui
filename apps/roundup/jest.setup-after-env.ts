import '@testing-library/react-native'

// Importing the package initializes i18next with the bundled English strings, so tests query the
// real copy.
import '@roundup/i18n'

// AsyncStorage ships a Jest mock; the theme provider saves to it.
jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual<object>('@react-native-async-storage/async-storage/jest/async-storage-mock'),
)

// Worklets needs its native module, so its Jest mock stands in. Reanimated cannot load under Jest
// here (its native initializer installs a CSS handler its JS module lacks), so shared/ui's stand-in
// covers the APIs the UI uses; its animations end at once on their targets.
// expo-router/testing-library mocks Reanimated again with react-native-reanimated/mock, which loads
// the real package, so that path serves the stand-in too.
jest.mock('react-native-worklets', () =>
  jest.requireActual<object>('react-native-worklets/lib/module/mock'),
)

jest.mock(
  'react-native-reanimated',
  () =>
    jest.requireActual<{
      /**
       *
       */
      reanimatedModule: object
    }>('../../shared/ui/tests/helpers/reanimated').reanimatedModule,
)

jest.mock(
  'react-native-reanimated/mock',
  () =>
    jest.requireActual<{
      /**
       *
       */
      reanimatedModule: object
    }>('../../shared/ui/tests/helpers/reanimated').reanimatedModule,
)

// React Native's Modal mock never calls onDismiss; this stand-in does once it hides, as iOS does,
// so code that waits for one Modal to go before opening another runs as it does on a phone.
jest.mock(
  'react-native/Libraries/Modal/Modal',
  () =>
    jest.requireActual<{
      /** The stand-in's module. */
      modalModule: object
    }>('../../shared/ui/tests/helpers/modal').modalModule,
)
