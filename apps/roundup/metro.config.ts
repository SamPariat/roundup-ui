import { getDefaultConfig } from 'expo/metro-config'
import { withNativewind } from 'nativewind/metro'

/** The file extension lists of Metro's resolver. */
interface Extensions {
  /** Extensions Metro copies as assets. */
  assetExts: string[]
  /** Extensions Metro compiles as code. */
  sourceExts: string[]
}

/** The parts of Expo's Metro config that this file reads. */
interface TouchedConfig {
  /** Resolution settings, of which the file extension lists are changed. */
  resolver: Extensions
  /** Transform settings, spread through unchanged except for the Babel transformer. */
  transformer: object
}

// Metro loads this file as CommonJS, where __dirname is the only way to name the project root.
// eslint-disable-next-line unicorn/prefer-module -- see the comment above
const defaults = getDefaultConfig(__dirname)

// SVG files in assets/svg become components. react-native-svg-transformer/expo is the Expo entry
// of the transformer (it wraps Expo's own Babel transformer). It sets babelTransformerPath, which
// NativeWind's withNativewind below leaves alone: NativeWind replaces transformerPath, the worker
// that calls the Babel transformer, and spreads config.transformer through. svg moves from the
// asset extensions to the source extensions so Metro compiles it instead of copying it. Expo's
// Metro types do not resolve from this package, so the two fields touched are typed here.
const { resolver, transformer } = defaults as unknown as TouchedConfig

const config = {
  ...defaults,
  transformer: {
    ...transformer,
    // eslint-disable-next-line unicorn/prefer-module -- Metro loads this file as CommonJS
    babelTransformerPath: require.resolve('react-native-svg-transformer/expo'),
  },
  resolver: {
    ...resolver,
    assetExts: resolver.assetExts.filter((extension) => extension !== 'svg'),
    sourceExts: [...resolver.sourceExts, 'svg'],
  },
}

// Role colours change with the theme (prefers-color-scheme), so no variable may be inlined at build time.
export default withNativewind(config, {
  // Tailwind's default scales are in rem (h-12 is 3rem). react-native-css inlines rem at 14 on
  // native unless told otherwise, which would make every default class 12.5% smaller than on web,
  // where 1rem is 16px. Pin it so a class is the same size on every platform.
  inlineRem: 16,
  inlineVariables: false,
})
