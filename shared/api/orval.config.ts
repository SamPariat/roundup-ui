import { existsSync } from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'orval'

/** Where the sibling roundup-monorepo checkout keeps the spec, relative to this package. */
const DEFAULT_SPEC = '../../../roundup-monorepo/shared/api/openapi.yaml'

const spec = path.resolve(import.meta.dirname, process.env['ROUNDUP_API_SPEC'] ?? DEFAULT_SPEC)

if (!existsSync(spec)) {
  throw new Error(
    `No API spec at ${spec}: clone SamPariat/roundup next to roundup-ui or set ROUNDUP_API_SPEC`,
  )
}

// The client is generated from the gateway's OpenAPI file and committed, so CI never needs the Go
// repo. Every call goes through the hand-written mutator in src/fetcher.ts.
export default defineConfig({
  roundup: {
    // Internal routes (tagged Internal) are service to service: the gateway never exposes them, so
    // the app has no use for a client of them.
    input: { target: spec, filters: { mode: 'exclude', tags: ['Internal'] } },
    output: {
      client: 'react-query',
      httpClient: 'fetch',
      mode: 'tags-split',
      target: 'src/generated/endpoints.ts',
      schemas: 'src/generated/models',
      clean: true,
      // Extensionless imports in the output, like the rest of the repo: orval adds .ts when the tsconfig allows importing it.
      tsconfig: { compilerOptions: { moduleResolution: 'bundler' } },
      override: {
        // Hooks return the response body (the {success, data} envelope), not {data, status, headers}:
        // src/fetcher.ts throws an ApiError for any non-2xx status, so the status is always a success.
        fetch: { includeHttpResponseReturnType: false },
        mutator: { path: 'src/fetcher.ts', name: 'fetcher' },
      },
    },
    // The repo's Prettier config (no semicolons, single quotes) applies to the output too.
    hooks: { afterAllFilesWrite: 'prettier --write' },
  },
})
