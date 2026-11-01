// Stylesheets are handled by Metro, not TypeScript.
declare module '*.css'

// Fonts are Metro assets: importing one gives the asset reference expo-font loads.
declare module '*.ttf' {
  /** The bundled asset's module id. */
  const asset: number

  export default asset
}
