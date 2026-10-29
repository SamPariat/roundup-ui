// Jest transformer for .svg imports. It runs the same SVGR step as Metro's
// react-native-svg-transformer (native output, so <Svg>, <Path> and friends), then lets
// babel-jest compile the JSX, so tests render the real artwork and can read its fills.
// Jest requires modules synchronously, so this uses SVGR's synchronous API.
import { transform as svgr } from '@svgr/core'
import jsx from '@svgr/plugin-jsx'
import babelJest from 'babel-jest'

interface SyncBabelTransformer {
  process: (source: string, filename: string, options: unknown) => unknown
}

// babel-jest types createTransformer as sync-or-async; with no async config it is always sync.
const babel = babelJest.createTransformer({
  babelrc: false,
  configFile: false,
  presets: ['babel-preset-expo'],
}) as unknown as SyncBabelTransformer

const process = (source: string, filename: string, options: unknown): unknown => {
  const component = svgr.sync(source, { native: true, plugins: [jsx] }, { filePath: filename })

  return babel.process(component, `${filename}.jsx`, options)
}

export default { process }
