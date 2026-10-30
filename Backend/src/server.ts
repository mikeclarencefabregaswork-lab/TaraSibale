import { createApp } from './app.js'
import { checkDatabase, pool } from './db.js'

const port = Number(process.env.PORT ?? 3001)
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535.')
}
const host = process.env.HOST ?? '127.0.0.1'
const server = createApp(checkDatabase, pool).listen(port, host, () => {
  console.log(`Backend listening at http://${host}:${port}`)
})

server.on('error', (error: NodeJS.ErrnoException) => {
  console.error(`Backend failed to listen: ${error.code ?? 'unknown error'}`)
  void pool.end().finally(() => process.exit(1))
})

let shuttingDown = false
function shutdown() {
  if (shuttingDown) return
  shuttingDown = true
  const timeout = setTimeout(() => process.exit(1), 10000)
  timeout.unref()
  server.close(() => {
    void pool.end().then(
      () => { clearTimeout(timeout) },
      () => { process.exitCode = 1; clearTimeout(timeout) },
    )
  })
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
