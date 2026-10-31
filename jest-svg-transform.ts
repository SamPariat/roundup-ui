// Jest transformer for .svg imports. It runs the same SVGR step as Metro's
// react-native-svg-transformer (native output, so <Svg>, <Path> and friends), then lets
// babel-jest compile the JSX, so tests render the real artwork and can read its fills.
// Jest requires modules synchronously, so this uses SVGR's synchronous API.
import { transform as svgr } from '@svgr/core'
import jsx from '@svgr/plugin-jsx'
import babelJest from 'babel-jest'

/** The synchronous part of babel-jest that this transformer calls. */
interface SyncBabelTransformer {
  /** Compiles a source file. */
  process: (source: string, filename: string, options: unknown) => unknown
}

// babel-jest types createTransformer as sync-or-async; with no async config it is always sync.
const babel = babelJest.createTransformer({
  babelrc: false,
  configFile: false,
  presets: ['babel-preset-expo'],
}) as unknown as SyncBabelTransformer

/**
 * Turns an imported .svg into a component module.
 * @param source - The SVG text.
 * @param filename - Its path.
 * @param options - Jest's transform options, passed on to Babel.
 * @returns The compiled module.
 */
const process = (source: string, filename: string, options: unknown): unknown => {
  const component = svgr.sync(source, { native: true, plugins: [jsx] }, { filePath: filename })

  return babel.process(component, `${filename}.jsx`, options)
}

export default { process }
