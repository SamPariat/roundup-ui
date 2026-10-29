import { serve } from '@hono/node-server'

import { createApp } from './app.ts'
import { readServerEnv } from './env.ts'

const env = readServerEnv(process.env, process.cwd())

const server = serve({ fetch: createApp(env).fetch, port: env.port }, (info) => {
  console.log(`roundup web listening on :${String(info.port)}, serving ${env.distDir}`)
})

// Cloud Run and Docker send SIGTERM on shutdown: stop accepting connections, let requests finish.
const shutdown = (signal: string): void => {
  console.log(`${signal} received, shutting down`)

  server.close((error) => {
    // Setting the exit code lets Node leave on its own once the last connection is gone.
    process.exitCode = error === undefined ? 0 : 1
  })
}

process.once('SIGTERM', () => {
  shutdown('SIGTERM')
})

process.once('SIGINT', () => {
  shutdown('SIGINT')
})
