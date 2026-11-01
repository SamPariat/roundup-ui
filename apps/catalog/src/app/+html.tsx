import type { ReactElement } from 'react'

import { ScrollViewStyleReset, useServerDocumentContext } from 'expo-router/html'

// Shown over the static page until the client takes over (useSplash removes it). It is fixed to
// the viewport, so it never moves the page underneath: no layout shift. The colours are the
// theme's own variables, so it follows prefers-color-scheme and the saved manual choice.
const SPLASH_CSS = `
#splash {
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  display: grid;
  place-items: center;
  background: var(--color-bg);
  transition: opacity 200ms ease-out;
}
#splash.splash-hidden {
  opacity: 0;
  pointer-events: none;
}
#splash svg { width: 96px; height: 96px; }
#splash rect { fill: var(--color-logo-stem); }
#splash circle:first-of-type { fill: var(--color-logo-bowl); }
#splash circle:last-of-type { fill: var(--color-logo-leg); }
@media (prefers-reduced-motion: reduce) {
  #splash { transition: none; }
}
`

// Applies a saved manual theme before the first paint, so a person who chose a theme never sees
// the other one flash. The key is the one ThemeProvider saves to (AsyncStorage uses localStorage
// on the web).
const THEME_SCRIPT = `
try {
  var theme = localStorage.getItem('roundup.theme')
  if (theme === 'light' || theme === 'dark') {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
  }
} catch (error) {}
`

/** Props of the root HTML document. */
interface RootProps {
  /** The rendered app. */
  children: ReactElement
}

/**
 * The HTML document around every page of the static export: the splash mark, the theme script, the
 * reset styles React Native Web needs, and the stylesheets, fonts and scripts that the export
 * hands over (headNodes, bodyNodes). Server-only: it never runs in the browser.
 * @returns The html element.
 */
export default function Root({ children }: Readonly<RootProps>): ReactElement {
  const { bodyAttributes, bodyNodes, headNodes, htmlAttributes } = useServerDocumentContext()

  return (
    <html lang="en" {...htmlAttributes}>
      <head>
        <meta charSet="utf-8" />
        <meta content="IE=edge" httpEquiv="X-UA-Compatible" />
        <meta content="width=device-width, initial-scale=1, shrink-to-fit=no" name="viewport" />
        <ScrollViewStyleReset />
        {/* eslint-disable-next-line @eslint-react/dom-no-dangerously-set-innerhtml -- fixed strings written in this file, not user input */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        {/* eslint-disable-next-line @eslint-react/dom-no-dangerously-set-innerhtml -- fixed string written in this file, not user input */}
        <style dangerouslySetInnerHTML={{ __html: SPLASH_CSS }} />
        {headNodes}
      </head>
      <body {...bodyAttributes}>
        <div aria-hidden="true" id="splash">
          <svg focusable="false" viewBox="0 0 32 32">
            <rect height="28" rx="5.5" width="11" x="2" y="2" />
            <circle cx="21" cy="10" r="8" />
            <circle cx="24" cy="25" r="5" />
          </svg>
        </div>
        {children}
        {bodyNodes}
      </body>
    </html>
  )
}
