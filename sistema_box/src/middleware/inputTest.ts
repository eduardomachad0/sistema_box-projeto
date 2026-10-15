import { type } from 'arktype'
import type { Context, Next } from 'hono'

export function ffInputType(schema: any) {
  return async function(c: Context, next: Next) {
    const body = await c.req.json()
    const out = schema({
      ...body,
      ...c.req.param()
    })
    if (out instanceof type.errors)
      return c.json(out.summary, { status: 400 })
    return next()
  }
}