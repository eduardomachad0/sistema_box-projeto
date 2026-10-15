import { routes } from './routes'
import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'

const app = new Hono()
app.route("/", routes)
app.use("/*", serveStatic({ root: "./public" }))

Bun.serve({
  port: 3000,
  fetch: app.fetch,
})
